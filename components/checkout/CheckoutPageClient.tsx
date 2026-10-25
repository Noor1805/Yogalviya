'use client';

import { useState, useSyncExternalStore, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  CheckCircle2,
  Loader2,
  Truck,
  ShieldCheck,
  Headphones,
  ShoppingBag,
  Minus,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCartStore, type CartItem } from '@/store/cart';
import { queueCheckoutSuccessCartClear } from '@/lib/utils/checkout-success';
import {
  getCheckoutFormErrors,
  getFirstCheckoutFormError,
  normalizeCheckoutFormData,
  normalizeCheckoutPhone,
  normalizeCheckoutPostalCode,
  type CheckoutFieldErrors,
  type CheckoutFormData,
  type CheckoutFormField,
} from '@/lib/validations/checkout';

type ShippingMethod = 'standard' | 'express';
type PaymentMethod = 'cod' | 'razorpay';
type SelectedPaymentOption = 'upi' | 'card' | 'netbanking' | 'cod';

type CheckoutPayload = {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  currency: 'INR' | 'USD';
  paymentGateway: PaymentMethod;
  shippingMethod: ShippingMethod;
  couponCode: string;
  lineItems: Array<{
    productId: string;
    sku: string;
    quantity: number;
  }>;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

type CheckoutResponse = {
  orderId?: string;
  orderNumber: string;
  razorpayOrderId?: string;
  amountInPaise?: number;
  totalInCents?: number;
  error?: string;
};

type RazorpaySuccessResponse = {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  callback_url?: string;
  redirect?: boolean;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayInstance = {
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void) => void;
  open: () => void;
  close?: () => void;
};

type RazorpayWindow = Window &
  typeof globalThis & {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  };

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  const razorpayWindow = window as RazorpayWindow;
  if (razorpayWindow.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (!razorpayWindow.Razorpay) {
        reject(new Error('Razorpay checkout is unavailable. Please choose Cash on Delivery.'));
        return;
      }
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Could not load Razorpay checkout. Please choose Cash on Delivery.'));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    razorpayScriptPromise = null;
    throw error;
  });

  return razorpayScriptPromise;
}

type SummaryItem = Pick<CartItem, 'productId' | 'sku' | 'name' | 'quantity' | 'image' | 'price'> & {
  color?: string;
  size?: string;
};

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const emptySubscribe = (() => () => {}) as (onStoreChange: () => void) => () => void;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const razorpayInstanceRef = useRef<RazorpayInstance | null>(null);
  const razorpayStatusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const razorpayStatusPollAbortRef = useRef<AbortController | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delivery & Payment
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<SelectedPaymentOption>('upi');
  const paymentMethod: PaymentMethod = selectedPaymentOption === 'cod' ? 'cod' : 'razorpay';

  // Coupons
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    description?: string;
  } | null>(null);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToSuccess, setIsRedirectingToSuccess] = useState(false);
  const [paymentTransitionStage, setPaymentTransitionStage] = useState<'idle' | 'finalizing' | 'confirmed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: 'India',
    city: '',
    address: '',
    zip: '',
    state: '',
  });

  // Hydration & Cart Store
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  // Populate from session if available
  useEffect(() => {
    if (session?.user) {
      const fullName = session.user.name || '';
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || session.user?.email || '',
      }));
    }
  }, [session]);

  // Handle URL errors
  useEffect(() => {
    const paymentError = searchParams.get('payment_error');
    if (paymentError) {
      setError(paymentError);
      setIsSubmitting(false);
      setIsRedirectingToSuccess(false);
      setPaymentTransitionStage('idle');
    }
  }, [searchParams]);

  // Cleanup polling & timeouts
  useEffect(() => {
    return () => {
      if (razorpayStatusPollRef.current) {
        clearInterval(razorpayStatusPollRef.current);
        razorpayStatusPollRef.current = null;
      }
      razorpayStatusPollAbortRef.current?.abort();
      razorpayStatusPollAbortRef.current = null;
      try {
        razorpayInstanceRef.current?.close?.();
      } catch (closeError) {
        console.warn('Failed to close Razorpay modal during cleanup:', closeError);
      }
      razorpayInstanceRef.current = null;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []);

  const updateForm = (field: CheckoutFormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setError(null);
  };

  const hasCartItems = mounted && items.length > 0;
  const summaryItems: SummaryItem[] = hasCartItems
    ? items.map((item) => ({ ...item, color: 'Standard', size: 'One Size' }))
    : [];

  const subtotal = hasCartItems ? totalPrice() : 0;
  const summaryCount = hasCartItems ? totalItems() : 0;

  // Standard shipping is FREE for orders >= ₹999, otherwise ₹59. Express is ₹99.
  const shippingCost = shippingMethod === 'express' ? 99 : subtotal >= 999 ? 0 : 59;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  const stopRazorpayStatusPolling = () => {
    if (razorpayStatusPollRef.current) {
      clearInterval(razorpayStatusPollRef.current);
      razorpayStatusPollRef.current = null;
    }
    razorpayStatusPollAbortRef.current?.abort();
    razorpayStatusPollAbortRef.current = null;
  };

  const redirectToCheckoutSuccess = ({
    orderNumber,
    gateway,
    paymentId,
  }: {
    orderNumber: string;
    gateway: PaymentMethod;
    paymentId?: string;
  }) => {
    stopRazorpayStatusPolling();
    try {
      razorpayInstanceRef.current?.close?.();
    } catch (closeError) {
      console.warn('Failed to close Razorpay modal before redirect:', closeError);
    }
    razorpayInstanceRef.current = null;
    queueCheckoutSuccessCartClear(orderNumber);
    setIsRedirectingToSuccess(true);
    setPaymentTransitionStage(gateway === 'razorpay' ? 'confirmed' : 'finalizing');

    const params = new URLSearchParams({
      orderNumber,
      gateway,
    });

    if (paymentId) {
      params.set('paymentId', paymentId);
    }

    const nextHref = `/checkout/success?${params.toString()}`;
    const navigate = () => {
      if (typeof window !== 'undefined') {
        window.location.replace(nextHref);
        return;
      }
      router.replace(nextHref);
    };

    if (gateway === 'razorpay') {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      redirectTimerRef.current = setTimeout(navigate, 1200);
      return;
    }

    navigate();
  };

  const startRazorpayStatusPolling = ({
    orderId,
    razorpayOrderId,
    orderNumber,
  }: {
    orderId: string;
    razorpayOrderId: string;
    orderNumber: string;
  }) => {
    stopRazorpayStatusPolling();
    const startedAt = Date.now();

    const poll = async () => {
      if (Date.now() - startedAt > 2 * 60 * 1000) {
        stopRazorpayStatusPolling();
        return;
      }

      try {
        razorpayStatusPollAbortRef.current?.abort();
        const controller = new AbortController();
        razorpayStatusPollAbortRef.current = controller;

        const response = await fetch(
          `/api/checkout/razorpay/status?orderId=${encodeURIComponent(orderId)}&razorpayOrderId=${encodeURIComponent(razorpayOrderId)}`,
          { cache: 'no-store', signal: controller.signal }
        );

        if (!response.ok) return;

        const result = (await response.json()) as {
          orderNumber?: string;
          paymentStatus?: string;
          paymentId?: string | null;
        };

        if (result.paymentStatus === 'paid') {
          redirectToCheckoutSuccess({
            orderNumber: result.orderNumber || orderNumber,
            gateway: 'razorpay',
            paymentId: result.paymentId || undefined,
          });
        }
      } catch (pollError) {
        if (
          pollError instanceof Error &&
          (pollError.name === 'AbortError' || pollError.message.includes('aborted'))
        ) {
          return;
        }
        console.error('Razorpay status polling error:', pollError);
      }
    };

    void poll();
    razorpayStatusPollRef.current = setInterval(() => {
      void poll();
    }, 3000);
  };

  const validateCheckoutDetails = () => {
    const normalizedFormData = normalizeCheckoutFormData(formData);
    const nextFieldErrors = getCheckoutFormErrors(normalizedFormData);

    setFormData(normalizedFormData);
    setFieldErrors(nextFieldErrors);

    if (!termsAccepted) {
      return {
        normalizedFormData,
        nextFieldErrors,
        isValid: false,
        primaryError: 'Please accept the Terms & Conditions and Privacy Policy to proceed.',
      };
    }

    return {
      normalizedFormData,
      nextFieldErrors,
      isValid: Object.keys(nextFieldErrors).length === 0,
      primaryError:
        getFirstCheckoutFormError(nextFieldErrors) ||
        'Please review your contact and delivery information.',
    };
  };

  const buildCheckoutPayload = (
    normalizedFormData: CheckoutFormData,
    gateway: PaymentMethod
  ): CheckoutPayload => ({
    customerEmail: normalizedFormData.email,
    customerName: `${normalizedFormData.firstName} ${normalizedFormData.lastName}`.trim(),
    customerPhone: normalizeCheckoutPhone(normalizedFormData.phone, normalizedFormData.country),
    currency: 'INR',
    paymentGateway: gateway,
    shippingMethod,
    couponCode: appliedCoupon?.code || '',
    lineItems: items.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      quantity: item.quantity,
    })),
    shippingAddress: {
      line1: normalizedFormData.address,
      city: normalizedFormData.city,
      state: normalizedFormData.state,
      postalCode: normalizeCheckoutPostalCode(normalizedFormData.zip, normalizedFormData.country),
      country: normalizedFormData.country,
    },
  });

  // Handle coupon application
  const handleApplyCoupon = async () => {
    const val = promoCode.trim().toUpperCase();
    if (!val) {
      setCouponMessage({ text: 'Enter a discount code to apply it.', isError: true });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage(null);

    // Check special client promo code YOG10 or backend API
    if (val === 'YOG10') {
      const discountVal = Math.round(subtotal * 0.1);
      setAppliedCoupon({
        code: 'YOG10',
        discountAmount: discountVal,
        discountType: 'percentage',
        description: '10% off your practice essentials',
      });
      setCouponMessage({
        text: `YOG10 applied — you saved ₹${discountVal.toLocaleString('en-IN')} on your items.`,
        isError: false,
      });
      setIsApplyingCoupon(false);
      return;
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: val,
          orderAmount: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'That code isn’t recognised. Try YOG10 for 10% off.');
      }

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        description: data.description,
      });
      setCouponMessage({
        text: `Coupon ${data.code} applied successfully!`,
        isError: false,
      });
    } catch (err: unknown) {
      setAppliedCoupon(null);
      setCouponMessage({
        text: getErrorMessage(err, 'That code isn’t recognised. Try YOG10 for 10% off.'),
        isError: true,
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasCartItems) {
      setError('Your cart is empty. Add mindful essentials before checking out.');
      return;
    }

    const validation = validateCheckoutDetails();
    if (!validation.isValid) {
      setError(validation.primaryError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(validation.normalizedFormData);
        return;
      }

      const payload = buildCheckoutPayload(validation.normalizedFormData, 'cod');

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }

      redirectToCheckoutSuccess({
        orderNumber: result.orderNumber,
        gateway: 'cod',
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An error occurred while placing order'));
      setIsSubmitting(false);
    }
  };

  const handleRazorpayPayment = async (normalizedFormData: CheckoutFormData) => {
    try {
      if (typeof window === 'undefined') {
        setError('Razorpay SDK is not loaded. Please refresh the page.');
        setIsSubmitting(false);
        return;
      }

      await loadRazorpayScript();
      const razorpayWindow = window as RazorpayWindow;
      if (!razorpayWindow.Razorpay) {
        throw new Error('Razorpay checkout is unavailable. Please choose Cash on Delivery.');
      }

      const payload = buildCheckoutPayload(normalizedFormData, 'razorpay');

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment session');
      }

      if (!result.orderId || !result.razorpayOrderId) {
        throw new Error('Payment session missing required Razorpay identifiers.');
      }

      startRazorpayStatusPolling({
        orderId: result.orderId,
        razorpayOrderId: result.razorpayOrderId,
        orderNumber: result.orderNumber,
      });

      const razorpayAmount = result.amountInPaise ?? result.totalInCents;
      if (typeof razorpayAmount !== 'number') {
        throw new Error('Unable to determine payment amount.');
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayAmount,
        currency: 'INR',
        name: 'Yoglivya',
        description: `Order #${result.orderNumber}`,
        order_id: result.razorpayOrderId,
        callback_url: `${window.location.origin}/api/checkout/razorpay/callback?orderId=${encodeURIComponent(result.orderId)}`,
        redirect: true,
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            if (!response.razorpay_signature) {
              throw new Error('Payment succeeded, but signature verification failed.');
            }

            setIsRedirectingToSuccess(true);

            const confirmResponse = await fetch('/api/customer/orders/update-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: result.orderId,
                razorpayOrderId: response.razorpay_order_id || result.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const confirmResult = (await confirmResponse.json()) as {
              error?: string;
              orderNumber?: string;
              pending?: boolean;
            };

            if (!confirmResponse.ok) {
              throw new Error(confirmResult.error || 'Payment confirmation failed.');
            }

            if (confirmResult.pending) {
              setIsRedirectingToSuccess(true);
              setPaymentTransitionStage('finalizing');
              return;
            }

            redirectToCheckoutSuccess({
              orderNumber: confirmResult.orderNumber || result.orderNumber,
              gateway: 'razorpay',
              paymentId: response.razorpay_payment_id,
            });
          } catch (confirmationError) {
            console.error('Razorpay confirmation error:', confirmationError);
            setError(
              confirmationError instanceof Error
                ? confirmationError.message
                : 'Payment received but confirmation timed out. Contact hello@yoglivya.com.'
            );
            setIsRedirectingToSuccess(false);
            setPaymentTransitionStage('idle');
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: payload.customerName,
          email: payload.customerEmail,
          contact: payload.customerPhone,
        },
        theme: {
          color: '#26352b',
        },
        modal: {
          ondismiss: () => {
            razorpayInstanceRef.current = null;
            setError('Payment cancelled. Your items are safe in your bag.');
            setIsSubmitting(false);
            setPaymentTransitionStage('idle');
          },
        },
      };

      const razorpay = new razorpayWindow.Razorpay(options);
      razorpayInstanceRef.current = razorpay;
      razorpay.on('payment.failed', (resp: RazorpayFailureResponse) => {
        stopRazorpayStatusPolling();
        razorpayInstanceRef.current = null;
        setError(`Payment failed: ${resp.error?.description || 'Please try again'}`);
        setIsSubmitting(false);
        setPaymentTransitionStage('idle');
      });
      razorpay.open();
    } catch (err) {
      stopRazorpayStatusPolling();
      console.error('Razorpay payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsSubmitting(false);
      setPaymentTransitionStage('idle');
    }
  };

  const handleItemQuantityChange = (sku: string, currentQty: number, delta: number) => {
    if (!hasCartItems) return;
    const next = currentQty + delta;
    if (next <= 0) {
      removeItem(sku);
    } else {
      updateQuantity(sku, next);
    }
  };

  if (mounted && items.length === 0 && !isRedirectingToSuccess) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-white px-5 py-12 text-[#1c211d]">
        <div className="w-full max-w-lg border border-[#e7e5df] bg-[#faf9f6] px-6 py-10 text-center sm:px-10">
          <ShoppingBag className="mx-auto h-10 w-10 text-[#737e65]" strokeWidth={1.3} />
          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#827a68]">
            Your bag is waiting
          </p>
          <h1 className="mt-2 text-3xl font-normal" style={{ fontFamily: 'Georgia, serif' }}>
            Your cart is empty
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#77766f]">
            Add something you love to your bag before continuing to checkout.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 bg-[#26352b] px-6 text-[10px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#35483a]"
          >
            Explore the collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {isRedirectingToSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#fbfbf8]/92 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md border border-[#e7e5df] bg-white px-8 py-10 text-center shadow-[0_20px_50px_rgba(38,53,43,0.08)]">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white transition-colors ${
                paymentTransitionStage === 'confirmed' ? 'bg-[#26352b]' : 'bg-[#737e65]'
              }`}
            >
              {paymentTransitionStage === 'confirmed' ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin" />
              )}
            </div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#737e65]">
              {paymentTransitionStage === 'confirmed' ? 'Payment Received' : 'Finalizing Order'}
            </p>
            <h2
              className="mt-3 text-2xl font-normal text-[#1c211d]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {paymentTransitionStage === 'confirmed'
                ? 'Your order is confirmed'
                : 'Taking you to confirmation'}
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-[#77766f]">
              {paymentTransitionStage === 'confirmed'
                ? 'Thank you for your practice with Yoglivya. Opening order receipt now.'
                : 'Locking in your mindful essentials and generating your order summary...'}
            </p>
          </div>
        </div>
      )}

      <main className="bg-white text-[#1c211d] min-h-screen">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] text-[#8b8b82] mb-6">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-cart'))}
              className="hover:text-[#26352b]"
            >
              Your bag
            </button>
            <span>›</span>
            <strong className="text-[#26352b] font-semibold">Checkout</strong>
            <span>›</span>
            <span>Confirmation</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#827a68] font-semibold block mb-1">
              Almost yours
            </span>
            <h1
              className="text-[34px] sm:text-[44px] font-normal leading-[1.1] text-[#1c211d] mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Checkout
            </h1>
            <p className="text-[12px] text-[#77766f]">
              Complete your details below to make these mindful essentials yours.
            </p>
          </div>

          {/* 3 Steps indicator */}
          <div className="flex items-center gap-3 mb-8 max-w-[550px]" aria-label="Checkout progress">
            <div className="flex items-center gap-2 text-[10px] text-[#98988f]">
              <span className="w-6 h-6 rounded-full border border-[#d9d9d0] flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Bag</span>
            </div>
            <div className="h-[1px] bg-[#e7e5df] w-8 sm:w-10" />
            <div className="flex items-center gap-2 text-[10px] text-[#26352b] font-medium">
              <span className="w-6 h-6 rounded-full bg-[#26352b] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Information & payment</span>
            </div>
            <div className="h-[1px] bg-[#e7e5df] w-8 sm:w-10" />
            <div className="flex items-center gap-2 text-[10px] text-[#98988f]">
              <span className="w-6 h-6 rounded-full border border-[#d9d9d0] flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Confirmation</span>
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div
              className="mb-6 p-4 bg-[#fbf2f0] border-l-4 border-[#b66b58] text-[#8e3c2a] text-[12px] leading-relaxed"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Main Checkout Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
            {/* Left Column Form */}
            <form onSubmit={handlePlaceOrder} noValidate className="space-y-4">
              {/* SECTION 1: Contact Information */}
              <section className="border border-[#e7e5df] bg-white">
                <div className="flex items-center gap-3 p-5 border-b border-[#e7e5df]">
                  <span
                    className="h-7 w-7 rounded-full bg-[#f5f3ed] text-[#26352b] flex items-center justify-center text-[14px]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    1
                  </span>
                  <h2
                    className="text-[20px] font-normal text-[#1c211d]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Contact information
                  </h2>
                  <small className="ml-auto text-[#8c8c82] text-[10px]">
                    Where can we reach you?
                  </small>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                    >
                      Email address <span className="text-[#a08758]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={`w-full h-11 border bg-[#fcfbf8] px-3.5 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                        fieldErrors.email ? 'border-[#b66b58]' : 'border-[#deded5]'
                      }`}
                    />
                    {fieldErrors.email && (
                      <span className="text-[11px] text-[#b66b58] mt-1 block">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                      >
                        First name <span className="text-[#a08758]">*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        placeholder="First name"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={(e) => updateForm('firstName', e.target.value)}
                        className={`w-full h-11 border bg-[#fcfbf8] px-3.5 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                          fieldErrors.firstName ? 'border-[#b66b58]' : 'border-[#deded5]'
                        }`}
                      />
                      {fieldErrors.firstName && (
                        <span className="text-[11px] text-[#b66b58] mt-1 block">
                          {fieldErrors.firstName}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                      >
                        Last name <span className="text-[#a08758]">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        placeholder="Last name"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={(e) => updateForm('lastName', e.target.value)}
                        className={`w-full h-11 border bg-[#fcfbf8] px-3.5 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                          fieldErrors.lastName ? 'border-[#b66b58]' : 'border-[#deded5]'
                        }`}
                      />
                      {fieldErrors.lastName && (
                        <span className="text-[11px] text-[#b66b58] mt-1 block">
                          {fieldErrors.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                    >
                      Mobile number <span className="text-[#a08758]">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className={`w-full h-11 border bg-[#fcfbf8] px-3.5 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                        fieldErrors.phone ? 'border-[#b66b58]' : 'border-[#deded5]'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <span className="text-[11px] text-[#b66b58] mt-1 block">
                        {fieldErrors.phone}
                      </span>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 text-[11px] text-[#77766f] pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 accent-[#26352b]"
                    />
                    <span>Email me with occasional product updates and mindful inspiration.</span>
                  </label>
                </div>
              </section>

              {/* SECTION 2: Delivery Address */}
              <section className="border border-[#e7e5df] bg-white">
                <div className="flex items-center gap-3 p-5 border-b border-[#e7e5df]">
                  <span
                    className="h-7 w-7 rounded-full bg-[#f5f3ed] text-[#26352b] flex items-center justify-center text-[14px]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    2
                  </span>
                  <h2
                    className="text-[20px] font-normal text-[#1c211d]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Delivery address
                  </h2>
                  <small className="ml-auto text-[#8c8c82] text-[10px]">
                    Where should we send it?
                  </small>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                    >
                      House number and street <span className="text-[#a08758]">*</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      placeholder="House / flat no., street, area"
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className={`w-full h-11 border bg-[#fcfbf8] px-3.5 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                        fieldErrors.address ? 'border-[#b66b58]' : 'border-[#deded5]'
                      }`}
                    />
                    {fieldErrors.address && (
                      <span className="text-[11px] text-[#b66b58] mt-1 block">
                        {fieldErrors.address}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                      >
                        Town / city <span className="text-[#a08758]">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        required
                        placeholder="City"
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                        className={`w-full h-11 border bg-[#fcfbf8] px-3.5 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                          fieldErrors.city ? 'border-[#b66b58]' : 'border-[#deded5]'
                        }`}
                      />
                      {fieldErrors.city && (
                        <span className="text-[11px] text-[#b66b58] mt-1 block">
                          {fieldErrors.city}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                      >
                        State <span className="text-[#a08758]">*</span>
                      </label>
                      <select
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => updateForm('state', e.target.value)}
                        className={`w-full h-11 border bg-[#fcfbf8] px-3 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                          fieldErrors.state ? 'border-[#b66b58]' : 'border-[#deded5]'
                        }`}
                      >
                        <option value="" disabled>Select state</option>
                        {INDIAN_STATES.map((stateName) => (
                          <option key={stateName} value={stateName}>
                            {stateName}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.state && (
                        <span className="text-[11px] text-[#b66b58] mt-1 block">
                          {fieldErrors.state}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="zip"
                        className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                      >
                        PIN code <span className="text-[#a08758]">*</span>
                      </label>
                      <input
                        id="zip"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="6-digit PIN code"
                        autoComplete="postal-code"
                        value={formData.zip}
                        onChange={(e) => updateForm('zip', e.target.value)}
                        className={`w-full h-11 border bg-[#fcfbf8] px-3.5 text-[12px] text-[#1c211d] outline-none transition-all focus:bg-white focus:border-[#737e65] focus:ring-2 focus:ring-[#737e65]/20 ${
                          fieldErrors.zip ? 'border-[#b66b58]' : 'border-[#deded5]'
                        }`}
                      />
                      {fieldErrors.zip && (
                        <span className="text-[11px] text-[#b66b58] mt-1 block">
                          {fieldErrors.zip}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-[10px] uppercase tracking-[0.08em] text-[#52574f] font-semibold mb-1.5"
                      >
                        Country / region
                      </label>
                      <select
                        id="country"
                        disabled
                        value="India"
                        className="w-full h-11 border border-[#deded5] bg-[#f5f3ed] px-3 text-[12px] text-[#1c211d] outline-none cursor-not-allowed"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 text-[11px] text-[#77766f] pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 accent-[#26352b]"
                    />
                    <span>Save this information for next time on this device.</span>
                  </label>
                </div>
              </section>

              {/* SECTION 3: Delivery Method */}
              <section className="border border-[#e7e5df] bg-white">
                <div className="flex items-center gap-3 p-5 border-b border-[#e7e5df]">
                  <span
                    className="h-7 w-7 rounded-full bg-[#f5f3ed] text-[#26352b] flex items-center justify-center text-[14px]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    3
                  </span>
                  <h2
                    className="text-[20px] font-normal text-[#1c211d]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Delivery method
                  </h2>
                  <small className="ml-auto text-[#8c8c82] text-[10px]">
                    Choose what works for you
                  </small>
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-[#26352b] bg-[#fafbf8]'
                        : 'border-[#e7e5df] hover:border-[#deded5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-[#26352b]"
                    />
                    <div className="flex-1">
                      <strong className="block text-[12px] font-medium text-[#1c211d]">
                        Standard delivery
                      </strong>
                      <span className="text-[10px] text-[#77766f]">
                        Estimated 3–7 business days
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#26352b]">
                      {subtotal >= 999 ? 'FREE' : '₹59'}
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-[#26352b] bg-[#fafbf8]'
                        : 'border-[#e7e5df] hover:border-[#deded5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="accent-[#26352b]"
                    />
                    <div className="flex-1">
                      <strong className="block text-[12px] font-medium text-[#1c211d]">
                        Express delivery
                      </strong>
                      <span className="text-[10px] text-[#77766f]">
                        Estimated 1–3 business days
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#26352b]">₹99</span>
                  </label>
                </div>
              </section>

              {/* SECTION 4: Payment Method */}
              <section className="border border-[#e7e5df] bg-white">
                <div className="flex items-center gap-3 p-5 border-b border-[#e7e5df]">
                  <span
                    className="h-7 w-7 rounded-full bg-[#f5f3ed] text-[#26352b] flex items-center justify-center text-[14px]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    4
                  </span>
                  <h2
                    className="text-[20px] font-normal text-[#1c211d]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Payment method
                  </h2>
                  <small className="ml-auto text-[#8c8c82] text-[10px]">Safe and secure</small>
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <div className="space-y-2.5">
                    <label
                      className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                        selectedPaymentOption === 'upi'
                          ? 'border-[#26352b] bg-[#fafbf8]'
                          : 'border-[#e7e5df] hover:border-[#deded5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={selectedPaymentOption === 'upi'}
                        onChange={() => setSelectedPaymentOption('upi')}
                        className="accent-[#26352b]"
                      />
                      <div className="flex-1">
                        <strong className="block text-[12px] font-medium text-[#1c211d]">UPI</strong>
                        <span className="text-[10px] text-[#77766f]">
                          Google Pay, PhonePe, Paytm and more
                        </span>
                      </div>
                      <span className="text-[10px] border border-[#e7e5df] px-2 py-1 text-[#62685e] font-mono">
                        UPI
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                        selectedPaymentOption === 'card'
                          ? 'border-[#26352b] bg-[#fafbf8]'
                          : 'border-[#e7e5df] hover:border-[#deded5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={selectedPaymentOption === 'card'}
                        onChange={() => setSelectedPaymentOption('card')}
                        className="accent-[#26352b]"
                      />
                      <div className="flex-1">
                        <strong className="block text-[12px] font-medium text-[#1c211d]">
                          Credit / debit card
                        </strong>
                        <span className="text-[10px] text-[#77766f]">
                          Visa, Mastercard and RuPay
                        </span>
                      </div>
                      <span className="text-[10px] border border-[#e7e5df] px-2 py-1 text-[#62685e] font-mono">
                        CARD
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                        selectedPaymentOption === 'netbanking'
                          ? 'border-[#26352b] bg-[#fafbf8]'
                          : 'border-[#e7e5df] hover:border-[#deded5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="netbanking"
                        checked={selectedPaymentOption === 'netbanking'}
                        onChange={() => setSelectedPaymentOption('netbanking')}
                        className="accent-[#26352b]"
                      />
                      <div className="flex-1">
                        <strong className="block text-[12px] font-medium text-[#1c211d]">
                          Net banking
                        </strong>
                        <span className="text-[10px] text-[#77766f]">
                          Pay directly from your bank
                        </span>
                      </div>
                      <span className="text-[10px] border border-[#e7e5df] px-2 py-1 text-[#62685e] font-mono">
                        BANK
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-all ${
                        selectedPaymentOption === 'cod'
                          ? 'border-[#26352b] bg-[#fafbf8]'
                          : 'border-[#e7e5df] hover:border-[#deded5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={selectedPaymentOption === 'cod'}
                        onChange={() => setSelectedPaymentOption('cod')}
                        className="accent-[#26352b]"
                      />
                      <div className="flex-1">
                        <strong className="block text-[12px] font-medium text-[#1c211d]">
                          Cash on delivery
                        </strong>
                        <span className="text-[10px] text-[#77766f]">
                          Pay when your order arrives
                        </span>
                      </div>
                      <span className="text-[10px] border border-[#e7e5df] px-2 py-1 text-[#62685e] font-mono">
                        COD
                      </span>
                    </label>
                  </div>

                  <label className="flex items-start gap-2.5 text-[10px] text-[#77766f] pt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 accent-[#26352b]"
                    />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="underline underline-offset-2 hover:text-[#26352b]">
                        Terms & Conditions
                      </Link>{' '}
                      and acknowledge the{' '}
                      <Link href="/privacy" className="underline underline-offset-2 hover:text-[#26352b]">
                        Privacy Policy
                      </Link>
                      . <span className="text-[#a08758]">*</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || !hasCartItems}
                    className="w-full mt-4 bg-[#26352b] text-white py-4 px-6 flex items-center justify-center gap-3 text-[10px] tracking-[0.14em] uppercase border border-[#26352b] hover:bg-[#35483a] disabled:opacity-60 transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing your order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place order</span>
                        <span className="font-semibold">₹{total.toLocaleString('en-IN')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#85877d] pt-2">
                    <Lock className="w-3.5 h-3.5 text-[#737e65]" />
                    <span>Your information is encrypted and protected.</span>
                  </div>
                </div>
              </section>
            </form>

            {/* Right Column Sticky Summary */}
            <aside className="border border-[#e7e5df] bg-[#faf9f6] lg:sticky lg:top-24">
              <div className="p-5 border-b border-[#e7e5df] flex justify-between items-center">
                <h2
                  className="text-[22px] font-normal text-[#1c211d]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Your order
                </h2>
                <span className="text-[10px] text-[#77766f]">
                  <b className="font-semibold text-[#1c211d]">{summaryCount}</b> items
                </span>
              </div>

              {/* Items List */}
              <div className="px-5 divide-y divide-[#e7e5df] max-h-[360px] overflow-y-auto">
                {summaryItems.map((item) => (
                  <div key={item.sku} className="py-4 grid grid-cols-[64px_1fr_auto] gap-3.5 items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden bg-[#eae5d9]">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-[#737e65]" />
                      )}
                    </div>
                    <div>
                      <strong
                        className="block text-[15px] font-normal leading-tight text-[#1c211d]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {item.name}
                      </strong>
                      <span className="block text-[10px] text-[#77766f] mt-1">
                        {item.color} · {item.size}
                      </span>
                      {hasCartItems && (
                        <div className="inline-flex items-center border border-[#deded5] bg-white h-6 mt-2">
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.sku, item.quantity, -1)}
                            className="w-6 h-full flex items-center justify-center text-[#26352b] hover:bg-[#f5f3ed]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-[10px] text-[#1c211d] font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.sku, item.quantity, 1)}
                            className="w-6 h-full flex items-center justify-center text-[#26352b] hover:bg-[#f5f3ed]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-[12px] font-medium text-[#1c211d] self-start pt-1">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon / Discount Code */}
              <div className="p-5 border-t border-[#e7e5df]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code (e.g. YOG10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-10 flex-1 border border-[#deded5] bg-white px-3 text-[11px] text-[#1c211d] outline-none uppercase placeholder:normal-case focus:border-[#737e65]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                    className="px-4 border border-[#26352b] bg-white text-[#26352b] text-[9px] tracking-[0.1em] uppercase hover:bg-[#26352b] hover:text-white transition-colors"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponMessage && (
                  <div
                    className={`mt-2 text-[10px] ${
                      couponMessage.isError ? 'text-[#b66b58]' : 'text-[#53684b]'
                    }`}
                  >
                    {couponMessage.text}
                  </div>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="p-5 border-t border-[#e7e5df] space-y-2.5">
                <div className="flex justify-between text-[11px] text-[#686b63]">
                  <span>Subtotal</span>
                  <strong className="text-[#1c211d] font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px] text-[#686b63]">
                  <span>Shipping</span>
                  <strong className="text-[#1c211d] font-medium">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </strong>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[11px] text-[#53684b]">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <strong>−₹{discount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                <div className="border-t border-[#e7e5df] pt-4 mt-3 flex justify-between items-baseline text-[13px] text-[#1c211d]">
                  <span className="font-medium">Total</span>
                  <strong
                    className="text-[22px] font-normal"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    ₹{total.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="text-[9px] text-[#8c8c82]">
                  Inclusive of applicable taxes.
                </div>
              </div>

              {/* Summary Footnote */}
              <div className="p-4 bg-[#f1f0e8] border-t border-[#e7e5df] flex items-center gap-2.5 text-[#666d61] text-[10px]">
                <ShieldCheck className="w-4 h-4 text-[#a08758] flex-none" />
                <span>Thoughtfully packed, ready for your practice.</span>
              </div>
            </aside>
          </div>

          {/* Assurance Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-6 border-t border-[#e7e5df]">
            <div className="flex items-center gap-2.5 text-[#7d8076] text-[10px]">
              <Truck className="w-4 h-4 text-[#a08758] flex-none" />
              <span>Pan-India delivery</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#7d8076] text-[10px]">
              <ShieldCheck className="w-4 h-4 text-[#a08758] flex-none" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#7d8076] text-[10px]">
              <Headphones className="w-4 h-4 text-[#a08758] flex-none" />
              <span>Helpful customer support</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
