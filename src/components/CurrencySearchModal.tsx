import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Currency } from '../types';
import { CURRENCIES } from '../data/currencies';
import { Search, X, Check, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CurrencySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCode: string;
  onSelect: (currency: Currency) => void;
  title?: string;
  rates?: Record<string, number>;
}

// Popular / Favorite currencies for 1-tap quick access
const POPULAR_CURRENCY_CODES = [
  { code: 'USD', symbol: '$', label: 'USD $' },
  { code: 'EUR', symbol: '€', label: 'EUR €' },
  { code: 'GBP', symbol: '£', label: 'GBP £' },
  { code: 'INR', symbol: '₹', label: 'INR ₹' },
  { code: 'JPY', symbol: '¥', label: 'JPY ¥' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD CA$' },
  { code: 'AUD', symbol: 'A$', label: 'AUD A$' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF' },
  { code: 'SGD', symbol: 'S$', label: 'SGD S$' },
  { code: 'AED', symbol: 'AED', label: 'AED' },
];

export const CurrencySearchModal: React.FC<CurrencySearchModalProps> = ({
  isOpen,
  onClose,
  selectedCode,
  onSelect,
  title = 'Select Currency',
  rates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter currencies matching name, symbol, or ISO code
  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CURRENCIES;

    return CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectCurrency = (currency: Currency) => {
    onSelect(currency);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop Blur Overlay with Smooth Fade Transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal / Slide-Over Card Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="currency-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[86vh] flex flex-col rounded-t-[28px] sm:rounded-3xl bg-white/95 dark:bg-[#1C102A]/95 backdrop-blur-2xl border border-pink-200/90 dark:border-pink-500/30 shadow-2xl shadow-pink-950/20 overflow-hidden z-10"
          >
            {/* Header with Title & Close Button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 dark:border-pink-500/20 bg-gradient-to-r from-pink-50/80 to-rose-50/50 dark:from-[#251538]/80 dark:to-[#1E112E]/80 shrink-0">
              <div>
                <h3
                  id="currency-modal-title"
                  className="text-base font-accent font-extrabold text-[#4A1E2D] dark:text-[#FFF0F5] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>{title}</span>
                </h3>
                <p className="text-xs font-accent text-pink-700/70 dark:text-pink-300/70 mt-0.5">
                  Select a currency for real-time conversion and calculations
                </p>
              </div>

              <button
                id="close-currency-search-modal-btn"
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-pink-400 hover:text-pink-700 hover:bg-pink-100/80 dark:hover:bg-pink-900/40 transition-colors cursor-pointer"
                aria-label="Close currency picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick-Search Input Bar with Auto-Focus */}
            <div className="p-4 border-b border-pink-100 dark:border-pink-500/15 bg-white/50 dark:bg-[#1E112D]/50 shrink-0">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-pink-500/70 dark:text-pink-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  id="currency-search-modal-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search currency by name, symbol, or ISO code..."
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-pink-50/60 dark:bg-[#28173E] border border-pink-200/90 dark:border-pink-500/30 text-sm font-accent text-[#4A1E2D] dark:text-[#FFF0F5] placeholder-pink-400/80 dark:placeholder-pink-400/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 p-1 rounded-full text-pink-400 hover:text-pink-700 dark:hover:text-pink-200 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Scroll Container of Popular / Favorite Currency Pills */}
            <div className="px-4 py-3 border-b border-pink-100 dark:border-pink-500/15 bg-pink-50/40 dark:bg-[#221335]/40 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-[11px] font-accent font-bold uppercase tracking-wider text-pink-800 dark:text-pink-300">
                  Popular Currencies:
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {POPULAR_CURRENCY_CODES.map(pop => {
                  const isSelected = pop.code === selectedCode;
                  const curObj = CURRENCIES.find(c => c.code === pop.code);
                  if (!curObj) return null;

                  return (
                    <button
                      key={pop.code}
                      id={`popular-currency-pill-${pop.code.toLowerCase()}`}
                      type="button"
                      onClick={() => handleSelectCurrency(curObj)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all shrink-0 cursor-pointer border shadow-xs active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white border-pink-400 shadow-md shadow-pink-500/25 ring-2 ring-pink-300 dark:ring-pink-600'
                          : 'bg-white dark:bg-[#2A1840] hover:bg-pink-100/80 dark:hover:bg-[#341F50] text-[#5B2C3B] dark:text-[#FFE6EE] border-pink-200 dark:border-pink-500/25'
                      }`}
                    >
                      <span className="text-base select-none">{curObj.flag}</span>
                      <span>{pop.code}</span>
                      <span className="text-pink-500 dark:text-pink-300 opacity-80">{pop.symbol}</span>
                      {isSelected && <Check className="w-3 h-3 text-white ml-0.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Structured Currency List Rows */}
            <div
              id="currency-search-modal-list"
              className="flex-1 overflow-y-auto p-3 space-y-1.5 overscroll-contain divide-y-0"
            >
              {filteredCurrencies.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-sm font-accent font-semibold text-pink-600 dark:text-pink-300">
                    No currencies matching "{searchQuery}"
                  </p>
                  <p className="text-xs text-pink-400/80 dark:text-pink-400/60 mt-1">
                    Try searching with standard ISO code (e.g. EUR, CAD) or country name.
                  </p>
                </div>
              ) : (
                filteredCurrencies.map(currency => {
                  const isSelected = currency.code === selectedCode;
                  const liveRate = rates ? rates[currency.code] : undefined;

                  return (
                    <button
                      key={currency.code}
                      id={`currency-item-row-${currency.code.toLowerCase()}`}
                      type="button"
                      onClick={() => handleSelectCurrency(currency)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all cursor-pointer group active:scale-[0.99] border ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-950/70 dark:to-purple-950/70 border-pink-400 dark:border-pink-500/60 text-[#4A1E2D] dark:text-[#FFF0F5] shadow-xs'
                          : 'bg-white/60 dark:bg-[#231437]/50 hover:bg-pink-50 dark:hover:bg-[#2C1945] border-pink-100/80 dark:border-pink-500/15 text-[#5B2C3B] dark:text-[#FFE6EE]'
                      }`}
                    >
                      {/* Left: High-resolution country flag icon & Currency Identifiers */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* High-resolution Flag Badge */}
                        <div className="w-11 h-11 rounded-2xl bg-pink-100/60 dark:bg-pink-900/30 border border-pink-200/80 dark:border-pink-500/20 flex items-center justify-center text-2xl select-none shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          {currency.flag}
                        </div>

                        {/* Codes, Symbols & Full Name */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {/* Three-letter ISO code */}
                            <span className="font-accent font-extrabold text-base tracking-wide text-[#4A1E2D] dark:text-[#FFF0F5]">
                              {currency.code}
                            </span>
                            {/* Currency Symbol Pill */}
                            <span className="px-2 py-0.5 rounded-md bg-pink-100/80 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 font-display font-bold text-xs border border-pink-200/60 dark:border-pink-500/20">
                              {currency.symbol}
                            </span>
                          </div>
                          {/* Currency Full Name */}
                          <div className="text-xs text-pink-700/80 dark:text-pink-300/80 font-accent truncate mt-0.5">
                            {currency.name}
                          </div>
                        </div>
                      </div>

                      {/* Right: Exchange rate context & Selection Checkmark */}
                      <div className="flex items-center gap-3 shrink-0 ml-3 text-right">
                        {liveRate !== undefined && liveRate !== null && (
                          <div className="hidden sm:block text-xs font-display text-pink-700/70 dark:text-pink-300/70">
                            <span className="text-[10px] uppercase text-pink-400 block">vs 1 USD</span>
                            <span className="font-bold">
                              {liveRate > 100 ? liveRate.toFixed(1) : liveRate.toFixed(3)}
                            </span>
                          </div>
                        )}

                        {/* Selection status badge */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white shadow-sm shadow-pink-500/30 scale-100'
                              : 'border border-pink-200 dark:border-pink-500/30 text-transparent group-hover:border-pink-400'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
