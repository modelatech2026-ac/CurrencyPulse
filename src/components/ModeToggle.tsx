import React from 'react';
import { CalculatorMode } from '../types';
import { motion } from 'motion/react';
import { Calculator, Atom, Coins, Clock } from 'lucide-react';

interface ModeToggleProps {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  const modes: { id: CalculatorMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      id: 'standard',
      label: 'Standard',
      icon: <Calculator className="w-3.5 h-3.5" />,
      tooltip: 'Standard 4-operation math (no currency distractions)',
    },
    {
      id: 'scientific',
      label: 'Scientific',
      icon: <Atom className="w-3.5 h-3.5" />,
      tooltip: 'Trigonometric, logarithmic & power functions',
    },
    {
      id: 'currency',
      label: 'Currency Hub',
      icon: <Coins className="w-3.5 h-3.5" />,
      tooltip: 'Live currency converter & global basket',
    },
    {
      id: 'hourly',
      label: 'Project Rates',
      icon: <Clock className="w-3.5 h-3.5" />,
      tooltip: 'Freelance project calculator (Hours worked × Hourly Rate)',
    },
  ];

  return (
    <div
      id="currencypulse-mode-toggle"
      className="relative flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-[#0B101E] border border-slate-300/80 dark:border-white/[0.08] shadow-inner transition-colors"
      role="tablist"
      aria-label="Calculator Mode Selector"
    >
      {modes.map(item => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            id={`mode-toggle-${item.id}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(item.id)}
            title={item.tooltip}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-semibold select-none transition-colors z-10 ${
              isActive
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="mode-pill-highlight"
                className="absolute inset-0 rounded-lg bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-600/90 dark:to-indigo-700/90 border border-indigo-400/40 shadow-sm shadow-indigo-600/30 dark:shadow-indigo-900/50"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              {item.icon}
              <span>{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
