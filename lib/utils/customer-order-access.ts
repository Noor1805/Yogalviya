type CustomerOrderUser = {
  id?: string;
  email?: string | null;
};

export function normalizeCustomerOrderEmail(email?: string | null) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function escapeMongoRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildCustomerOrderOwnershipQuery(user: CustomerOrderUser) {
  const normalizedEmail = normalizeCustomerOrderEmail(user.email);
  const customerId = typeof user.id === 'string' ? user.id.trim() : '';
  const ownershipClauses: Record<string, unknown>[] = [];

  if (customerId) {
    ownershipClauses.push({ customerId });
  }

  if (normalizedEmail) {
    ownershipClauses.push({ customerEmail: normalizedEmail });
    ownershipClauses.push({
      customerEmail: {
        $regex: `^${escapeMongoRegex(normalizedEmail)}$`,
        $options: 'i',
      },
    });
  }

  if (ownershipClauses.length === 0) {
    return {
      _id: null,
      isDeleted: { $ne: true },
    };
  }

  if (ownershipClauses.length === 1) {
    return {
      ...ownershipClauses[0],
      isDeleted: { $ne: true },
    };
  }

  return {
    $or: ownershipClauses,
    isDeleted: { $ne: true },
  };
}
