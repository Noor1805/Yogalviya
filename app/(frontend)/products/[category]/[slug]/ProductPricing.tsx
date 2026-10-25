'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import { useCurrency, formatCurrency } from '@/lib/utils/currency';
import { getPriceByQuantity } from '@/lib/utils/pricing';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductPricingProps {
    product: Product;
}

export default function ProductPricing({ product }: ProductPricingProps) {
    const { currency } = useCurrency();
    const [quantity, setQuantity] = useState(product.moq);

    const dynamicPrice = getPriceByQuantity(product, quantity, currency);
    const totalPrice = dynamicPrice ? dynamicPrice * quantity : null;

    const basePrice = currency === 'USD' ? product.basePriceUSD : product.basePriceINR;

    return (
        <div className="mt-8">
            {/* Base Price Card */}
            <div className="overflow-hidden rounded-none border-b border-neutral-100 bg-white py-6 flex justify-between items-center mb-8">
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Starting Price</h4>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-serif text-black italic">{formatCurrency(basePrice, currency)}</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-2">/ bespoke piece</span>
                </div>
            </div>

            {/* Quantity Selector & Dynamic Price */}
            <div className="mt-8 rounded-none border border-neutral-100 bg-neutral-50 p-6">
                <div className="flex items-center gap-8">
                    <div className="flex-1">
                        <Label htmlFor="qty-selector" className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                            Quantity
                        </Label>
                        <Input
                            id="qty-selector"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                            min={1}
                            className="mt-3 rounded-none border-neutral-200 bg-white text-black focus:border-black focus:ring-0 h-11"
                        />
                    </div>
                    <div className="text-right">
                        {dynamicPrice ? (
                            <div className="animate-fade-in">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Unit Price</p>
                                <p className="text-3xl font-serif text-black italic">
                                    {formatCurrency(dynamicPrice, currency)}
                                </p>
                                {totalPrice && (
                                    <p className="mt-1 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Total: {formatCurrency(totalPrice, currency)}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                Min. {product.moq} units
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
