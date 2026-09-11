import React from 'react';
import { HistoryItem } from '../types';
import { X, Trash2, ArrowUpRight, Copy, Check, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrencyValue } from '../data/currencies';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatTimestamp = (ts: number) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <motion.aside
            id="currencypulse-history-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white/95 dark:bg-[#1E112B]/95 backdrop-blur-2xl border-l border-pink-200 dark:border-pink-500/20 shadow-2xl flex flex-col z-10 transition-colors"
            role="dialog"
            aria-label="Calculation History"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pink-200/60 dark:border-pink-500/20 bg-pink-50/50 dark:bg-[#251536]/80 backdrop-blur-md">
              <div className="flex items-center gap-2 font-accent">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 flex items-center justify-center border border-pink-200 dark:border-pink-500/30">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#4A1E2D] dark:text-[#FFF0F5] text-base">Calculation History</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-200/70 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 font-display font-bold">
                  {history.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {history.length > 0 && (
                  <button
                    id="clear-history-btn"
                    onClick={onClearHistory}
                    className="p-2 rounded-full text-pink-400 hover:text-rose-600 hover:bg-pink-100 dark:hover:bg-rose-950/40 transition-colors"
                    title="Clear history"
                    aria-label="Clear all calculation history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="close-history-drawer-btn"
                  onClick={onClose}
                  className="p-2 rounded-full text-pink-400 hover:text-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
                  aria-label="Close history drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-pink-400 font-accent">
                  <div className="w-14 h-14 rounded-3xl bg-pink-100 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-500/30 flex items-center justify-center text-pink-500 mb-3 shadow-xs">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-[#4A1E2D] dark:text-[#FFF0F5]">No calculations recorded yet</p>
                  <p className="text-xs text-pink-600/70 dark:text-pink-300/70 mt-1 max-w-[240px]">
                    Perform calculations or convert currencies to see cute snapshots stored here 🌸
                  </p>
                </div>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    id={`history-entry-${item.id}`}
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="group relative p-4 rounded-2xl bg-white/80 dark:bg-[#251536]/80 hover:bg-pink-50/90 dark:hover:bg-[#2d1842] border border-pink-200/80 dark:border-pink-500/20 hover:border-pink-400 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-pink-600/70 dark:text-pink-300/70 mb-1 font-accent">
                      <span className="font-display">{formatTimestamp(item.timestamp)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={e => handleCopy(e, item)}
                          className="p-1 rounded-full text-pink-400 hover:text-pink-700 hover:bg-pink-100"
                          title="Copy expression"
                          aria-label="Copy history item"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-xs text-pink-600 dark:text-pink-300 flex items-center gap-0.5 font-bold">
                          Recall <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Math Expression */}
                    <div className="font-display text-xs text-pink-700/70 dark:text-pink-300/70 break-all mb-0.5">
                      {item.expression} =
                    </div>

                    {/* Math Result */}
                    <div className="font-display text-lg font-black text-[#4A1E2D] dark:text-[#FFF0F5] mb-2">
                      {item.result}
                    </div>

                    {/* Currency Conversion Snapshot */}
                    {item.targetCurrency && item.targetAmount !== undefined && (
                      <div className="flex items-center justify-between pt-2 border-t border-pink-200/60 dark:border-pink-500/20 text-xs font-accent">
                        <span className="text-pink-500 text-[11px] font-bold">FX Snapshot</span>
                        <div className="flex items-center gap-1.5 font-display text-emerald-700 dark:text-emerald-400 font-bold">
                          <span>
                            {item.baseAmount} {item.baseCurrency}
                          </span>
                          <span className="text-pink-400">→</span>
                          <span className="bg-emerald-100/80 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                            {formatCurrencyValue(item.targetAmount, item.targetCurrency)} {item.targetCurrency}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Tip */}
            <div className="p-3 bg-pink-50/60 dark:bg-[#180E24] border-t border-pink-200/60 dark:border-pink-500/20 text-center text-xs font-accent text-pink-600/70 dark:text-pink-300/70">
              Click any calculation to recall value into the active keypad ✨
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
