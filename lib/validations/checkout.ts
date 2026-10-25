import { z } from 'zod';

const PERSON_NAME_PATTERN = /^[\p{L}][\p{L}\p{M}\s'.-]*$/u;
const ADDRESS_PATTERN = /^[\p{L}\p{M}\d][\p{L}\p{M}\d\s,.'/#-]*$/u;
const LOCATION_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u;
const INDIAN_PINCODE_PATTERN = /^\d{6}$/;
const INTERNATIONAL_POSTAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;
const INTERNATIONAL_PHONE_PATTERN = /^\d{8,15}$/;
const INDIAN_PHONE_PATTERN = /^91[6-9]\d{9}$/;

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(60, `${label} is too long.`)
    .refine((value) => PERSON_NAME_PATTERN.test(value), {
      message: `Enter a valid ${label.toLowerCase()}.`,
    });

const locationSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} is required.`)
    .max(100, `${label} is too long.`)
    .refine((value) => LOCATION_PATTERN.test(value), {
      message: `Enter a valid ${label.toLowerCase()}.`,
    });

export const checkoutFirstNameSchema = nameSchema('First name');
export const checkoutLastNameSchema = nameSchema('Last name');
export const checkoutEmailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.');
export const checkoutPhoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required.')
  .max(30, 'Enter a valid phone number.');
export const checkoutCountrySchema = locationSchema('Country');
export const checkoutCitySchema = locationSchema('City');
export const checkoutStateSchema = locationSchema('State');
export const checkoutAddressSchema = z
  .string()
  .trim()
  .min(5, 'Address is required.')
  .max(200, 'Address is too long.')
  .refine((value) => ADDRESS_PATTERN.test(value), {
    message: 'Enter a valid street address.',
  });
export const checkoutPostalCodeSchema = z
  .string()
  .trim()
  .min(1, 'PIN / postal code is required.')
  .max(20, 'Enter a valid PIN / postal code.');
export const checkoutCustomerNameSchema = z
  .string()
  .trim()
  .min(3, 'Full name is required.')
  .max(120, 'Full name is too long.')
  .refine((value) => PERSON_NAME_PATTERN.test(value), {
    message: 'Enter a valid full name.',
  })
  .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, {
    message: 'Enter both first and last name.',
  });

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  zip: string;
  state: string;
};

export type CheckoutFormField = keyof CheckoutFormData;
export type CheckoutFieldErrors = Partial<Record<CheckoutFormField, string>>;

export const CHECKOUT_FIELD_ORDER: CheckoutFormField[] = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'country',
  'address',
  'city',
  'state',
  'zip',
];

export function isIndianCheckoutCountry(country: string) {
  const normalizedCountry = country.trim().toLowerCase();
  return normalizedCountry === 'india' || normalizedCountry === 'in' || normalizedCountry === 'bharat';
}

export function normalizeCheckoutPostalCode(postalCode: string, country: string) {
  const trimmedPostalCode = postalCode.trim();
  return isIndianCheckoutCountry(country)
    ? trimmedPostalCode.replace(/\s+/g, '')
    : trimmedPostalCode.toUpperCase();
}

export function normalizeCheckoutPhone(phone: string, country: string) {
  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (isIndianCheckoutCountry(country)) {
    const localNumber = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
    return localNumber.length === 10 ? `91${localNumber}` : digits;
  }

  return digits;
}

export function isValidCheckoutPhone(phone: string, country: string) {
  const normalizedPhone = normalizeCheckoutPhone(phone, country);

  if (isIndianCheckoutCountry(country)) {
    return INDIAN_PHONE_PATTERN.test(normalizedPhone);
  }

  return INTERNATIONAL_PHONE_PATTERN.test(normalizedPhone);
}

export function getCheckoutPhoneError(country: string) {
  return isIndianCheckoutCountry(country)
    ? 'Enter a valid 10-digit Indian mobile number.'
    : 'Enter a valid phone number with 8 to 15 digits.';
}

export function isValidCheckoutPostalCode(postalCode: string, country: string) {
  const normalizedPostalCode = normalizeCheckoutPostalCode(postalCode, country);

  if (isIndianCheckoutCountry(country)) {
    return INDIAN_PINCODE_PATTERN.test(normalizedPostalCode);
  }

  return INTERNATIONAL_POSTAL_CODE_PATTERN.test(normalizedPostalCode);
}

export function getCheckoutPostalCodeError(country: string) {
  return isIndianCheckoutCountry(country)
    ? 'Enter a valid 6-digit Indian PIN code.'
    : 'Enter a valid postal code.';
}

export function getCheckoutPostalCodeLabel(country: string) {
  return isIndianCheckoutCountry(country) ? 'PIN code' : 'ZIP / Postal code';
}

export function getCheckoutPostalCodePlaceholder(country: string) {
  return isIndianCheckoutCountry(country) ? '700016' : 'Postal code';
}

export function normalizeCheckoutFormData(data: CheckoutFormData): CheckoutFormData {
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    country: data.country.trim(),
    city: data.city.trim(),
    address: data.address.trim(),
    zip: data.zip.trim(),
    state: data.state.trim(),
  };
}

export const checkoutFormSchema = z
  .object({
    firstName: checkoutFirstNameSchema,
    lastName: checkoutLastNameSchema,
    phone: checkoutPhoneSchema,
    email: checkoutEmailSchema,
    country: checkoutCountrySchema,
    city: checkoutCitySchema,
    address: checkoutAddressSchema,
    zip: checkoutPostalCodeSchema,
    state: checkoutStateSchema,
  })
  .superRefine((data, ctx) => {
    if (!isValidCheckoutPhone(data.phone, data.country)) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: getCheckoutPhoneError(data.country),
      });
    }

    if (!isValidCheckoutPostalCode(data.zip, data.country)) {
      ctx.addIssue({
        code: 'custom',
        path: ['zip'],
        message: getCheckoutPostalCodeError(data.country),
      });
    }
  });

export const checkoutShippingAddressSchema = z
  .object({
    line1: checkoutAddressSchema,
    line2: z.string().trim().max(200, 'Address line 2 is too long.').optional().or(z.literal('')),
    city: checkoutCitySchema,
    state: checkoutStateSchema,
    postalCode: checkoutPostalCodeSchema,
    country: checkoutCountrySchema,
  })
  .superRefine((data, ctx) => {
    if (!isValidCheckoutPostalCode(data.postalCode, data.country)) {
      ctx.addIssue({
        code: 'custom',
        path: ['postalCode'],
        message: getCheckoutPostalCodeError(data.country),
      });
    }
  });

export function getCheckoutFormErrors(data: CheckoutFormData): CheckoutFieldErrors {
  const result = checkoutFormSchema.safeParse(normalizeCheckoutFormData(data));

  if (result.success) {
    return {};
  }

  const flattenedErrors = result.error.flatten().fieldErrors;
  const fieldErrors: CheckoutFieldErrors = {};

  for (const field of CHECKOUT_FIELD_ORDER) {
    const message = flattenedErrors[field]?.[0];
    if (message) {
      fieldErrors[field] = message;
    }
  }

  return fieldErrors;
}

export function getFirstCheckoutFormError(fieldErrors: CheckoutFieldErrors) {
  for (const field of CHECKOUT_FIELD_ORDER) {
    if (fieldErrors[field]) {
      return fieldErrors[field] || null;
    }
  }

  return null;
}
