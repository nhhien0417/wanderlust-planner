export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

/**
 * Get currency symbol for a given currency code
 * @param code - ISO currency code (e.g., 'USD', 'EUR')
 * @returns Currency symbol (e.g., '$', '€')
 */
export const getCurrencySymbol = (code?: string): string => {
  if (!code) return "$"; // Default to USD
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol || "$";
};

/**
 * Format amount with currency symbol
 * @param amount - Numeric amount
 * @param currencyCode - ISO currency code
 * @returns Formatted string (e.g., '$1,234.56')
 */
export const formatCurrency = (
  amount: number,
  currencyCode?: string
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // For some currencies, symbol goes after the amount
  if (currencyCode === "VND" || currencyCode === "THB") {
    return `${formattedAmount}${symbol}`;
  }

  return `${symbol}${formattedAmount}`;
};

/**
 * Get currency name from code
 * @param code - ISO currency code
 * @returns Full currency name
 */
export const getCurrencyName = (code?: string): string => {
  if (!code) return "US Dollar";
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.name || "US Dollar";
};
