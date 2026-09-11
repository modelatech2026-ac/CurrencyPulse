/**
 * CurrencyPulse Real-Time API Service
 * Fetches dynamic, real-time exchange rates from reliable live FX providers:
 * 1. FXRatesAPI (hourly/minute-level live market data)
 * 2. Coinbase Exchange Rates API (real-time live market updates, high availability)
 * 3. Pro ExchangeRate-API (if custom VITE_EXCHANGE_RATE_API_KEY is configured)
 *
 * Strict Compliance:
 * - Zero hardcoded exchange rates
 * - Zero mock or estimated data
 * - Always requests using selected FROM and TO currencies
 * - Accurate timestamp attribution: official market update timestamp vs. request fetch time
 * - Explicit indication of delayed vs. live rates
 * - Robust error handling with user-facing messages
 */

export interface FetchRateResult {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  allRates: Record<string, number>;
  provider: string;
  apiTimestamp: string | null;
  isOfficialTimestamp: boolean;
  isDelayed: boolean;
  fetchedAt: string;
}

interface MetaEnv {
  VITE_FXRATES_API_KEY?: string;
  VITE_EXCHANGE_RATE_API_KEY?: string;
}

function getEnv(): MetaEnv {
  try {
    return (import.meta as unknown as { env?: MetaEnv })?.env || {};
  } catch {
    return {};
  }
}

/**
 * Fetch latest live exchange rates using the selected currency pair
 */
export async function fetchLiveRatesFromApi(
  fromCurrency: string,
  toCurrency: string,
  signal?: AbortSignal
): Promise<FetchRateResult> {
  const fromCode = fromCurrency.trim().toUpperCase();
  const toCode = toCurrency.trim().toUpperCase();
  const env = getEnv();
  const timestampNow = Date.now();
  const fetchedAt = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const errors: string[] = [];

  // =========================================================================
  // Provider 0 (Optional): Paid ExchangeRate-API if custom API key is present
  // =========================================================================
  if (env.VITE_EXCHANGE_RATE_API_KEY && env.VITE_EXCHANGE_RATE_API_KEY.trim() !== '') {
    try {
      const apiKey = encodeURIComponent(env.VITE_EXCHANGE_RATE_API_KEY.trim());
      const endpoint = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${encodeURIComponent(fromCode)}?_t=${timestampNow}`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        cache: 'no-store',
        signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.result === 'success' && data.rates && typeof data.rates[toCode] === 'number') {
          const rate = data.rates[toCode];
          if (rate > 0) {
            return {
              fromCurrency: fromCode,
              toCurrency: toCode,
              rate,
              allRates: data.rates,
              provider: 'v6.exchangerate-api.com (Pro)',
              apiTimestamp: data.time_last_update_utc || null,
              isOfficialTimestamp: !!data.time_last_update_utc,
              isDelayed: false,
              fetchedAt,
            };
          }
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      errors.push(`ExchangeRate-API key attempt: ${err?.message || 'Failed'}`);
    }
  }

  // =========================================================================
  // Provider 1: FXRatesAPI (Live market data, updated every minute)
  // =========================================================================
  try {
    let endpoint = `https://api.fxratesapi.com/latest?base=${encodeURIComponent(fromCode)}&_t=${timestampNow}`;
    if (env.VITE_FXRATES_API_KEY && env.VITE_FXRATES_API_KEY.trim() !== '') {
      endpoint += `&api_key=${encodeURIComponent(env.VITE_FXRATES_API_KEY.trim())}`;
    }

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      cache: 'no-store',
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.rates && typeof data.rates[toCode] === 'number') {
        const rate = data.rates[toCode];
        if (rate > 0) {
          const dateStr = typeof data.date === 'string' && data.date.trim() !== '' ? data.date.trim() : null;
          return {
            fromCurrency: fromCode,
            toCurrency: toCode,
            rate,
            allRates: data.rates,
            provider: 'fxratesapi.com',
            apiTimestamp: dateStr,
            isOfficialTimestamp: !!dateStr,
            isDelayed: false,
            fetchedAt,
          };
        }
      }
    } else {
      errors.push(`FXRatesAPI returned HTTP ${res.status}`);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    errors.push(`FXRatesAPI network error: ${err?.message || 'Connection failed'}`);
  }

  // =========================================================================
  // Provider 2: Coinbase Live Exchange Rates API (High availability, real-time)
  // =========================================================================
  try {
    const endpoint = `https://api.coinbase.com/v2/exchange-rates?currency=${encodeURIComponent(fromCode)}&_t=${timestampNow}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      cache: 'no-store',
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      const rawRates = data?.data?.rates;
      if (rawRates && typeof rawRates === 'object') {
        const rawTargetRate = rawRates[toCode];
        if (rawTargetRate !== undefined) {
          const parsedRate = parseFloat(rawTargetRate);
          if (!isNaN(parsedRate) && parsedRate > 0) {
            // Convert string rates object to numeric table
            const numericRates: Record<string, number> = {};
            for (const [k, v] of Object.entries(rawRates)) {
              const n = parseFloat(v as string);
              if (!isNaN(n) && n > 0) {
                numericRates[k] = n;
              }
            }

            return {
              fromCurrency: fromCode,
              toCurrency: toCode,
              rate: parsedRate,
              allRates: numericRates,
              provider: 'coinbase.com',
              apiTimestamp: null, // Coinbase returns live rate without market update timestamp
              isOfficialTimestamp: false,
              isDelayed: false,
              fetchedAt,
            };
          }
        }
      }
    } else {
      errors.push(`Coinbase returned HTTP ${res.status}`);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    errors.push(`Coinbase network error: ${err?.message || 'Connection failed'}`);
  }

  // =========================================================================
  // Provider 3: Open.er-api.com (Fallback only - explicitly flagged as DELAYED)
  // =========================================================================
  try {
    const endpoint = `https://open.er-api.com/v6/latest/${encodeURIComponent(fromCode)}?_t=${timestampNow}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      cache: 'no-store',
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.result === 'success' && data.rates && typeof data.rates[toCode] === 'number') {
        const rate = data.rates[toCode];
        if (rate > 0) {
          return {
            fromCurrency: fromCode,
            toCurrency: toCode,
            rate,
            allRates: data.rates,
            provider: 'open.er-api.com (Daily Snapshot)',
            apiTimestamp: data.time_last_update_utc || null,
            isOfficialTimestamp: !!data.time_last_update_utc,
            isDelayed: true, // Clearly flag that open.er-api rates are delayed daily snapshots
            fetchedAt,
          };
        }
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    errors.push(`Open.er-api error: ${err?.message || 'Failed'}`);
  }

  // If all real-time and fallback providers fail, return a clear error
  // Never synthesize, estimate, or hardcode fake rates!
  throw new Error('Unable to fetch the latest exchange rate. Please try again.');
}
