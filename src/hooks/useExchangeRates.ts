import { useMemo } from 'react';
import { ExchangeRatesData } from '../types';
import { useRealTimeRates } from './useRealTimeRates';

export interface UseExchangeRatesReturn {
  ratesData: ExchangeRatesData;
  currentRate: number | null;
  isRefreshing: boolean;
  refreshRates: () => Promise<void>;
  relativeTime: string;
  statusText: string;
  isLive: boolean;
  error: string | null;
}

export function useExchangeRates(
  fromCurrency: string = 'USD',
  toCurrency: string = 'INR'
): UseExchangeRatesReturn {
  const {
    rates,
    currentRate,
    loading,
    error,
    lastUpdated,
    apiTimestamp,
    isApiTimestamp,
    isDelayed,
    provider,
    statusText,
    refreshRates,
  } = useRealTimeRates(fromCurrency, toCurrency);

  const ratesData: ExchangeRatesData = useMemo(
    () => ({
      base: fromCurrency,
      rates,
      lastUpdated: Date.now(),
      isOffline: !!error,
      source: error ? 'error' : provider || 'live_api',
      statusText,
      apiTimestamp,
      isApiTimestamp,
      isDelayed,
    }),
    [fromCurrency, rates, error, provider, statusText, apiTimestamp, isApiTimestamp, isDelayed]
  );

  const isLive = !error && !loading && !isDelayed;

  return {
    ratesData,
    currentRate,
    isRefreshing: loading,
    refreshRates,
    relativeTime: lastUpdated,
    statusText,
    isLive,
    error,
  };
}
