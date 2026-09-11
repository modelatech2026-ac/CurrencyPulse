export type CalculatorMode = 'standard' | 'scientific' | 'currency' | 'hourly';

export type AngleMode = 'deg' | 'rad';

export type ThemeMode = 'dark' | 'light';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate?: number; // Optional; dynamic rates are retrieved from live API
  locale?: string;
}

export interface ExchangeRatesData {
  base: string;
  rates: Record<string, number>;
  lastUpdated: number; // timestamp
  isOffline: boolean;
  source: string;
  statusText?: string;
  apiTimestamp?: string | null;
  isApiTimestamp?: boolean;
  isDelayed?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  mode: CalculatorMode;
  baseCurrency?: string;
  baseAmount?: number;
  targetCurrency?: string;
  targetAmount?: number;
}

export interface KeypadKey {
  id: string;
  label: string;
  action: string;
  display?: string;
  type: 'digit' | 'operator' | 'function' | 'clear' | 'equals' | 'memory';
  span?: number;
  ariaLabel?: string;
  tooltip?: string;
}
