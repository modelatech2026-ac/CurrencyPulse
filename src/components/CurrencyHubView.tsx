import React, { useState, useEffect, useMemo } from 'react';
import { Currency, ExchangeRatesData } from '../types';
import { CURRENCIES, formatCurrencyValue } from '../data/currencies';
import { CurrencySearchModal } from './CurrencySearchModal';
import { useRealTimeRates, calculateConversion } from '../hooks/useRealTimeRates';
import {
  ArrowUpDown,
  RefreshCw,
  Copy,
  Check,
  Calculator,
  Wifi,
  WifiOff,
  ChevronDown,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export interface CurrencyHubViewProps {
  baseCurrency?: Currency;
  targetCurrency?: Currency;
  ratesData?: ExchangeRatesData;
  onSelectBase?: (c: Currency) => void;
  onSelectTarget?: (c: Currency) => void;
  onSwapCurrencies?: () => void;
  onRefreshRates?: () => Promise<void>;
  isRefreshingRates?: boolean;
  onSendToCalculator?: (amount: number) => void;
  statusText?: string;
}

// Preset favorite currencies for quick 1-tap switching
const FAVORITE_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
const QUICK_AMOUNTS = [1, 5, 10, 50, 100, 500, 1000];

export const CurrencyHubView: React.FC<CurrencyHubViewProps> = ({
  baseCurrency: propBaseCurrency,
  targetCurrency: propTargetCurrency,
  ratesData: propRatesData,
  onSelectBase: propOnSelectBase,
  onSelectTarget: propOnSelectTarget,
  onSwapCurrencies: propOnSwapCurrencies,
  onRefreshRates: propOnRefreshRates,
  isRefreshingRates: propIsRefreshingRates,
  onSendToCalculator,
  statusText: propStatusText,
}) => {
  // Fallback state if props are not provided (defaulting to USD -> INR)
  const defaultBase = useMemo(() => CURRENCIES.find(c => c.code === 'USD') || CURRENCIES[0], []);
  const defaultTarget = useMemo(() => CURRENCIES.find(c => c.code === 'INR') || CURRENCIES[8] || CURRENCIES[1], []);

  const [internalBaseCurrency, setInternalBaseCurrency] = useState<Currency>(defaultBase);
  const [internalTargetCurrency, setInternalTargetCurrency] = useState<Currency>(defaultTarget);

  const baseCurrency = propBaseCurrency || internalBaseCurrency;
  const targetCurrency = propTargetCurrency || internalTargetCurrency;

  // 1. Direct integration of the useRealTimeRates hook with selected FROM and TO currencies
  const {
    rates: hookRates,
    currentRate: hookCurrentRate,
    loading: hookLoading,
    error: hookError,
    lastUpdated: hookLastUpdated,
    apiTimestamp: hookApiTimestamp,
    statusText: hookStatusText,
    refreshRates: hookRefreshRates,
  } = useRealTimeRates(baseCurrency.code, targetCurrency.code);

  const handleSelectBase = (c: Currency) => {
    if (propOnSelectBase) {
      propOnSelectBase(c);
    } else {
      setInternalBaseCurrency(c);
    }
  };

  const handleSelectTarget = (c: Currency) => {
    if (propOnSelectTarget) {
      propOnSelectTarget(c);
    } else {
      setInternalTargetCurrency(c);
    }
  };

  const handleSwapCurrencies = () => {
    if (propOnSwapCurrencies) {
      propOnSwapCurrencies();
    } else {
      setInternalBaseCurrency(targetCurrency);
      setInternalTargetCurrency(baseCurrency);
    }
  };

  // Active exchange rate directly resolved from the API
  const activeRate = useMemo(() => {
    if (baseCurrency.code === targetCurrency.code) {
      return 1;
    }
    if (typeof hookCurrentRate === 'number' && !isNaN(hookCurrentRate) && hookCurrentRate > 0) {
      return hookCurrentRate;
    }
    if (propRatesData?.rates && typeof propRatesData.rates[targetCurrency.code] === 'number') {
      return propRatesData.rates[targetCurrency.code];
    }
    return null;
  }, [baseCurrency.code, targetCurrency.code, hookCurrentRate, propRatesData?.rates]);

  // Rates resolution table for search modal
  const activeRates = useMemo(() => {
    if (hookRates && Object.keys(hookRates).length > 0) {
      return hookRates;
    }
    if (propRatesData?.rates && Object.keys(propRatesData.rates).length > 0) {
      return propRatesData.rates;
    }
    return {};
  }, [hookRates, propRatesData?.rates]);

  // Status text and connectivity state
  const isOffline = !!hookError || (propRatesData?.isOffline ?? false);
  const displayStatus = useMemo(() => {
    if (hookLoading) {
      return `Fetching live API data for ${baseCurrency.code} → ${targetCurrency.code}...`;
    }
    if (hookError) {
      return `○ API Error: ${hookError}`;
    }
    if (hookApiTimestamp) {
      return `● Rates Live · Updated: ${hookApiTimestamp}`;
    }
    if (hookLastUpdated) {
      return `● Rates Live · Fetched at ${hookLastUpdated}`;
    }
    if (propStatusText) {
      return propStatusText;
    }
    return `● Rates Live · Connected`;
  }, [hookLoading, hookError, hookApiTimestamp, hookLastUpdated, baseCurrency.code, targetCurrency.code, propStatusText]);

  const isRefreshing = hookLoading || (propIsRefreshingRates ?? false);

  const handleManualRefresh = async () => {
    try {
      await hookRefreshRates();
      if (propOnRefreshRates) {
        await propOnRefreshRates();
      }
    } catch (err) {
      console.warn('Manual rates refresh failed', err);
    }
  };

  // Input string state: default to '1' so entering 1 USD dynamically outputs the live equivalent
  const [baseAmountStr, setBaseAmountStr] = useState<string>('1');
  const [targetAmountStr, setTargetAmountStr] = useState<string>('');
  const [activeFocus, setActiveFocus] = useState<'base' | 'target' | null>(null);
  const [pickerType, setPickerType] = useState<'base' | 'target' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Synchronize target value whenever base amount or live rate changes
  useEffect(() => {
    if (activeFocus !== 'target') {
      const num = parseFloat(baseAmountStr);
      if (isNaN(num) || baseAmountStr === '') {
        setTargetAmountStr('');
        return;
      }
      if (activeRate !== null && activeRate > 0) {
        const converted = num * activeRate;
        setTargetAmountStr(converted.toFixed(2));
      } else if (hookError) {
        setTargetAmountStr('—');
      } else {
        setTargetAmountStr('');
      }
    }
  }, [baseAmountStr, activeRate, activeFocus, hookError]);

  // Handle Base Input Change (Instant reactive calculation using API rate)
  const handleBaseChange = (value: string) => {
    setBaseAmountStr(value);
    const num = parseFloat(value);
    if (isNaN(num) || value === '') {
      setTargetAmountStr('');
      return;
    }
    if (activeRate !== null && activeRate > 0) {
      const converted = num * activeRate;
      setTargetAmountStr(converted.toFixed(2));
    } else if (hookError) {
      setTargetAmountStr('—');
    } else {
      setTargetAmountStr('');
    }
  };

  // Handle Target Input Change (Bidirectional recalculation)
  const handleTargetChange = (value: string) => {
    setTargetAmountStr(value);
    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num) || value === '') {
      setBaseAmountStr('');
      return;
    }
    if (activeRate !== null && activeRate > 0) {
      setBaseAmountStr((num / activeRate).toFixed(2));
    } else {
      setBaseAmountStr('');
    }
  };

  // Swap currencies with smooth animation and instant reverse API fetch
  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 350);
    handleSwapCurrencies();
  };

  // One-tap favorite currency select
  const handleFavoriteClick = (code: string) => {
    const cur = CURRENCIES.find(c => c.code === code);
    if (!cur) return;

    if (cur.code === baseCurrency.code) {
      handleSwap();
    } else {
      handleSelectTarget(cur);
    }
  };

  // Copy converted result to clipboard
  const handleCopy = () => {
    const cleanNum = targetAmountStr.replace(/,/g, '');
    navigator.clipboard.writeText(`${cleanNum} ${targetCurrency.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Unit rate display: exact rate received directly from the API
  const unitRateDisplay = useMemo(() => {
    if (activeRate === null || isNaN(activeRate)) {
      return '—';
    }
    if (activeRate < 0.001) {
      return activeRate.toFixed(6);
    }
    return Number(activeRate.toFixed(6)).toString();
  }, [activeRate]);

  const inverseUnitRateDisplay = useMemo(() => {
    if (activeRate === null || isNaN(activeRate) || activeRate <= 0) {
      return '—';
    }
    const inv = 1 / activeRate;
    if (inv < 0.001) {
      return inv.toFixed(6);
    }
    return Number(inv.toFixed(6)).toString();
  }, [activeRate]);

  return (
    <div id="currency-hub-view" className="w-full max-w-2xl mx-auto space-y-4">
      {/* 1. UI Sync Badge & Interactive Manual Refresh Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Live Connectivity Status Indicator Badge */}
        <div className="flex items-center gap-2 font-accent">
          <div
            id="live-status-pill"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border ${
              isOffline
                ? 'bg-amber-100/90 dark:bg-amber-950/50 border-amber-300 dark:border-amber-600/30 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-600/30 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{displayStatus}</span>
          </div>
        </div>

        {/* Live Rate Summary & Interactive ↻ Refresh Rates Button */}
        <div className="flex items-center gap-2 font-accent ml-auto">
          <span
            id="top-rate-summary"
            data-testid="top-rate-summary"
            className="hidden sm:inline px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#201230]/70 text-[#5B2C3B] dark:text-[#FFE6EE] font-display font-semibold border border-pink-200/80 dark:border-pink-500/20 shadow-xs text-xs"
          >
            1 {baseCurrency.code} = {unitRateDisplay} {targetCurrency.code}
          </span>

          <button
            id="manual-refresh-rates-btn"
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#251536] hover:bg-pink-50 dark:hover:bg-[#2D1A40] text-pink-700 dark:text-pink-300 border border-pink-300/80 dark:border-pink-500/30 font-bold transition-all active:scale-95 shadow-xs disabled:opacity-60 group cursor-pointer"
            title="Click to refresh live exchange rates (↻)"
            aria-label="Refresh exchange rates"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-pink-600 dark:text-pink-400 transition-transform ${
                isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 duration-500'
              }`}
            />
            <span className="text-xs">{isRefreshing ? 'Updating...' : '↻ Refresh Rates'}</span>
          </button>
        </div>
      </div>

      {/* 2. Quick-Access Favorite Currencies (Clean Horizontal Pill Selector) */}
      <div className="p-3.5 rounded-2xl pastel-glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <span className="text-xs font-accent font-bold uppercase tracking-wider text-pink-800 dark:text-pink-300 shrink-0 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Top Presets:</span>
        </span>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          {FAVORITE_CURRENCIES.map(code => {
            const isBase = baseCurrency.code === code;
            const isTarget = targetCurrency.code === code;
            const cur = CURRENCIES.find(c => c.code === code);
            if (!cur) return null;

            return (
              <button
                key={code}
                id={`favorite-currency-${code.toLowerCase()}`}
                type="button"
                onClick={() => handleFavoriteClick(code)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-bold transition-all active:scale-90 shrink-0 shadow-xs border cursor-pointer ${
                  isTarget
                    ? 'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white border-pink-400 shadow-md shadow-pink-500/25'
                    : isBase
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-500/40'
                    : 'bg-white/80 dark:bg-[#201230]/80 text-[#5B2C3B] dark:text-[#FFE6EE] hover:bg-pink-50 border-pink-200/80 dark:border-pink-500/20'
                }`}
                title={`Select ${cur.name} (${cur.code})`}
              >
                <span>{cur.flag}</span>
                <span>{cur.code}</span>
                {isTarget && <span className="text-[10px] opacity-80">(To)</span>}
                {isBase && <span className="text-[10px] opacity-80">(From)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner if live exchange rate API fails */}
      {hookError && (
        <div
          id="currency-api-error-banner"
          className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{hookError}</span>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-3 py-1 rounded-xl bg-rose-200/80 dark:bg-rose-900/60 font-bold hover:bg-rose-300 transition-all text-xs cursor-pointer shrink-0"
          >
            Retry API
          </button>
        </div>
      )}

      {/* 3. Streamlined Minimalist Converter (Two-Card Layout with Elevated Swap Button) */}
      <div className="relative space-y-2">
        {/* Card 1: Base Currency (You Send / Convert From) */}
        <div
          id="base-currency-card"
          className="p-5 sm:p-6 rounded-3xl pastel-glass-panel border border-pink-200/90 dark:border-pink-500/25 transition-all focus-within:ring-2 focus-within:ring-pink-400/50 shadow-sm"
        >
          {/* Header: Label & Currency Picker Trigger */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-accent font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300">
              You Convert (From)
            </span>

            {/* Clickable Currency Selector Pill */}
            <button
              id="select-base-currency-btn"
              type="button"
              onClick={() => setPickerType('base')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-[#201230] hover:bg-pink-50 dark:hover:bg-[#2b1842] border border-pink-200/90 dark:border-pink-500/30 text-[#4A1E2D] dark:text-[#FFF0F5] transition-all shadow-xs active:scale-95 group cursor-pointer"
            >
              <span className="text-xl select-none">{baseCurrency.flag}</span>
              <span className="font-accent font-extrabold text-sm tracking-wide">{baseCurrency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-pink-500 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Large High-Readability Numeric Input Field */}
          <div className="relative flex items-center">
            <span className="text-2xl sm:text-3xl font-display font-bold text-pink-400 dark:text-pink-500/70 mr-2 select-none">
              {baseCurrency.symbol}
            </span>
            <input
              id="base-currency-amount-input"
              type="number"
              min="0"
              step="any"
              value={baseAmountStr}
              onFocus={() => setActiveFocus('base')}
              onBlur={() => setActiveFocus(null)}
              onChange={e => handleBaseChange(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent font-display text-3xl sm:text-4xl font-extrabold text-[#4A1E2D] dark:text-[#FFF0F5] focus:outline-none placeholder-pink-300 dark:placeholder-pink-800 tracking-tight"
            />
            {baseAmountStr && (
              <button
                type="button"
                onClick={() => handleBaseChange('')}
                className="p-1 rounded-full text-pink-400 hover:text-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-xs cursor-pointer"
                title="Clear input"
                aria-label="Clear base amount"
              >
                ✕
              </button>
            )}
          </div>

          {/* Currency Full Name & Quick Amount Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-pink-100 dark:border-pink-500/15 text-xs text-pink-700/70 dark:text-pink-300/70 font-accent">
            <span>{baseCurrency.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] mr-1 hidden sm:inline">Quick:</span>
              {QUICK_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleBaseChange(String(amt))}
                  className="px-2 py-0.5 rounded-full bg-pink-50/80 dark:bg-pink-950/40 hover:bg-pink-200/80 text-pink-800 dark:text-pink-200 font-display font-semibold text-[11px] border border-pink-200/60 dark:border-pink-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  {baseCurrency.symbol}{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clean, Elevated Swap Button (⇅) Positioned Between the Cards */}
        <div className="relative flex justify-center -my-3 z-20">
          <motion.button
            id="currency-swap-direction-btn"
            type="button"
            onClick={handleSwap}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            animate={isSwapping ? { rotate: 180 } : { rotate: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="w-11 h-11 rounded-full bg-white dark:bg-[#1E112B] text-pink-600 dark:text-pink-300 border-2 border-pink-300 dark:border-pink-500/50 shadow-lg shadow-pink-500/20 flex items-center justify-center hover:bg-pink-50 dark:hover:bg-[#29173B] transition-colors cursor-pointer"
            title="Swap base and target currencies (⇅)"
            aria-label="Swap currencies"
          >
            <ArrowUpDown className="w-5 h-5 stroke-[2.4]" />
          </motion.button>
        </div>

        {/* Card 2: Target Currency (You Receive / Convert To) */}
        <div
          id="target-currency-card"
          className="p-5 sm:p-6 rounded-3xl pastel-glass-panel border border-pink-200/90 dark:border-pink-500/25 transition-all focus-within:ring-2 focus-within:ring-pink-400/50 shadow-sm"
        >
          {/* Header: Label & Currency Picker Trigger */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-accent font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300">
              Converted Result (To)
            </span>

            {/* Clickable Currency Selector Pill */}
            <button
              id="select-target-currency-btn"
              type="button"
              onClick={() => setPickerType('target')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-[#201230] hover:bg-pink-50 dark:hover:bg-[#2b1842] border border-pink-200/90 dark:border-pink-500/30 text-[#4A1E2D] dark:text-[#FFF0F5] transition-all shadow-xs active:scale-95 group cursor-pointer"
            >
              <span className="text-xl select-none">{targetCurrency.flag}</span>
              <span className="font-accent font-extrabold text-sm tracking-wide">{targetCurrency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-pink-500 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Large High-Readability Numeric Field (Bidirectional Input) */}
          <div className="relative flex items-center">
            <span className="text-2xl sm:text-3xl font-display font-bold text-pink-500 dark:text-pink-400 mr-2 select-none">
              {targetCurrency.symbol}
            </span>
            <input
              id="target-currency-amount-input"
              type="text"
              value={targetAmountStr}
              onFocus={() => setActiveFocus('target')}
              onBlur={() => setActiveFocus(null)}
              onChange={e => handleTargetChange(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent font-display text-3xl sm:text-4xl font-extrabold text-[#4A1E2D] dark:text-[#FFF0F5] focus:outline-none placeholder-pink-300 dark:placeholder-pink-800 tracking-tight"
            />
          </div>

          {/* Exchange Rate Formula & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-pink-100 dark:border-pink-500/15">
            {/* Real-time Exchange Formula dynamically derived in real-time */}
            <div
              id="footer-rate-indicator"
              data-testid="footer-rate-indicator"
              className="text-xs font-display text-pink-700/80 dark:text-pink-300/80 font-medium"
            >
              <span>1 {baseCurrency.code} = {unitRateDisplay} {targetCurrency.code}</span>
              <span className="mx-1 text-pink-300">·</span>
              <span className="text-[11px] opacity-75">1 {targetCurrency.code} = {inverseUnitRateDisplay} {baseCurrency.code}</span>
            </div>

            {/* Action Buttons: Copy & Send to Calculator */}
            <div className="flex items-center gap-2">
              {/* Copy Value */}
              <button
                id="copy-conversion-btn"
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#201230] hover:bg-pink-50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/20 text-xs font-accent font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                title="Copy conversion amount to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Send to Standard Calculator */}
              {onSendToCalculator && (
                <button
                  id="send-to-calc-btn"
                  type="button"
                  onClick={() => {
                    const clean = parseFloat(targetAmountStr.replace(/,/g, ''));
                    if (!isNaN(clean)) {
                      onSendToCalculator(clean);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF1493] hover:from-pink-500 hover:to-rose-500 text-white text-xs font-accent font-bold transition-all active:scale-95 shadow-md shadow-pink-500/25 cursor-pointer"
                  title="Transfer converted result directly into Calculator keypad"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Open in Calc</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Global Currency Search Modal (Full-Screen / Slide-over sheet) */}
      <CurrencySearchModal
        isOpen={pickerType !== null}
        onClose={() => setPickerType(null)}
        selectedCode={pickerType === 'base' ? baseCurrency.code : targetCurrency.code}
        onSelect={cur => {
          if (pickerType === 'base') {
            handleSelectBase(cur);
          } else {
            handleSelectTarget(cur);
          }
          setPickerType(null);
        }}
        title={pickerType === 'base' ? 'Select Base Currency (From)' : 'Select Target Currency (To)'}
        rates={activeRates}
      />
    </div>
  );
};

export const CurrencyHub = CurrencyHubView;
