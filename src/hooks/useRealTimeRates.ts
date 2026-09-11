import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLiveRatesFromApi } from '../services/currencyApi';

export interface ExchangeRates {
  [currencyCode: string]: number;
}

export interface UseRealTimeRatesReturn {
  rates: ExchangeRates;
  currentRate: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string;
  apiTimestamp: string | null;
  isApiTimestamp: boolean;
  isDelayed: boolean;
  provider: string;
  statusText: string;
  refreshRates: () => Promise<void>;
}

function formatApiDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toUTCString().replace('GMT', 'UTC');
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Custom Hook for Real-Time Exchange Rates connecting to live currency API
export const useRealTimeRates = (
  fromCurrency: string = 'USD',
  toCurrency: string = 'INR'
): UseRealTimeRatesReturn => {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiTimestamp, setApiTimestamp] = useState<string | null>(null);
  const [isApiTimestamp, setIsApiTimestamp] = useState<boolean>(false);
  const [isDelayed, setIsDelayed] = useState<boolean>(false);
  const [provider, setProvider] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('Connecting to live exchange-rate API...');

  const isMountedRef = useRef(true);
  const activeControllerRef = useRef<AbortController | null>(null);

  const fetchRates = useCallback(async () => {
    // Cancel any in-flight request
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchLiveRatesFromApi(fromCurrency, toCurrency, controller.signal);

      if (!isMountedRef.current) return;

      setRates(result.allRates);
      setCurrentRate(result.rate);
      setApiTimestamp(result.apiTimestamp);
      setIsApiTimestamp(result.isOfficialTimestamp);
      setIsDelayed(result.isDelayed);
      setProvider(result.provider);

      if (result.isDelayed) {
        const timeLabel = result.apiTimestamp ? formatApiDate(result.apiTimestamp) : result.fetchedAt;
        setLastUpdated(timeLabel);
        setStatusText(`○ Delayed Rates (updated daily) · Snapshot: ${timeLabel}`);
      } else if (result.isOfficialTimestamp && result.apiTimestamp) {
        const formattedDate = formatApiDate(result.apiTimestamp);
        setLastUpdated(formattedDate);
        setStatusText(`● Rates Live · Market updated: ${formattedDate}`);
      } else {
        setLastUpdated(result.fetchedAt);
        setStatusText(`● Rates Live · Fetched at ${result.fetchedAt}`);
      }

      setError(null);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return; // Ignore aborted request
      }
      if (!isMountedRef.current) return;

      const errorMessage = err?.message || 'Unable to fetch the latest exchange rate. Please try again.';
      setError(errorMessage);
      setCurrentRate(null);
      setRates({});
      setStatusText(`○ Error · ${errorMessage}`);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRates();

    // 60s auto-refresh loop for live market rates
    const interval = setInterval(fetchRates, 60000);

    const handleOnline = () => fetchRates();
    const handleOffline = () => {
      if (isMountedRef.current) {
        setError('Network offline: Unable to reach exchange rate API.');
        setStatusText('○ Offline · Network connection lost');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMountedRef.current = false;
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchRates]);

  return {
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
    refreshRates: fetchRates,
  };
};

// Conversion Utility Calculation Engine
export const calculateConversion = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  ratesOrRate?: ExchangeRates | number | null
): number => {
  if (isNaN(amount) || amount === 0) {
    return 0;
  }

  // If identical currencies
  if (fromCurrency === toCurrency) {
    return Number(amount.toFixed(2));
  }

  // 1. Direct single-rate calculation: exact rate returned by the API
  if (typeof ratesOrRate === 'number') {
    if (isNaN(ratesOrRate) || ratesOrRate <= 0) return 0;
    return Number((amount * ratesOrRate).toFixed(2));
  }

  // 2. Lookup in rates table returned by API for fromCurrency
  if (ratesOrRate && typeof ratesOrRate === 'object') {
    const directRate = ratesOrRate[toCurrency];
    if (typeof directRate === 'number' && !isNaN(directRate) && directRate > 0) {
      return Number((amount * directRate).toFixed(2));
    }

    // Cross-rate calculation if table contains USD base
    const sourceRate = ratesOrRate[fromCurrency];
    const targetRate = ratesOrRate[toCurrency];
    if (sourceRate && targetRate && sourceRate > 0 && targetRate > 0) {
      const amountInBase = amount / sourceRate;
      return Number((amountInBase * targetRate).toFixed(2));
    }
  }

  return 0;
};

// Also export convertCurrency alias for full backwards-compatibility
export const convertCurrency = calculateConversion;
