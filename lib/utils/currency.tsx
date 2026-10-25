'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatCurrency, type Currency } from './currency-utils';

export { formatCurrency, type Currency };

interface CurrencyContextType {
    currency: Currency;
    formatPrice: (amountUSD: number, amountINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('INR');

    useEffect(() => {
        // Default to INR for Yoglivya yoga & wellness store
        setCurrency('INR');
    }, []);

    const formatPrice = (amountUSD: number, amountINR: number) => {
        return formatCurrency(currency === 'USD' ? amountUSD : amountINR, currency);
    };

    return (
        <CurrencyContext.Provider value={{ currency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
