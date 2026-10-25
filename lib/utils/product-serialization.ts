type PlainRecord = Record<string, unknown>;

interface ProductSpecification {
  label: string;
  value: string;
}

interface ProductAttributeOption {
  name: string;
  values: string[];
  colorValues?: Record<string, string>;
}

interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockCount: number;
  image?: string;
  gallery?: string[];
}

interface ProductClientShape {
  additionalInfo: ProductSpecification[];
  specifications: ProductSpecification[];
  orderDetails: ProductSpecification[];
  attributes: ProductAttributeOption[];
  variations: ProductVariation[];
  features: string[];
  certifications: string[];
  colors: string[];
  gallery: string[];
  aplusImages: string[];
}

function isPlainRecord(value: unknown): value is PlainRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toCleanString(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toFiniteNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function uniqueCaseInsensitive(values: string[]) {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const value of values) {
    const trimmed = toCleanString(value);
    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    cleaned.push(trimmed);
  }

  return cleaned;
}

function toOptionalFiniteNumber(value: unknown) {
  const parsed = toFiniteNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPlainSerializable(value: unknown): unknown {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Map) {
    const mapped: PlainRecord = {};

    for (const [key, entryValue] of value.entries()) {
      if (key === '_id' || key === '__v') {
        continue;
      }

      const plainValue = toPlainSerializable(entryValue);
      if (plainValue !== undefined) {
        mapped[String(key)] = plainValue;
      }
    }

    return mapped;
  }

  if (isPlainRecord(value)) {
    const objectIdLike = value as {
      _bsontype?: unknown;
      toHexString?: () => string;
    };

    if (
      objectIdLike._bsontype === 'ObjectId' &&
      typeof objectIdLike.toHexString === 'function'
    ) {
      return objectIdLike.toHexString();
    }

    const mapped: PlainRecord = {};

    for (const [key, entryValue] of Object.entries(value)) {
      if (key === '_id' || key === '__v') {
        continue;
      }

      const plainValue = toPlainSerializable(entryValue);
      if (plainValue !== undefined) {
        mapped[key] = plainValue;
      }
    }

    return mapped;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => toPlainSerializable(entry))
      .filter((entry) => entry !== undefined);
  }

  return toCleanString(value);
}

function toPlainRecord(value: unknown): PlainRecord {
  const plainValue = toPlainSerializable(value);
  return isPlainRecord(plainValue) ? plainValue : {};
}

function toStringArray(value: unknown) {
  const plainValue = toPlainSerializable(value);
  if (!Array.isArray(plainValue)) {
    return [];
  }

  return plainValue
    .map((entry) => toCleanString(entry))
    .filter(Boolean);
}

function toSpecificationRows(value: unknown): ProductSpecification[] {
  const plainValue = toPlainSerializable(value);
  if (!Array.isArray(plainValue)) {
    return [];
  }

  return plainValue
    .map((entry) => {
      const row = toPlainRecord(entry);
      return {
        label: toCleanString(row.label),
        value: toCleanString(row.value),
      };
    })
    .filter((entry) => entry.label && entry.value);
}

function toAttributeOptions(value: unknown): ProductAttributeOption[] {
  const plainValue = toPlainSerializable(value);
  if (!Array.isArray(plainValue)) {
    return [];
  }

  return plainValue
    .map((entry) => {
      const attribute = toPlainRecord(entry);
      const colorValueEntries = Object.entries(toPlainRecord(attribute.colorValues)).map(
        ([key, entryValue]) => [key, toCleanString(entryValue)] as const
      );

      return {
        name: toCleanString(attribute.name),
        values: uniqueCaseInsensitive(toStringArray(attribute.values)),
        colorValues: Object.fromEntries(colorValueEntries.filter(([, entryValue]) => entryValue)),
      };
    })
    .filter((attribute) => attribute.name && attribute.values.length > 0);
}

function toVariations(value: unknown): ProductVariation[] {
  const plainValue = toPlainSerializable(value);
  if (!Array.isArray(plainValue)) {
    return [];
  }

  const variations = plainValue
    .map((entry, index) => {
      const variation = toPlainRecord(entry);
      const rawAttributes = toPlainRecord(variation.attributes);
      const attributes = Object.fromEntries(
        Object.entries(rawAttributes)
          .map(([key, entryValue]) => [toCleanString(key), toCleanString(entryValue)] as const)
          .filter(([key, entryValue]) => key && entryValue)
      );
      const id = toCleanString(variation.id) || `variation-${index + 1}`;
      const price = toFiniteNumber(variation.price, 0);
      const sku = toCleanString(variation.sku) || id.toUpperCase();

      return {
        id,
        attributes,
        price,
        compareAtPrice: toOptionalFiniteNumber(variation.compareAtPrice),
        sku,
        stockCount: Math.max(0, toFiniteNumber(variation.stockCount, 0)),
        image: toCleanString(variation.image),
        gallery: toStringArray(variation.gallery).slice(0, 3),
      };
    })
    .filter((variation) => variation.id && variation.sku);

  return variations;
}

export function normalizeProductDocumentForClient(doc: PlainRecord): ProductClientShape {
  const attributes = toAttributeOptions(doc.attributes);
  const variations = toVariations(doc.variations);
  const colorsFromDoc = toStringArray(doc.colors);
  const colorsFromAttributes =
    attributes.find((attribute) => {
      const name = attribute.name.toLowerCase();
      return name === 'color' || name === 'colour';
    })?.values ?? [];
  const gallery = toStringArray(doc.gallery);
  const legacyImages = toStringArray(doc.images);

  return {
    additionalInfo: toSpecificationRows(doc.additionalInfo),
    specifications: toSpecificationRows(doc.specifications),
    orderDetails: toSpecificationRows(doc.orderDetails),
    attributes,
    variations,
    features: toStringArray(doc.features),
    certifications: toStringArray(doc.certifications),
    colors: colorsFromDoc.length > 0 ? colorsFromDoc : colorsFromAttributes,
    gallery: gallery.length > 0 ? gallery : legacyImages,
    aplusImages: toStringArray(doc.aplusImages),
  };
}
