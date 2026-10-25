import { isVisualAttribute, variationHasMedia, variationMediaScore } from './product-variant-selection';

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductAttributeOption {
  name: string;
  values: string[];
  colorValues?: Record<string, string>;
}

export interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockCount: number;
  image?: string;
  gallery?: string[];
}

export interface ProductDraftShape {
  name: string;
  slug?: string;
  productType: 'simple' | 'variable';
  category: string;
  categorySlug: string;
  description?: string;
  longDescription?: string;
  shortDescription?: string;
  additionalDescription?: string;
  subheadingDescription?: string;
  productDetails?: string;
  commitment?: string;
  additionalInfo?: Array<{ label: string; value: string }>;
  price?: number;
  compareAtPrice?: number | null;
  sku?: string;
  stockCount?: number;
  specifications?: ProductSpecification[];
  mainImage?: string;
  gallery?: string[];
  attributes?: ProductAttributeOption[];
  variations?: ProductVariation[];
  status?: 'draft' | 'published';
  featured?: boolean;
  badge?: string;
  availableBadges?: string[];
  heroImage?: string;
  images?: string[];
  inStock?: boolean;
}

export interface VariationSummary {
  count: number;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  minCompareAtPrice?: number;
}

function trimText(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function uniqueCaseInsensitive(values: string[]) {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const value of values) {
    const trimmed = trimText(value);
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    cleaned.push(trimmed);
  }

  return cleaned;
}

export function slugify(value: string) {
  return trimText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildVariationSignature(attributes: Record<string, unknown>) {
  return Object.entries(attributes)
    .map(([key, value]) => [trimText(key), trimText(value)] as const)
    .filter(([key, value]) => key && value)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${slugify(key)}:${slugify(value)}`)
    .join('|');
}

export function buildVisualVariationSignature(attributes: Record<string, unknown>) {
  return Object.entries(attributes)
    .map(([key, value]) => [trimText(key), trimText(value)] as const)
    .filter(([key, value]) => key && value && isVisualAttribute(key))
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${slugify(key)}:${slugify(value)}`)
    .join('|');
}

export function cleanAttributeOptions(attributes: (ProductAttributeOption & { colorValues?: Record<string, string> })[] = []) {
  return attributes
    .map((attribute) => ({
      name: trimText(attribute.name),
      values: uniqueCaseInsensitive(attribute.values ?? []),
      colorValues: attribute.colorValues || {},
    }))
    .filter((attribute) => attribute.name && attribute.values.length > 0);
}

export function summarizeVariations(variations: ProductVariation[] = []): VariationSummary {
  if (variations.length === 0) {
    return {
      count: 0,
      totalStock: 0,
      minPrice: 0,
      maxPrice: 0,
      minCompareAtPrice: undefined,
    };
  }

  const prices = variations.map((variation) => variation.price || 0);
  const comparePrices = variations
    .map((variation) => variation.compareAtPrice)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  return {
    count: variations.length,
    totalStock: variations.reduce((total, variation) => total + Math.max(0, variation.stockCount || 0), 0),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minCompareAtPrice: comparePrices.length ? Math.min(...comparePrices) : undefined,
  };
}

export function reconcileVariations(
  attributes: ProductAttributeOption[] = [],
  currentVariations: ProductVariation[] = [],
  defaults: { slug?: string; price?: number; compareAtPrice?: number | null; stockCount?: number; mainImage?: string }
) {
  const cleanedAttributes = cleanAttributeOptions(attributes);
  if (cleanedAttributes.length === 0) {
    return [];
  }

  const currentMap = new Map(
    currentVariations
      .map((variation) => [buildVariationSignature(variation.attributes), variation] as const)
      .filter(([signature]) => signature)
  );

  const combos = cleanedAttributes.reduce<Record<string, string>[]>((accumulator, attribute) => {
    if (accumulator.length === 0) {
      return attribute.values.map((value) => ({ [attribute.name]: value }));
    }

    return accumulator.flatMap((existingCombo) =>
      attribute.values.map((value) => ({ ...existingCombo, [attribute.name]: value }))
    );
  }, []);

  return combos.map((combo, index) => {
    const signature = buildVariationSignature(combo);
    const existing = currentMap.get(signature);
    
    // We prioritize signature matching, but if IDs were manually mismatched 
    // due to attribute edits, the ProductEditor should have updated them.
    
    const skuSuffix = Object.values(combo)
      .map((value) => value.toUpperCase().replace(/\s+/g, '').slice(0, 4))
      .join('-');

    const gallery = existing?.gallery ?? [];

    return {
      id: existing?.id || `var_${Date.now()}_${index}`,
      attributes: combo,
      price: existing?.price ?? defaults.price ?? 0,
      compareAtPrice:
        existing?.compareAtPrice ??
        (typeof defaults.compareAtPrice === 'number' ? defaults.compareAtPrice : undefined),
      sku: existing?.sku || `${(defaults.slug || 'SKU').toUpperCase()}-${skuSuffix}`,
      stockCount: existing?.stockCount ?? defaults.stockCount ?? 0,
      image: existing?.image || defaults.mainImage || '',
      // DO NOT filter Boolean here, preserve the array length and slots for the editor
      gallery: Array.isArray(gallery) ? gallery.slice(0, 3) : [],
    };
  });
}

export function normalizeVariationMediaByVisualAttributes(variations: ProductVariation[] = []) {
  if (variations.length === 0) {
    return [];
  }

  const representativeByVisualSignature = new Map<string, ProductVariation>();

  variations.forEach((variation) => {
    const visualSignature = buildVisualVariationSignature(variation.attributes);
    if (!visualSignature || !variationHasMedia(variation)) {
      return;
    }

    const currentRepresentative = representativeByVisualSignature.get(visualSignature);
    if (
      !currentRepresentative ||
      variationMediaScore(variation) > variationMediaScore(currentRepresentative)
    ) {
      representativeByVisualSignature.set(visualSignature, variation);
    }
  });

  return variations.map((variation) => {
    const visualSignature = buildVisualVariationSignature(variation.attributes);
    const representative = visualSignature
      ? representativeByVisualSignature.get(visualSignature)
      : undefined;

    if (!representative) {
      return {
        ...variation,
        gallery: Array.isArray(variation.gallery) ? variation.gallery.slice(0, 3) : [],
      };
    }

    return {
      ...variation,
      image: representative.image ?? variation.image ?? '',
      gallery: Array.isArray(representative.gallery) ? representative.gallery.slice(0, 3) : [],
    };
  });
}

export function normalizeProductDraft(input: ProductDraftShape) {
  const productType = input.productType === 'variable' ? 'variable' : 'simple';
  const name = trimText(input.name);
  const slug = slugify(input.slug || name);
  const category = trimText(input.category);
  const categorySlug = slugify(input.categorySlug || category);
  const description = trimText(
    input.description !== undefined ? input.description : input.longDescription
  );
  const shortDescription = trimText(
    input.shortDescription !== undefined
      ? input.shortDescription
      : input.additionalDescription !== undefined
        ? input.additionalDescription
        : input.subheadingDescription
  );
  const productDetails = trimText(input.productDetails);
  const commitment = trimText(input.commitment);
  const additionalInfo = (input.additionalInfo ?? [])
    .map((item) => ({
      label: trimText(item.label),
      value: trimText(item.value),
    }))
    .filter((item) => item.label && item.value);
  const specifications = (input.specifications ?? [])
    .map((specification) => ({
      label: trimText(specification.label),
      value: trimText(specification.value),
    }))
    .filter((specification) => specification.label && specification.value);

  const allGallery = uniqueCaseInsensitive([...(input.gallery ?? []), ...(input.images ?? [])]);
  const mainImage = trimText(input.mainImage || input.heroImage || allGallery[0] || '');
  const gallery = allGallery.filter((image) => image !== mainImage);

  const attributes = productType === 'variable' ? cleanAttributeOptions(input.attributes) : [];
  const variations =
    productType === 'variable'
      ? normalizeVariationMediaByVisualAttributes(
          reconcileVariations(attributes, input.variations ?? [], {
            slug,
            price: input.price,
            compareAtPrice: input.compareAtPrice,
            stockCount: input.stockCount,
            mainImage,
          })
        )
      : [];

  const variationSummary = summarizeVariations(variations);
  const simplePrice = typeof input.price === 'number' ? input.price : 0;
  const simpleCompareAtPrice =
    typeof input.compareAtPrice === 'number' && Number.isFinite(input.compareAtPrice)
      ? input.compareAtPrice
      : undefined;
  const simpleStockCount = typeof input.stockCount === 'number' ? Math.max(0, input.stockCount) : 0;

  const price = productType === 'variable' ? variationSummary.minPrice : simplePrice;
  const compareAtPrice = productType === 'variable' ? variationSummary.minCompareAtPrice : simpleCompareAtPrice;
  const stockCount = productType === 'variable' ? variationSummary.totalStock : simpleStockCount;
  const sku = productType === 'variable' ? '' : trimText(input.sku || slug.toUpperCase());

  return {
    name,
    slug,
    productType,
    category,
    categorySlug,
    description,
    shortDescription,
    productDetails,
    commitment,
    additionalInfo,
    price,
    compareAtPrice,
    sku,
    stockCount,
    specifications,
    mainImage,
    gallery,
    attributes,
    variations,
    status: input.status === 'published' ? 'published' : 'draft',
    featured: Boolean(input.featured),
    badge: trimText(input.badge || ''),
    availableBadges: Array.isArray(input.availableBadges) ? input.availableBadges.map(b => trimText(b).toUpperCase()).filter(Boolean) : [],
    heroImage: mainImage,
    images: gallery,
    inStock: stockCount > 0,
  };
}

export function validateProductDraft(input: ReturnType<typeof normalizeProductDraft>) {
  const errors: string[] = [];

  if (!input.name) errors.push('Product name is required.');
  if (!input.category || !input.categorySlug) errors.push('A valid category is required.');

  if (input.productType === 'variable') {
    if (input.attributes.length === 0) {
      errors.push('Add at least one attribute for a variable product.');
    }

    if (input.variations.length === 0) {
      errors.push('Generate at least one variation for a variable product.');
    }

    const invalidVariation = input.variations.find(
      (variation) =>
        !variation.sku ||
        Object.keys(variation.attributes).length !== input.attributes.length
    );

    if (invalidVariation) {
      errors.push('Every variation needs a complete attribute set and SKU.');
    }
  } else if (!input.sku) {
    errors.push('SKU is required for a simple product.');
  }

  return errors;
}
