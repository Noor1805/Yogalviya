import assert from 'node:assert/strict';
import {
  getCheckoutFormErrors,
  normalizeCheckoutPhone,
  normalizeCheckoutPostalCode,
} from '../lib/validations/checkout.ts';

const validIndianCheckout = {
  firstName: 'Ayesha',
  lastName: 'Khan',
  phone: '+91 98765 43210',
  email: 'ayesha@example.com',
  country: 'India',
  city: 'Kolkata',
  address: '12 Park Street',
  zip: '700016',
  state: 'West Bengal',
};

assert.deepEqual(getCheckoutFormErrors(validIndianCheckout), {});
assert.equal(normalizeCheckoutPhone(validIndianCheckout.phone, validIndianCheckout.country), '919876543210');
assert.equal(normalizeCheckoutPostalCode(validIndianCheckout.zip, validIndianCheckout.country), '700016');

const invalidIndianCheckout = {
  ...validIndianCheckout,
  phone: '12345',
  zip: '7001',
};

const invalidIndianErrors = getCheckoutFormErrors(invalidIndianCheckout);
assert.equal(invalidIndianErrors.phone, 'Enter a valid 10-digit Indian mobile number.');
assert.equal(invalidIndianErrors.zip, 'Enter a valid 6-digit Indian PIN code.');

const validInternationalCheckout = {
  ...validIndianCheckout,
  country: 'United Kingdom',
  phone: '+44 7911 123456',
  zip: 'SW1A 1AA',
};

assert.deepEqual(getCheckoutFormErrors(validInternationalCheckout), {});
assert.equal(
  normalizeCheckoutPhone(validInternationalCheckout.phone, validInternationalCheckout.country),
  '447911123456'
);
assert.equal(
  normalizeCheckoutPostalCode(validInternationalCheckout.zip, validInternationalCheckout.country),
  'SW1A 1AA'
);

console.log('checkout validation tests passed');
