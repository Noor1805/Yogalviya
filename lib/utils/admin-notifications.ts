export interface AdminNotificationsSummary {
  orders: {
    newCount: number;
  };
  contacts: {
    newCount: number;
  };
  recycleBin: {
    totalCount: number;
    breakdown: {
      products: number;
      orders: number;
      media: number;
    };
  };
}

export interface AdminNotificationsSummaryInput {
  ordersNewCount: number;
  contactsNewCount: number;
  recycledProductsCount: number;
  recycledOrdersCount: number;
  recycledMediaCount: number;
}

const sanitizeCount = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

export const emptyAdminNotificationsSummary: AdminNotificationsSummary = {
  orders: { newCount: 0 },
  contacts: { newCount: 0 },
  recycleBin: {
    totalCount: 0,
    breakdown: {
      products: 0,
      orders: 0,
      media: 0,
    },
  },
};

export function buildAdminNotificationsSummary(
  input: AdminNotificationsSummaryInput
): AdminNotificationsSummary {
  const recycledProductsCount = sanitizeCount(input.recycledProductsCount);
  const recycledOrdersCount = sanitizeCount(input.recycledOrdersCount);
  const recycledMediaCount = sanitizeCount(input.recycledMediaCount);

  return {
    orders: {
      newCount: sanitizeCount(input.ordersNewCount),
    },
    contacts: {
      newCount: sanitizeCount(input.contactsNewCount),
    },
    recycleBin: {
      totalCount:
        recycledProductsCount + recycledOrdersCount + recycledMediaCount,
      breakdown: {
        products: recycledProductsCount,
        orders: recycledOrdersCount,
        media: recycledMediaCount,
      },
    },
  };
}

export function formatAdminAttentionCount(count: number): string {
  const safeCount = sanitizeCount(count);
  return safeCount > 99 ? '99+' : String(safeCount);
}
