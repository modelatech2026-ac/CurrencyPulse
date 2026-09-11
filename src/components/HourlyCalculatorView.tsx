import React, { useState, useMemo } from 'react';
import { Currency, ExchangeRatesData } from '../types';
import { convertCurrency, formatCurrencyValue } from '../data/currencies';
import { CurrencySearchModal } from './CurrencySearchModal';
import {
  Clock,
  DollarSign,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calculator,
  Percent,
  Heart,
} from 'lucide-react';

interface HourlyCalculatorViewProps {
  baseCurrency: Currency;
  targetCurrency: Currency;
  ratesData: ExchangeRatesData;
  onSelectBase: (c: Currency) => void;
  onSelectTarget: (c: Currency) => void;
  onSendToCalculator?: (amount: number) => void;
}

export const HourlyCalculatorView: React.FC<HourlyCalculatorViewProps> = ({
  baseCurrency,
  targetCurrency,
  ratesData,
  onSelectBase,
  onSelectTarget,
  onSendToCalculator,
}) => {
  // Input states - default 500 hours and $6/hr
  const [hoursWorked, setHoursWorked] = useState<number>(500);
  const [hourlyRate, setHourlyRate] = useState<number>(6);
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [pickerType, setPickerType] = useState<'base' | 'target' | null>(null);

  // Core Formula: Total Result = Hours worked * Hourly Rate
  const totalBaseEarnings = useMemo(() => {
    const hours = Math.max(0, hoursWorked || 0);
    const rate = Math.max(0, hourlyRate || 0);
    return hours * rate;
  }, [hoursWorked, hourlyRate]);

  // Converted Payout in Target Currency
  const totalConvertedEarnings = useMemo(() => {
    return convertCurrency(
      totalBaseEarnings,
      baseCurrency.code,
      targetCurrency.code,
      ratesData.rates
    );
  }, [totalBaseEarnings, baseCurrency.code, targetCurrency.code, ratesData.rates]);

  // Fee calculation
  const feeAmount = useMemo(() => {
    return totalBaseEarnings * (platformFeePercent / 100);
  }, [totalBaseEarnings, platformFeePercent]);

  const netBaseEarnings = useMemo(() => {
    return Math.max(0, totalBaseEarnings - feeAmount);
  }, [totalBaseEarnings, feeAmount]);

  const netConvertedEarnings = useMemo(() => {
    return convertCurrency(
      netBaseEarnings,
      baseCurrency.code,
      targetCurrency.code,
      ratesData.rates
    );
  }, [netBaseEarnings, baseCurrency.code, targetCurrency.code, ratesData.rates]);

  const unitRate = useMemo(() => {
    return convertCurrency(1, baseCurrency.code, targetCurrency.code, ratesData.rates);
  }, [baseCurrency.code, targetCurrency.code, ratesData.rates]);

  // Presets
  const hourPresets = [
    { label: '20h', value: 20, desc: 'Part-time' },
    { label: '40h', value: 40, desc: '1 Week' },
    { label: '80h', value: 80, desc: '2 Weeks' },
    { label: '160h', value: 160, desc: '1 Month' },
    { label: '500h', value: 500, desc: 'Milestone' },
  ];

  const ratePresets = [15, 30, 50, 75, 100, 150];

  const handleSwapCurrencies = () => {
    const temp = baseCurrency;
    onSelectBase(targetCurrency);
    onSelectTarget(temp);
  };

  const handleCopySummary = () => {
    const summary = `Project Rate Invoice Breakdown:
• Hours Worked: ${hoursWorked} hrs
• Hourly Rate: ${baseCurrency.symbol}${hourlyRate} ${baseCurrency.code}/hr
• Gross Total: ${baseCurrency.symbol}${formatCurrencyValue(totalBaseEarnings, baseCurrency.code)} ${baseCurrency.code}
• Target Currency Payout: ${targetCurrency.symbol}${formatCurrencyValue(totalConvertedEarnings, targetCurrency.code)} ${targetCurrency.code}
• FX Exchange Rate: 1 ${baseCurrency.code} = ${unitRate.toFixed(4)} ${targetCurrency.code}
${platformFeePercent > 0 ? `• Deductions (${platformFeePercent}%): -${baseCurrency.symbol}${formatCurrencyValue(feeAmount, baseCurrency.code)}\n• Net Payout: ${baseCurrency.symbol}${formatCurrencyValue(netBaseEarnings, baseCurrency.code)} ${baseCurrency.code} (≈ ${targetCurrency.symbol}${formatCurrencyValue(netConvertedEarnings, targetCurrency.code)} ${targetCurrency.code})` : ''}
Generated via CurrencyPulse ✨`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setHoursWorked(0);
    setHourlyRate(0);
    setPlatformFeePercent(0);
  };

  return (
    <div id="hourly-project-calculator-panel" className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl pastel-glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-pink-200/60 dark:border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-400/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-accent font-bold text-[#4A1E2D] dark:text-[#FFF0F5] flex items-center gap-2">
                <span>Hourly & Freelance Project Rate</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-accent font-extrabold border border-pink-200 dark:border-pink-500/30">
                  ✨ RATE ENGINE
                </span>
              </h2>
              <p className="text-xs font-accent text-pink-700/70 dark:text-pink-300/70">
                Formula: <span className="font-display font-bold text-pink-600 dark:text-pink-400">Total = Hours × Hourly Rate</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-accent">
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-full border border-pink-200/80 dark:border-pink-400/20 text-xs font-bold text-pink-700 dark:text-pink-300 hover:bg-pink-100/50 transition-all flex items-center gap-1.5 shadow-xs"
              title="Reset values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleCopySummary}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF1493] hover:from-pink-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5 active:scale-95"
              title="Copy invoice breakdown"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied! ✨' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        {/* Currency Pair Config */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-accent">
          <div className="flex items-center gap-2">
            <span className="text-pink-800/80 dark:text-pink-200/80 font-semibold">Charging Base:</span>
            <button
              onClick={() => setPickerType('base')}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#251536] border border-pink-200 dark:border-pink-500/30 hover:border-pink-400 text-[#4A1E2D] dark:text-[#FFF0F5] font-bold shadow-xs"
            >
              <span>{baseCurrency.flag}</span>
              <span>{baseCurrency.code}</span>
              <span className="text-pink-400 font-normal">({baseCurrency.symbol})</span>
            </button>

            <button
              onClick={handleSwapCurrencies}
              className="p-1.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 hover:scale-110 active:scale-95 transition-transform"
              title="Swap currencies"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-pink-800/80 dark:text-pink-200/80 font-semibold">Target Payout:</span>
            <button
              onClick={() => setPickerType('target')}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
            >
              <span>{targetCurrency.flag}</span>
              <span>{targetCurrency.code}</span>
              <span className="text-emerald-500 font-normal">({targetCurrency.symbol})</span>
            </button>
          </div>

          <div className="text-xs font-display text-emerald-700 dark:text-emerald-400 font-bold">
            1 {baseCurrency.code} = {unitRate < 0.01 ? unitRate.toFixed(4) : unitRate.toFixed(3)} {targetCurrency.code}
          </div>
        </div>
      </div>

      {/* Interactive Input Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field 1: Hours Worked */}
        <div className="p-5 rounded-3xl pastel-glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="hourly-hours-input" className="text-xs font-accent font-bold uppercase tracking-wider text-pink-800 dark:text-pink-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span>Hours Worked</span>
            </label>
            {hoursWorked > 0 && (
              <button
                onClick={() => setHoursWorked(0)}
                className="text-xs font-accent text-pink-500 hover:text-rose-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              id="hourly-hours-input"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 500"
              value={hoursWorked || ''}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setHoursWorked(isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-full px-4 py-3 rounded-2xl bg-white/90 dark:bg-[#251536] border border-pink-200 dark:border-pink-500/30 text-2xl font-bold font-display text-[#4A1E2D] dark:text-[#FFF0F5] focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-xs"
            />
            <span className="absolute right-4 font-accent text-sm font-bold text-pink-400 pointer-events-none">
              hrs
            </span>
          </div>

          {/* Hours Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {hourPresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => setHoursWorked(preset.value)}
                className={`px-3 py-1 rounded-full text-xs font-display font-semibold transition-all ${
                  hoursWorked === preset.value
                    ? 'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white font-bold shadow-md shadow-pink-500/25'
                    : 'bg-white/80 dark:bg-white/5 text-[#5B2C3B] dark:text-[#FFE6EE] hover:bg-pink-100/50 border border-pink-200/80 dark:border-pink-400/15'
                }`}
              >
                {preset.label} <span className="opacity-70 text-[10px]">({preset.desc})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Field 2: Hourly Rate */}
        <div className="p-5 rounded-3xl pastel-glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="hourly-rate-input" className="text-xs font-accent font-bold uppercase tracking-wider text-pink-800 dark:text-pink-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-pink-500" />
              <span>Hourly Rate ({baseCurrency.code})</span>
            </label>
            {hourlyRate > 0 && (
              <button
                onClick={() => setHourlyRate(0)}
                className="text-xs font-accent text-pink-500 hover:text-rose-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-4 font-display text-xl font-bold text-pink-400 pointer-events-none">
              {baseCurrency.symbol}
            </span>
            <input
              id="hourly-rate-input"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 6"
              value={hourlyRate || ''}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setHourlyRate(isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-full pl-10 pr-14 py-3 rounded-2xl bg-white/90 dark:bg-[#251536] border border-pink-200 dark:border-pink-500/30 text-2xl font-bold font-display text-[#4A1E2D] dark:text-[#FFF0F5] focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-xs"
            />
            <span className="absolute right-4 font-accent text-sm font-bold text-pink-400 pointer-events-none">
              / hr
            </span>
          </div>

          {/* Rate Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {ratePresets.map(preset => (
              <button
                key={preset}
                onClick={() => setHourlyRate(preset)}
                className={`px-3 py-1 rounded-full text-xs font-display font-semibold transition-all ${
                  hourlyRate === preset
                    ? 'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white font-bold shadow-md shadow-pink-500/25'
                    : 'bg-white/80 dark:bg-white/5 text-[#5B2C3B] dark:text-[#FFE6EE] hover:bg-pink-100/50 border border-pink-200/80 dark:border-pink-400/15'
                }`}
              >
                {baseCurrency.symbol}{preset}/hr
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Output Display (Simultaneous Native + Converted Total) */}
      <div className="p-6 rounded-3xl pastel-glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-200/60 dark:border-pink-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
            <span className="text-xs font-accent font-bold uppercase tracking-wider text-pink-900 dark:text-pink-200">
              Total Earnings Summary
            </span>
          </div>
          <div className="text-xs font-display text-pink-700/80 dark:text-pink-300/80 font-semibold">
            {hoursWorked} hrs × {baseCurrency.symbol}{hourlyRate} {baseCurrency.code}
          </div>
        </div>

        {/* Dual Grand Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Native Base Total */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/85 dark:bg-[#251536]/85 border border-pink-200 dark:border-pink-400/20 shadow-sm">
            <div className="text-xs font-accent font-bold text-pink-700 dark:text-pink-300 mb-1 flex items-center justify-between">
              <span>Native Total ({baseCurrency.code})</span>
              <span className="text-xl">{baseCurrency.flag}</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl font-black text-[#4A1E2D] dark:text-[#FFF0F5] tracking-tight">
              {baseCurrency.symbol} {formatCurrencyValue(totalBaseEarnings, baseCurrency.code)}
            </div>
            <div className="text-xs font-accent text-pink-600/70 dark:text-pink-300/70 mt-1">
              Base charge in {baseCurrency.name}
            </div>
          </div>

          {/* Converted Target Total (Emerald Accent) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/80 dark:from-[#14262E]/90 dark:to-[#0F1E24]/85 border border-emerald-300 dark:border-emerald-500/35 shadow-sm">
            <div className="text-xs font-accent font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center justify-between">
              <span>Target Payout ({targetCurrency.code})</span>
              <span className="text-xl">{targetCurrency.flag}</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
              {targetCurrency.symbol} {formatCurrencyValue(totalConvertedEarnings, targetCurrency.code)}
            </div>
            <div className="text-xs font-accent text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              @ 1 {baseCurrency.code} = {unitRate.toFixed(4)} {targetCurrency.code} (Live FX)
            </div>
          </div>
        </div>

        {/* Optional Fee / Deductions Simulator */}
        <div className="pt-3 border-t border-pink-200/60 dark:border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-accent">
          <div className="flex items-center gap-2">
            <Percent className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[#4A1E2D] dark:text-[#FFF0F5] font-semibold">Platform Fee / Tax Deduction:</span>
            <div className="relative inline-flex items-center">
              <input
                id="platform-fee-input"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={platformFeePercent}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setPlatformFeePercent(isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
                }}
                className="w-16 px-2.5 py-1 rounded-full bg-white dark:bg-[#201230] border border-pink-300 dark:border-pink-500/30 text-xs font-display font-bold text-purple-600 dark:text-purple-300 text-center focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-xs"
              />
              <span className="ml-1 text-pink-500 font-bold">%</span>
            </div>
            <div className="flex gap-1 ml-1">
              {[0, 5, 10, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => setPlatformFeePercent(pct)}
                  className={`px-2 py-0.5 rounded-full text-xs font-display font-semibold transition-colors ${
                    platformFeePercent === pct
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {platformFeePercent > 0 && (
            <div className="font-display text-pink-800 dark:text-pink-200 text-right">
              Net: <span className="font-extrabold">{baseCurrency.symbol}{formatCurrencyValue(netBaseEarnings, baseCurrency.code)}</span>
              <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-bold">
                (≈ {targetCurrency.symbol}{formatCurrencyValue(netConvertedEarnings, targetCurrency.code)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Work Projections Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Daily (8 hrs)', mult: 8 },
          { label: 'Weekly (40 hrs)', mult: 40 },
          { label: 'Monthly (160 hrs)', mult: 160 },
          { label: 'Annual (2,000 hrs)', mult: 2000 },
        ].map(item => (
          <div key={item.label} className="p-4 rounded-2xl bg-white/80 dark:bg-[#201230]/80 border border-pink-200/80 dark:border-pink-400/20 shadow-xs">
            <span className="text-xs font-accent font-bold text-pink-700 dark:text-pink-300 block mb-1">
              {item.label}
            </span>
            <div className="font-display text-lg font-black text-[#4A1E2D] dark:text-[#FFF0F5]">
              {baseCurrency.symbol}{formatCurrencyValue(hourlyRate * item.mult, baseCurrency.code)}
            </div>
            <span className="text-xs font-display text-emerald-600 dark:text-emerald-400 font-semibold">
              ≈ {targetCurrency.symbol}{formatCurrencyValue(convertCurrency(hourlyRate * item.mult, baseCurrency.code, targetCurrency.code, ratesData.rates), targetCurrency.code)}
            </span>
          </div>
        ))}
      </div>

      {/* Send to Calculator Quick Action */}
      {onSendToCalculator && totalBaseEarnings > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => onSendToCalculator(totalBaseEarnings)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#251536] hover:bg-pink-50 text-pink-700 dark:text-pink-300 hover:text-pink-900 text-xs font-accent font-bold border border-pink-300/80 dark:border-pink-500/30 transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Send {baseCurrency.symbol}{formatCurrencyValue(totalBaseEarnings, baseCurrency.code)} to Standard Calculator ✨</span>
          </button>
        </div>
      )}

      {/* Currency Search Modal */}
      <CurrencySearchModal
        isOpen={pickerType !== null}
        onClose={() => setPickerType(null)}
        selectedCode={pickerType === 'base' ? baseCurrency.code : targetCurrency.code}
        onSelect={c => {
          if (pickerType === 'base') onSelectBase(c);
          else if (pickerType === 'target') onSelectTarget(c);
        }}
        title={pickerType === 'base' ? 'Select Base Charging Currency ✨' : 'Select Target Payout Currency 💖'}
        rates={ratesData.rates}
      />
    </div>
  );
};
