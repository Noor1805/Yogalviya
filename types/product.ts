export interface PricingTier {
  minQty: number;
  maxQty: number | null;
  priceUSD: number;
  priceINR: number;
}

export interface Specification {
  label: string;
  value: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface AttributeOption {
  name: string;
  values: string[];
  colorValues?: Record<string, string>;
}

export interface Variation {
  id: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockCount: number;
  image?: string;
  gallery?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  categorySlug: string;
  shortDescription?: string;
  subheadingDescription?: string;
  longDescription: string;
  productDetails?: string;
  commitment?: string;
  additionalInfo?: Specification[];
  features?: string[];
  specifications: Specification[];
  specificationsTitle?: string;
  orderDetails?: Specification[];
  orderDetailsTitle?: string;
  basePriceUSD: number;
  basePriceINR: number;
  moq: number;
  images: string[];
  aplusImages?: string[];
  heroImage: string;
  certifications?: string[];
  colors?: string[];
  weight?: string;
  inStock: boolean;
  featured: boolean;
  shippingTag?: string;
  // Variable product support
  productType?: 'simple' | 'variable';
  attributes?: AttributeOption[];
  variations?: Variation[];
  compareAtPrice?: number;
  sku?: string;
  stockCount?: number;
  // UI-only (frontend computed)
  badge?: string;
  stockLeft?: number;
}

export type ProductCategory =
  | 'Gowns'
  | 'Suits'
  | 'Dresses'
  | 'Accessories'
  | 'Fine Jewelry';

export interface CategoryInfo {
  name: ProductCategory;
  slug: string;
  description: string;
  image: string;
}
