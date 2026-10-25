const CHECKOUT_SUCCESS_CART_CLEAR_KEY = 'checkout-success-cart-clear';

type PendingCheckoutSuccessPayload = {
  orderNumber: string;
  createdAt: number;
};

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function queueCheckoutSuccessCartClear(orderNumber: string) {
  if (!canUseSessionStorage()) {
    return;
  }

  const normalizedOrderNumber = orderNumber.trim();
  if (!normalizedOrderNumber) {
    return;
  }

  const payload: PendingCheckoutSuccessPayload = {
    orderNumber: normalizedOrderNumber,
    createdAt: Date.now(),
  };

  window.sessionStorage.setItem(
    CHECKOUT_SUCCESS_CART_CLEAR_KEY,
    JSON.stringify(payload)
  );
}

export function consumeCheckoutSuccessCartClear(orderNumber?: string | null) {
  if (!canUseSessionStorage()) {
    return false;
  }

  const raw = window.sessionStorage.getItem(CHECKOUT_SUCCESS_CART_CLEAR_KEY);
  if (!raw) {
    return false;
  }

  window.sessionStorage.removeItem(CHECKOUT_SUCCESS_CART_CLEAR_KEY);

  try {
    const payload = JSON.parse(raw) as Partial<PendingCheckoutSuccessPayload>;
    const normalizedOrderNumber = orderNumber?.trim();

    if (!normalizedOrderNumber || payload.orderNumber !== normalizedOrderNumber) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
