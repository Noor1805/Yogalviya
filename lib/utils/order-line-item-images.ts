import Product from '@/lib/models/Product';
import type { ILineItem } from '@/lib/models/Order';
import {
  findBestMediaVariation,
  getPrimaryVariantImage,
  type VariantSelectionVariation,
} from '@/lib/utils/product-variant-selection';

type ProductVariationMediaSource = {
  id?: string;
  sku?: string;
  attributes?: Record<string, string>;
  image?: string;
  gallery?: string[];
};

type ProductMediaSource = {
  _id?: unknown;
  productType?: 'simple' | 'variable';
  mainImage?: string;
  variations?: ProductVariationMediaSource[];
};

const toVariantSelectionVariation = (
  variation: ProductVariationMediaSource
): VariantSelectionVariation => ({
  id: variation.id || variation.sku || '',
  attributes: variation.attributes || {},
  image: variation.image,
  gallery: variation.gallery,
});

export const resolveLineItemImageFromProduct = ({
  product,
  sku,
  fallbackImage,
}: {
  product?: ProductMediaSource | null;
  sku: string;
  fallbackImage?: string;
}) => {
  const heroImage = product?.mainImage || fallbackImage || '';

  if (!product || product.productType !== 'variable' || !product.variations?.length) {
    return heroImage;
  }

  const selectedVariation = product.variations.find((variation) => variation.sku === sku);
  if (!selectedVariation) {
    return heroImage;
  }

  const mediaVariation = findBestMediaVariation(
    product.variations.map(toVariantSelectionVariation),
    selectedVariation.attributes || {}
  );

  return getPrimaryVariantImage({
    heroImage,
    mediaVariation,
    fallbackVariation: toVariantSelectionVariation(selectedVariation),
  });
};

export const resolveOrderLineItemImages = async <T extends ILineItem>(lineItems: T[]) => {
  const productIds = [...new Set(lineItems.map((item) => item.productId).filter(Boolean))];

  if (productIds.length === 0) {
    return lineItems;
  }

  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: { $ne: true },
  })
    .select('_id productType mainImage variations')
    .lean<ProductMediaSource[]>();

  const productsById = new Map(products.map((product) => [String(product._id), product]));

  return lineItems.map((item) => {
    const product = productsById.get(item.productId);
    const resolvedImage = resolveLineItemImageFromProduct({
      product,
      sku: item.sku,
      fallbackImage: item.image,
    });

    return {
      ...item,
      image: resolvedImage || item.image,
    };
  });
};
