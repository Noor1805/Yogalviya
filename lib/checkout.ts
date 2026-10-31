import mongoose from 'mongoose';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import {
  checkoutCustomerNameSchema,
  checkoutEmailSchema,
  checkoutPhoneSchema,
  checkoutShippingAddressSchema,
  getCheckoutPhoneError,
  isValidCheckoutPhone,
  normalizeCheckoutPhone,
  normalizeCheckoutPostalCode,
} from '@/lib/validations/checkout';
import { resolveLineItemImageFromProduct } from '@/lib/utils/order-line-item-images';

const lineItemSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutValidationError';
  }
}

export const checkoutPayloadSchema = z
  .object({
    customerEmail: checkoutEmailSchema,
    customerName: checkoutCustomerNameSchema,
    customerPhone: checkoutPhoneSchema,
    currency: z.enum(['INR', 'USD']).default('INR'),
    paymentGateway: z.enum(['razorpay', 'cod']),
    shippingMethod: z.enum(['standard', 'express']).default('standard'),
    couponCode: z.string().trim().max(50).optional().or(z.literal('')),
    lineItems: z.array(lineItemSchema).min(1).max(20),
    shippingAddress: checkoutShippingAddressSchema,
  })
  .superRefine((data, ctx) => {
    if (!isValidCheckoutPhone(data.customerPhone, data.shippingAddress.country)) {
      ctx.addIssue({
        code: 'custom',
        path: ['customerPhone'],
        message: getCheckoutPhoneError(data.shippingAddress.country),
      });
    }
  });

type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

const SHIPPING_COSTS = {
  standard: 0,
  express: 50,
} as const;

function toMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

export async function buildCheckoutPricing(input: CheckoutPayload) {
  await dbConnect();

  const uniqueProductIds = [...new Set(input.lineItems.map((item) => item.productId))];
  const validObjectIds = uniqueProductIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const otherIds = uniqueProductIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));

  const orQueries: Record<string, unknown>[] = [];
  if (validObjectIds.length > 0) {
    orQueries.push({ _id: { $in: validObjectIds } });
  }
  if (otherIds.length > 0) {
    orQueries.push({ slug: { $in: otherIds } });
    orQueries.push({ sku: { $in: otherIds.map((s) => s.toUpperCase()) } });
  }

  const query =
    orQueries.length > 1
      ? { $or: orQueries, isDeleted: { $ne: true }, status: 'published' }
      : orQueries.length === 1
      ? { ...orQueries[0], isDeleted: { $ne: true }, status: 'published' }
      : { _id: { $in: uniqueProductIds }, isDeleted: { $ne: true }, status: 'published' };

  const products = await Product.find(query)
    .select('name slug productType price sku stockCount mainImage variations categorySlug')
    .lean();

  const productsById = new Map<string, (typeof products)[0]>();
  for (const product of products) {
    productsById.set(String(product._id), product);
    if (product.slug) productsById.set(product.slug, product);
    if (product.sku) productsById.set(product.sku.toUpperCase(), product);
  }

  const canonicalLineItems = input.lineItems.map((item) => {
    const product =
      productsById.get(item.productId) ||
      (item.sku ? productsById.get(item.sku.toUpperCase()) : undefined);
    if (!product) {
      throw new CheckoutValidationError('One or more products are unavailable.');
    }

    if (product.productType === 'variable') {
      const variation = product.variations?.find((entry) => entry.sku === item.sku);
      if (!variation) {
        throw new CheckoutValidationError(`Variant ${item.sku} is unavailable.`);
      }
      if (variation.stockCount < item.quantity) {
        throw new CheckoutValidationError(`Insufficient stock for ${product.name}.`);
      }

      return {
        productId: String(product._id),
        sku: variation.sku,
        name: product.name,
        quantity: item.quantity,
        priceAtPurchase: toMinorUnits(variation.price),
        image: resolveLineItemImageFromProduct({
          product,
          sku: variation.sku,
          fallbackImage: variation.image || product.mainImage || '',
        }),
        categorySlug: product.categorySlug,
      };
    }

    if (
      product.sku &&
      item.sku &&
      product.sku.toUpperCase() !== item.sku.toUpperCase()
    ) {
      throw new CheckoutValidationError(`Product ${product.name} no longer matches your cart.`);
    }

    if ((product.stockCount || 0) < item.quantity) {
      throw new CheckoutValidationError(`Insufficient stock for ${product.name}.`);
    }

    return {
      productId: String(product._id),
      sku: product.sku || item.sku,
      name: product.name,
      quantity: item.quantity,
      priceAtPurchase: toMinorUnits(product.price || 0),
      image: product.mainImage || '',
      categorySlug: product.categorySlug,
    };
  });

  const subtotalInCents = canonicalLineItems.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0
  );

  const shippingAmountInCents = toMinorUnits(SHIPPING_COSTS[input.shippingMethod]);
  const normalizedEmail = input.customerEmail.toLowerCase().trim();
  const normalizedCouponCode = input.couponCode?.trim().toUpperCase();

  let couponDiscount = 0;
  let appliedCouponCode: string | undefined;

  if (normalizedCouponCode) {
    const coupon = await Coupon.findOne({ code: normalizedCouponCode }).lean();
    if (!coupon) {
      throw new CheckoutValidationError('Invalid coupon code.');
    }

    const now = new Date();
    if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
      throw new CheckoutValidationError('This coupon is not active.');
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new CheckoutValidationError('This coupon has reached its usage limit.');
    }

    const subtotalBaseUnits = subtotalInCents / 100;
    if (coupon.minOrderAmount && subtotalBaseUnits < coupon.minOrderAmount) {
      throw new CheckoutValidationError('This coupon does not apply to your current subtotal.');
    }

    if (coupon.applicableProducts?.length) {
      const productIds = new Set(canonicalLineItems.map((item) => item.productId));
      const applies = coupon.applicableProducts.some((productId) => productIds.has(productId));
      if (!applies) {
        throw new CheckoutValidationError('This coupon does not apply to the selected products.');
      }
    }

    if (coupon.applicableCategories?.length) {
      const categorySlugs = new Set(canonicalLineItems.map((item) => item.categorySlug));
      const applies = coupon.applicableCategories.some((category) => categorySlugs.has(category));
      if (!applies) {
        throw new CheckoutValidationError('This coupon does not apply to the selected products.');
      }
    }

    if (coupon.maxUsesPerCustomer) {
      const priorUsageCount = await Order.countDocuments({
        customerEmail: normalizedEmail,
        couponCode: coupon.code,
        isDeleted: { $ne: true },
      });

      if (priorUsageCount >= coupon.maxUsesPerCustomer) {
        throw new CheckoutValidationError(`You can only use this coupon ${coupon.maxUsesPerCustomer} time(s).`);
      }
    }

    if (coupon.discountType === 'percentage') {
      couponDiscount = Math.round(subtotalInCents * (coupon.discountValue / 100));
      if (coupon.maxDiscountAmount) {
        couponDiscount = Math.min(couponDiscount, toMinorUnits(coupon.maxDiscountAmount));
      }
    } else {
      couponDiscount = toMinorUnits(coupon.discountValue);
    }

    couponDiscount = Math.min(couponDiscount, subtotalInCents + shippingAmountInCents);
    appliedCouponCode = coupon.code;
  }

  const totalInCents = subtotalInCents + shippingAmountInCents - couponDiscount;

  return {
    customerEmail: normalizedEmail,
    customerName: input.customerName.trim(),
    customerPhone: normalizeCheckoutPhone(input.customerPhone, input.shippingAddress.country) || undefined,
    currency: input.paymentGateway === 'razorpay' ? 'INR' : input.currency,
    paymentGateway: input.paymentGateway,
    shippingAddress: {
      ...input.shippingAddress,
      line1: input.shippingAddress.line1.trim(),
      line2: input.shippingAddress.line2?.trim() || undefined,
      city: input.shippingAddress.city.trim(),
      state: input.shippingAddress.state.trim(),
      postalCode: normalizeCheckoutPostalCode(
        input.shippingAddress.postalCode,
        input.shippingAddress.country
      ),
      country: input.shippingAddress.country.trim(),
    },
    lineItems: canonicalLineItems.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      image: item.image,
    })),
    subtotalInCents,
    shippingAmountInCents,
    couponCode: appliedCouponCode,
    couponDiscount,
    totalInCents,
  };
}
