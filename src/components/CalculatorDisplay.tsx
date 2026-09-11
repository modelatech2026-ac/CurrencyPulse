import React, { useState } from 'react';
import { AngleMode, CalculatorMode } from '../types';
import { Copy, Check, Sparkles, Heart } from 'lucide-react';

interface CalculatorDisplayProps {
  expression: string;
  displayValue: string;
  activeOperator: string | null;
  angleMode: AngleMode;
  mode: CalculatorMode;
  hasMemory: boolean;
  error: string | null;
  onToggleAngleMode?: () => void;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  displayValue,
  activeOperator,
  angleMode,
  mode,
  hasMemory,
  error,
  onToggleAngleMode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(error ? expression : displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Adaptive font size based on length of displayValue
  const getFontSize = () => {
    const len = (error || displayValue).length;
    if (len > 18) return 'text-2xl sm:text-3xl';
    if (len > 14) return 'text-3xl sm:text-4xl';
    if (len > 10) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  return (
    <div
      id="calculator-display-container"
      className="relative flex flex-col justify-end p-5 sm:p-6 rounded-3xl pastel-glass-panel overflow-hidden transition-all duration-300"
    >
      {/* Decorative cute floating watermark/sparkles */}
      <div className="absolute -top-4 -right-4 w-28 h-28 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Indicators Row */}
      <div className="flex items-center justify-between text-xs mb-2 z-10">
        <div className="flex items-center gap-2">
          {mode === 'scientific' && (
            <button
              id="toggle-angle-mode-btn"
              onClick={onToggleAngleMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950/40 border border-pink-300/70 dark:border-pink-500/30 text-pink-700 dark:text-pink-300 font-accent text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xs"
              title="Toggle Degree / Radian"
            >
              <span>{angleMode.toUpperCase()}</span>
              <Sparkles className="w-2.5 h-2.5 text-pink-500" />
            </button>
          )}

          {hasMemory && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 border border-purple-300/70 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 font-accent text-[11px] font-bold shadow-xs">
              <Heart className="w-2.5 h-2.5 text-purple-500 fill-purple-500/30" />
              <span>MEM</span>
            </span>
          )}

          {activeOperator && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 border border-rose-300/80 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-accent text-xs font-extrabold animate-pulse shadow-xs">
              <span>OP:</span>
              <span className="font-display font-black text-sm">{activeOperator}</span>
            </span>
          )}
        </div>

        {/* Copy to Clipboard with cute feedback */}
        <button
          id="copy-display-value-btn"
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-pink-200/80 dark:border-pink-400/20 text-pink-800 dark:text-pink-200 font-accent font-semibold transition-all hover:scale-105 active:scale-95 shadow-xs"
          title="Copy calculation value"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Copied! ✨</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-pink-500 dark:text-pink-300" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* History / Expression Row */}
      <div className="min-h-[26px] text-right font-display text-sm sm:text-base text-pink-700/60 dark:text-pink-300/70 overflow-x-auto whitespace-nowrap scrollbar-none tracking-tight font-medium">
        {expression || <span className="opacity-0">0</span>}
      </div>

      {/* Primary Calculation Display (Outfit / Comfortaa with pop-in micro-animation) */}
      <div className="text-right overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        <div
          key={error || displayValue}
          className={`font-display font-bold tracking-tight text-[#4A1E2D] dark:text-[#FFF0F5] transition-all duration-150 animate-pop-digit ${getFontSize()} ${
            error ? 'text-rose-600 dark:text-rose-400 text-3xl sm:text-4xl' : ''
          }`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {error || displayValue}
        </div>
      </div>
    </div>
  );
};
