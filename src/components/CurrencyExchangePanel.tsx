import React, { useState, useEffect } from 'react';
import { Currency, ExchangeRatesData } from '../types';
import { ArrowLeftRight, RefreshCw, Wifi, WifiOff, X, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { CurrencySearchModal } from './CurrencySearchModal';
import { convertCurrency, formatCurrencyValue, getRelativeTimeString } from '../data/currencies';

interface CurrencyExchangePanelProps {
  baseCurrency: Currency;
  targetCurrency: Currency;
  baseAmount: number;
  ratesData: ExchangeRatesData;
  onSelectBase: (c: Currency) => void;
  onSelectTarget: (c: Currency) => void;
  onSwapCurrencies: () => void;
  onRefreshRates: () => Promise<void>;
  onAmountChange?: (newAmount: number) => void;
  isRefreshing?: boolean;
}

export const CurrencyExchangePanel: React.FC<CurrencyExchangePanelProps> = ({
  baseCurrency,
  targetCurrency,
  baseAmount,
  ratesData,
  onSelectBase,
  onSelectTarget,
  onSwapCurrencies,
  onRefreshRates,
  onAmountChange,
  isRefreshing = false,
}) => {
  const [modalType, setModalType] = useState<'base' | 'target' | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  // Local string states for smooth typing without cursor jumps or premature parsing
  const [baseInputStr, setBaseInputStr] = useState<string>(() => String(baseAmount || 0));
  const [targetInputStr, setTargetInputStr] = useState<string>(() => {
    const converted = convertCurrency(baseAmount || 0, baseCurrency.code, targetCurrency.code, ratesData.rates);
    return converted === 0 ? '0' : converted.toFixed(2);
  });

  // Track which input is being actively focused to prevent echo loops
  const [activeFocus, setActiveFocus] = useState<'base' | 'target' | null>(null);

  // Synchronize when external baseAmount changes (e.g. from calculator or presets)
  useEffect(() => {
    if (activeFocus !== 'base' && activeFocus !== 'target') {
      setBaseInputStr(String(baseAmount));
      const converted = convertCurrency(baseAmount, baseCurrency.code, targetCurrency.code, ratesData.rates);
      setTargetInputStr(converted === 0 ? '0' : converted.toFixed(2));
    }
  }, [baseAmount, baseCurrency.code, targetCurrency.code, ratesData.rates, activeFocus]);

  // Unit rate
  const unitRate = convertCurrency(1, baseCurrency.code, targetCurrency.code, ratesData.rates);

  // Handle Base Input Change (Manual typing)
  const handleBaseChange = (val: string) => {
    setBaseInputStr(val);
    const num = parseFloat(val);
    const validNum = isNaN(num) ? 0 : num;

    if (onAmountChange) {
      onAmountChange(validNum);
    }

    const converted = convertCurrency(validNum, baseCurrency.code, targetCurrency.code, ratesData.rates);
    setTargetInputStr(val === '' ? '' : converted === 0 ? '0' : converted.toFixed(2));
  };

  // Handle Target Input Change (Bidirectional typing)
  const handleTargetChange = (val: string) => {
    setTargetInputStr(val);
    const num = parseFloat(val);
    const validNum = isNaN(num) ? 0 : num;

    const backConverted = convertCurrency(validNum, targetCurrency.code, baseCurrency.code, ratesData.rates);
    setBaseInputStr(val === '' ? '' : backConverted === 0 ? '0' : backConverted.toFixed(2));

    if (onAmountChange) {
      onAmountChange(backConverted);
    }
  };

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);
    onSwapCurrencies();
  };

  const statusDisplay = ratesData.statusText || (ratesData.isOffline
    ? `Offline · Cached (${getRelativeTimeString(ratesData.lastUpdated)})`
    : `Rates Live · Updated ${getRelativeTimeString(ratesData.lastUpdated)}`);

  return (
    <div
      id="currency-exchange-panel"
      className="relative rounded-3xl pastel-glass-panel p-5 sm:p-6 transition-all duration-300 overflow-hidden"
    >
      {/* Decorative cute sparkle overlay */}
      <div className="absolute top-2 right-6 text-pink-400/20 dark:text-pink-400/10 pointer-events-none select-none">
        <Sparkles className="w-16 h-16" />
      </div>

      {/* Top Meta Status Row: Rates Sync indicator & exchange rate */}
      <div className="flex flex-wrap items-center justify-between text-xs mb-4 gap-2 text-[#8C5B6B] dark:text-[#D1A7B8] z-10 relative">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-accent font-bold transition-all shadow-xs ${
              ratesData.isOffline
                ? 'bg-amber-100 dark:bg-amber-950/40 border border-amber-300/80 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-100/90 dark:bg-emerald-950/40 border border-emerald-300/80 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                ratesData.isOffline ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            {ratesData.isOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{ratesData.isOffline ? 'Offline Rates' : 'Live FX Sync'}</span>
          </div>

          <span className="text-xs font-accent font-medium">
            {statusDisplay}
          </span>
        </div>

        {/* Live Ratio & Refresh Button */}
        <div className="flex items-center gap-2 font-accent">
          <span className="px-2.5 py-1 rounded-full bg-pink-100/80 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-500/20 shadow-xs">
            1 {baseCurrency.code} = {unitRate < 0.01 ? unitRate.toFixed(4) : unitRate.toFixed(3)} {targetCurrency.code}
          </span>
          <button
            id="refresh-rates-btn"
            onClick={onRefreshRates}
            disabled={isRefreshing}
            title="Refresh exchange rates"
            className="p-1.5 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white text-pink-600 dark:text-pink-300 border border-pink-200/80 dark:border-pink-400/20 active:scale-90 transition-all disabled:opacity-50 shadow-xs"
            aria-label="Refresh currency exchange rates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-pink-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dual Floating Currency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3.5 z-10 relative">
        {/* Left Floating Card: Base Currency */}
        <div className="relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-[#201230]/80 border border-pink-200/80 dark:border-pink-400/20 hover:border-pink-400 focus-within:border-pink-500 transition-all shadow-sm group">
          {/* Rounded Pill Currency Selector Trigger with Country Badge */}
          <button
            id="base-currency-picker-trigger"
            type="button"
            onClick={() => setModalType('base')}
            className="flex items-center gap-2.5 px-3 py-1.5 -ml-1 rounded-full bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 border border-pink-200 dark:border-pink-500/30 active:scale-95 transition-all text-left shadow-xs"
            title="Change base currency"
          >
            <span className="text-xl select-none">{baseCurrency.flag}</span>
            <div>
              <div className="flex items-center gap-1 font-accent font-bold text-sm sm:text-base text-[#4A1E2D] dark:text-[#FFF0F5]">
                <span>{baseCurrency.code}</span>
                <span className="text-pink-500 text-xs">({baseCurrency.symbol})</span>
              </div>
            </div>
          </button>

          {/* Manual Numeric Entry */}
          <div className="text-right flex-1 max-w-[160px] sm:max-w-[200px] ml-2">
            <div className="relative flex items-center justify-end">
              <input
                id="base-currency-amount-input"
                type="number"
                step="any"
                min="0"
                value={baseInputStr}
                onFocus={() => setActiveFocus('base')}
                onBlur={() => setActiveFocus(null)}
                onChange={e => handleBaseChange(e.target.value)}
                placeholder="0"
                className="w-full text-right bg-transparent font-display text-2xl sm:text-3xl font-extrabold text-[#4A1E2D] dark:text-[#FFF0F5] focus:outline-none focus:text-pink-600 dark:focus:text-pink-400 transition-colors"
                title="Base currency amount"
                aria-label="Base currency amount"
              />
              {baseInputStr && baseInputStr !== '0' && (
                <button
                  type="button"
                  onClick={() => handleBaseChange('0')}
                  className="ml-1 p-1 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-500 hover:text-pink-700 transition-colors"
                  title="Clear input"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-xs text-pink-700/70 dark:text-pink-300/70 font-display font-semibold mt-0.5">
              {baseCurrency.symbol} {formatCurrencyValue(parseFloat(baseInputStr) || 0, baseCurrency.code)}
            </div>
          </div>
        </div>

        {/* Center: Quick Swap Button with Cute Bouncing Aura */}
        <div className="flex justify-center -my-1 md:my-0">
          <motion.button
            id="swap-currencies-btn"
            type="button"
            onClick={handleSwap}
            animate={{ rotate: isSwapping ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            className="p-3.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-400/30 border-2 border-white/60 dark:border-pink-300/40 transition-all flex items-center justify-center"
            title="Swap base and target currencies"
            aria-label="Swap currencies"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Right Floating Card: Target Currency */}
        <div className="relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 dark:from-[#182633]/80 dark:to-[#12222B]/80 border border-emerald-300/80 dark:border-emerald-500/35 hover:border-emerald-400 transition-all shadow-sm group">
          {/* Rounded Pill Currency Selector Trigger with Country Badge */}
          <button
            id="target-currency-picker-trigger"
            type="button"
            onClick={() => setModalType('target')}
            className="flex items-center gap-2.5 px-3 py-1.5 -ml-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 hover:bg-emerald-200/70 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 active:scale-95 transition-all text-left shadow-xs"
            title="Change target currency"
          >
            <span className="text-xl select-none">{targetCurrency.flag}</span>
            <div>
              <div className="flex items-center gap-1 font-accent font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
                <span>{targetCurrency.code}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs">({targetCurrency.symbol})</span>
              </div>
            </div>
          </button>

          {/* Manual Numeric Entry (Bidirectional Editable!) */}
          <div className="text-right flex-1 max-w-[160px] sm:max-w-[200px] ml-2">
            <div className="relative flex items-center justify-end">
              <span className="text-emerald-700 dark:text-emerald-400 font-display text-xl font-bold mr-1">
                {targetCurrency.symbol}
              </span>
              <input
                id="target-currency-amount-input"
                type="number"
                step="any"
                min="0"
                value={targetInputStr}
                onFocus={() => setActiveFocus('target')}
                onBlur={() => setActiveFocus(null)}
                onChange={e => handleTargetChange(e.target.value)}
                placeholder="0.00"
                className="w-full text-right bg-transparent font-display text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-200 focus:outline-none transition-colors"
                title="Target currency amount (editable for reverse conversion)"
                aria-label="Target currency amount"
              />
              {targetInputStr && targetInputStr !== '0' && (
                <button
                  type="button"
                  onClick={() => handleTargetChange('0')}
                  className="ml-1 p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 hover:text-emerald-800 transition-colors"
                  title="Clear input"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-display font-semibold mt-0.5">
              = {targetCurrency.code} @ {unitRate < 0.01 ? unitRate.toFixed(4) : unitRate.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Search Modal */}
      <CurrencySearchModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        selectedCode={modalType === 'base' ? baseCurrency.code : targetCurrency.code}
        onSelect={c => {
          if (modalType === 'base') onSelectBase(c);
          else if (modalType === 'target') onSelectTarget(c);
        }}
        title={modalType === 'base' ? 'Select Base Currency ✨' : 'Select Target Currency 💖'}
        rates={ratesData.rates}
      />
    </div>
  );
};
