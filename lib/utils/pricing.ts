import { Product } from '@/types/product';
import type { Currency } from './currency-utils';
import { summarizeVariations } from './product-admin';

export function getStartingPrice(product: Product, currency: Currency): number {
    // For variable products, use the minimum variation price
    if (product.productType === 'variable' && product.variations && product.variations.length > 0) {
        const summary = summarizeVariations(product.variations);
        return currency === 'USD' ? summary.minPrice : summary.minPrice;
    }
    return currency === 'USD' ? product.basePriceUSD : product.basePriceINR;
}

export function getPriceByQuantity(
    product: Product,
    qty: number,
    currency: Currency
): number | null {
    return getStartingPrice(product, currency);
}

export function getLowestPrice(product: Product, currency: Currency): number {
    return getStartingPrice(product, currency);
}

export function getPriceRange(product: Product, currency: Currency): { min: number; max: number; hasRange: boolean } {
    if (product.productType === 'variable' && product.variations && product.variations.length > 0) {
        const summary = summarizeVariations(product.variations);
        const min = currency === 'USD' ? summary.minPrice : summary.minPrice;
        const max = currency === 'USD' ? summary.maxPrice : summary.maxPrice;
        return { min, max, hasRange: min !== max };
    }
    const price = currency === 'USD' ? product.basePriceUSD : product.basePriceINR;
    return { min: price, max: price, hasRange: false };
}
