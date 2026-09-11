import { Currency, ExchangeRatesData } from '../types';
import { fetchLiveRatesFromApi } from '../services/currencyApi';

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', flag: '🇸🇦' },
  { code: 'TWD', name: 'Taiwan New Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
];

export function getRelativeTimeString(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);

  if (diffSec < 3) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Fetch dynamic live exchange rates with zero hardcoded/mock fallback rates.
 */
export async function fetchLiveExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRatesData> {
  try {
    const result = await fetchLiveRatesFromApi(baseCurrency, 'INR');
    return {
      base: baseCurrency,
      rates: result.allRates,
      lastUpdated: Date.now(),
      isOffline: false,
      source: result.provider,
      statusText: result.apiTimestamp
        ? `● Rates Live · Updated: ${result.apiTimestamp}`
        : `● Rates Live · Fetched at ${result.fetchedAt}`,
      apiTimestamp: result.apiTimestamp,
      isApiTimestamp: result.isOfficialTimestamp,
      isDelayed: result.isDelayed,
    };
  } catch (error: any) {
    return {
      base: baseCurrency,
      rates: {},
      lastUpdated: Date.now(),
      isOffline: true,
      source: 'error',
      statusText: error?.message || 'Unable to fetch the latest exchange rate. Please try again.',
      apiTimestamp: null,
      isApiTimestamp: false,
      isDelayed: false,
    };
  }
}

/**
 * Accurate conversion engine logic using actual rates directly:
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates?: Record<string, number> | number | null
): number => {
  if (!rates || isNaN(amount) || amount === 0) {
    return 0;
  }

  if (fromCurrency === toCurrency) {
    return Number(amount.toFixed(2));
  }

  // 1. Direct single rate value
  if (typeof rates === 'number') {
    if (isNaN(rates) || rates <= 0) return 0;
    return Number((amount * rates).toFixed(2));
  }

  // 2. Direct rate check: if rates table contains toCurrency
  if (typeof rates[toCurrency] === 'number' && rates[toCurrency] > 0) {
    if (rates[fromCurrency] === 1 || !rates[fromCurrency] || fromCurrency === 'USD') {
      return Number((amount * rates[toCurrency]).toFixed(2));
    }
  }

  // 3. Converting to USD
  if (toCurrency === 'USD' && typeof rates[fromCurrency] === 'number' && rates[fromCurrency] > 0) {
    return Number((amount / rates[fromCurrency]).toFixed(2));
  }

  // 4. Cross-rate conversion standardizing through base
  const sourceRate = rates[fromCurrency];
  const targetRate = rates[toCurrency];
  if (sourceRate && targetRate && sourceRate > 0 && targetRate > 0) {
    const amountInBase = amount / sourceRate;
    const convertedResult = amountInBase * targetRate;
    return Number(convertedResult.toFixed(2));
  }

  return 0;
};

export const calculateConversion = convertCurrency;

/**
 * Formats a currency value with appropriate decimals & currency symbol
 */
export function formatCurrencyValue(value: number, currencyCode: string): string {
  if (isNaN(value) || !isFinite(value)) return '0.00';

  const zeroDecimalCurrencies = ['JPY', 'KRW', 'IDR'];
  const fractionDigits = zeroDecimalCurrencies.includes(currencyCode) ? 0 : 2;

  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits > 0 ? (Math.abs(value) < 0.01 && value !== 0 ? 4 : fractionDigits) : 0,
    }).format(value);
  } catch {
    return value.toFixed(fractionDigits);
  }
}
