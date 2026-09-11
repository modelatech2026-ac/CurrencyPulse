import React from 'react';
import { CalculatorMode, ThemeMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  Atom,
  Coins,
  Clock,
  X,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  History,
  Check,
  ChevronRight,
  Sparkles,
  Heart,
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectTheme?: (theme: ThemeMode) => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
  theme,
  onToggleTheme,
  onSelectTheme,
  isSoundMuted,
  onToggleSound,
  onOpenHistory,
  historyCount,
}) => {
  const modes: {
    id: CalculatorMode;
    label: string;
    badge: string;
    icon: React.ReactNode;
    desc: string;
    sparkleIcon: string;
  }[] = [
    {
      id: 'standard',
      label: 'Standard Calculator',
      badge: 'Arithmetic ✨',
      icon: <Calculator className="w-5 h-5 text-pink-500" />,
      desc: 'Clean 4-operation mathematical calculations with smooth rounded numbers',
      sparkleIcon: '🌸',
    },
    {
      id: 'scientific',
      label: 'Scientific Calculator',
      badge: 'Advanced 🔬',
      icon: <Atom className="w-5 h-5 text-purple-500" />,
      desc: 'Trigonometry (DEG/RAD), logarithms, powers, roots & factorials',
      sparkleIcon: '✨',
    },
    {
      id: 'currency',
      label: 'Currency Hub',
      badge: 'Live FX 💖',
      icon: <Coins className="w-5 h-5 text-emerald-500" />,
      desc: 'Live exchange rates, bidirectional manual input & global basket',
      sparkleIcon: '🎀',
    },
    {
      id: 'hourly',
      label: 'Hourly / Freelance Calculator',
      badge: 'Rates ☁️',
      icon: <Clock className="w-5 h-5 text-pink-500" />,
      desc: 'Hours worked × Hourly Rate with simultaneous multi-currency payout',
      sparkleIcon: '☁️',
    },
  ];

  const handleSelectMode = (newMode: CalculatorMode) => {
    onModeChange(newMode);
    onClose();
  };

  const handleSetTheme = (newTheme: ThemeMode) => {
    if (onSelectTheme) {
      onSelectTheme(newTheme);
    } else if (theme !== newTheme) {
      onToggleTheme();
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

          {/* Slide-out Navigation Drawer */}
          <motion.aside
            id="navigation-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute left-0 top-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-[#1E112B]/95 backdrop-blur-2xl border-r border-pink-200 dark:border-pink-500/20 shadow-2xl flex flex-col z-10 overflow-hidden transition-colors duration-300"
            role="dialog"
            aria-label="Application Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pink-200/60 dark:border-pink-500/20 bg-pink-50/60 dark:bg-[#251536]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-400/30 border border-pink-300/60">
                  <Heart className="w-5 h-5 fill-white/30 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-accent">
                    <span className="font-extrabold text-[#4A1E2D] dark:text-[#FFF0F5] text-base tracking-tight">
                      CurrencyPulse
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-500/30">
                      PASTEL
                    </span>
                  </div>
                  <p className="text-xs font-accent text-pink-700/70 dark:text-pink-300/70">
                    Aesthetic Math & FX Studio
                  </p>
                </div>
              </div>

              <button
                id="close-nav-drawer-btn"
                onClick={onClose}
                className="p-2 rounded-full text-pink-400 hover:text-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selection Section */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <span className="text-xs font-accent font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 px-1 block mb-3 flex items-center gap-1.5">
                  <span>Calculator Modes & Tools</span>
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                </span>

                <div className="space-y-2">
                  {modes.map(item => {
                    const isActive = mode === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-mode-${item.id}`}
                        onClick={() => handleSelectMode(item.id)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 group relative font-accent ${
                          isActive
                            ? 'bg-pink-100/90 dark:bg-pink-950/60 border-pink-400 dark:border-pink-400/60 shadow-md shadow-pink-500/10'
                            : 'bg-white/60 dark:bg-[#251536]/70 hover:bg-pink-50 dark:hover:bg-[#2D1A40] border-pink-200/80 dark:border-pink-500/15'
                        }`}
                      >
                        {/* Icon Container */}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white shadow-md shadow-pink-500/30'
                              : 'bg-white dark:bg-[#1E112B] border border-pink-200 dark:border-pink-500/20 shadow-xs'
                          }`}
                        >
                          <span className="text-lg">{item.sparkleIcon}</span>
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-sm font-bold tracking-tight truncate ${
                                isActive
                                  ? 'text-pink-950 dark:text-pink-100 font-extrabold'
                                  : 'text-[#4A1E2D] dark:text-[#FFF0F5]'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                                isActive
                                  ? 'bg-pink-300/80 dark:bg-pink-500/30 text-pink-950 dark:text-pink-200'
                                  : 'bg-pink-100/60 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-pink-700/70 dark:text-pink-300/70 line-clamp-2 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        {/* Checkmark or Chevron */}
                        <div className="shrink-0 self-center">
                          {isActive ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-pink-300 group-hover:translate-x-0.5 transition-transform" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explicit Light / Dark Mode Toggle Section */}
              <div className="pt-3 border-t border-pink-200/60 dark:border-pink-500/20">
                <span className="text-xs font-accent font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 px-1 block mb-3">
                  Appearance & Theme
                </span>

                <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-pink-50 dark:bg-[#180E24] border border-pink-200/80 dark:border-pink-500/20 font-accent">
                  {/* Light Mode Button */}
                  <button
                    id="drawer-theme-light-btn"
                    type="button"
                    onClick={() => handleSetTheme('light')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm shadow-pink-300/40'
                        : 'text-pink-700 hover:text-pink-950 dark:text-pink-300'
                    }`}
                  >
                    <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-white fill-white/20' : ''}`} />
                    <span>Pastel Rose</span>
                  </button>

                  {/* Dark Mode Button */}
                  <button
                    id="drawer-theme-dark-btn"
                    type="button"
                    onClick={() => handleSetTheme('dark')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-[#FF69B4] to-[#7B2CBF] text-white shadow-md shadow-purple-900/50'
                        : 'text-pink-700 hover:text-pink-950 dark:text-pink-300'
                    }`}
                  >
                    <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-pink-200 fill-pink-200/30' : ''}`} />
                    <span>Midnight Plum</span>
                  </button>
                </div>
              </div>

              {/* Utility Actions (Sound & History) */}
              <div className="pt-3 border-t border-pink-200/60 dark:border-pink-500/20 font-accent">
                <span className="text-xs font-accent font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 px-1 block mb-3">
                  Preferences & History
                </span>

                <div className="space-y-2">
                  {/* History Action */}
                  <button
                    id="drawer-history-btn"
                    onClick={() => {
                      onClose();
                      onOpenHistory();
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-[#251536]/70 hover:bg-pink-50 border border-pink-200/80 dark:border-pink-500/20 text-[#4A1E2D] dark:text-[#FFF0F5] text-xs font-bold transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 flex items-center justify-center border border-pink-200 dark:border-pink-500/30">
                        <History className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold">Calculation History</span>
                        <span className="text-xs text-pink-600/70 dark:text-pink-300/70 font-normal">View saved evaluations</span>
                      </div>
                    </div>
                    {historyCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white text-xs font-bold shadow-xs">
                        {historyCount}
                      </span>
                    )}
                  </button>

                  {/* Sound Haptic Toggle */}
                  <button
                    id="drawer-sound-toggle-btn"
                    onClick={onToggleSound}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-[#251536]/70 hover:bg-pink-50 border border-pink-200/80 dark:border-pink-500/20 text-[#4A1E2D] dark:text-[#FFF0F5] text-xs font-bold transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 flex items-center justify-center border border-pink-200 dark:border-pink-500/30">
                        {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-pink-600 dark:text-pink-300" />}
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold">Key Click Sounds</span>
                        <span className="text-xs text-pink-600/70 dark:text-pink-300/70 font-normal">
                          {isSoundMuted ? 'Muted' : 'Audible feedback enabled'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isSoundMuted
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {isSoundMuted ? 'OFF' : 'ON ✨'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-pink-200/60 dark:border-pink-500/20 bg-pink-50/50 dark:bg-[#180E24] text-center text-xs font-accent text-pink-600/70 dark:text-pink-300/70">
              <span className="font-bold text-[#4A1E2D] dark:text-[#FFF0F5]">CurrencyPulse ✨</span> · Soft Aesthetic Edition
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
