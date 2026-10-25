export type Currency = 'USD' | 'INR';

export function formatCurrency(amount: number, currency: Currency): string {
    const formatter = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'INR' ? 0 : 2,
        maximumFractionDigits: 2,
    });
    return formatter.format(amount);
}
