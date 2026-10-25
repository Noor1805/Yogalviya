import assert from 'node:assert/strict';

import {
  buildCustomerOrderOwnershipQuery,
  normalizeCustomerOrderEmail,
} from '../lib/utils/customer-order-access.ts';

const runCase = (name: string, assertion: () => void) => {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

runCase('normalizes customer emails for cross-device order matching', () => {
  assert.equal(
    normalizeCustomerOrderEmail('  LaraibL767@Gmail.com '),
    'laraibl767@gmail.com'
  );
  assert.equal(normalizeCustomerOrderEmail(undefined), '');
});

runCase('builds ownership query with both customer id and email fallbacks', () => {
  const query = buildCustomerOrderOwnershipQuery({
    id: 'customer_123',
    email: 'Customer@Example.com',
  }) as {
    $or: Array<Record<string, unknown>>;
    isDeleted: { $ne: boolean };
  };

  assert.deepEqual(query.isDeleted, { $ne: true });
  assert.equal(Array.isArray(query.$or), true);
  assert.deepEqual(query.$or[0], { customerId: 'customer_123' });
  assert.deepEqual(query.$or[1], { customerEmail: 'customer@example.com' });
  assert.deepEqual(query.$or[2], {
    customerEmail: {
      $regex: '^customer@example\\.com$',
      $options: 'i',
    },
  });
});

runCase('returns a safe no-match query when the customer identity is missing', () => {
  const query = buildCustomerOrderOwnershipQuery({});

  assert.deepEqual(query, {
    _id: null,
    isDeleted: { $ne: true },
  });
});
