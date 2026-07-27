export type CurrencyCode = "LAK" | "THB" | "USD";

export const DEFAULT_CURRENCY: CurrencyCode = "LAK";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  LAK: "₭",
  THB: "฿",
};

/** Delivery flat rate expressed in each supported currency (kept in sync with the DB trigger). */
export const DELIVERY_FEES: Record<string, number> = {
  LAK: 20000,
  THB: 35,
  USD: 1,
};

/** Currencies without minor units — never show decimals for these. */
const ZERO_DECIMAL = new Set(["LAK"]);

export function normalizeCurrency(currency?: string | null): string {
  return (currency || DEFAULT_CURRENCY).toUpperCase();
}

export function currencySymbol(currency?: string | null): string {
  const code = normalizeCurrency(currency);
  return CURRENCY_SYMBOLS[code] || `${code} `;
}

export function deliveryFeeFor(currency?: string | null): number {
  return DELIVERY_FEES[normalizeCurrency(currency)] ?? 0;
}

/** Formats an amount with the correct symbol and decimal precision for its currency. */
export function formatMoney(amount: number | string | null | undefined, currency?: string | null): string {
  const code = normalizeCurrency(currency);
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  const decimals = ZERO_DECIMAL.has(code) ? 0 : 2;
  return `${currencySymbol(code)}${safe.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
