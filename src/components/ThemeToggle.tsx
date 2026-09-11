import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectTheme?: (theme: ThemeMode) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggleTheme,
  onSelectTheme,
}) => {
  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const handleSelect = (selected: ThemeMode) => {
    if (onSelectTheme) {
      onSelectTheme(selected);
    } else if (theme !== selected) {
      onToggleTheme();
    }
  };

  return (
    <div
      id="theme-switcher-segmented"
      role="radiogroup"
      aria-label="Color Theme Selection"
      className="flex items-center p-1 rounded-full bg-white/70 dark:bg-[#201230]/70 border border-pink-200/80 dark:border-pink-500/25 shadow-xs transition-colors duration-300 backdrop-blur-md"
    >
      {/* Light Mode Segment Button */}
      <button
        id="theme-btn-light"
        type="button"
        role="radio"
        aria-checked={isLight}
        onClick={() => handleSelect('light')}
        title="Switch to soft pastel rose & peach mode"
        className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-accent font-bold transition-all duration-200 select-none ${
          isLight
            ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm shadow-pink-300/50'
            : 'text-[#5B2C3B] dark:text-[#FFE6EE] hover:bg-pink-100/40'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${isLight ? 'text-white fill-white/20 animate-spin-slow' : 'text-pink-400'}`} />
        <span className="hidden sm:inline">Pastel</span>
      </button>

      {/* Dark Mode Segment Button */}
      <button
        id="theme-btn-dark"
        type="button"
        role="radio"
        aria-checked={isDark}
        onClick={() => handleSelect('dark')}
        title="Switch to midnight plum pastel mode"
        className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-accent font-bold transition-all duration-200 select-none ${
          isDark
            ? 'bg-gradient-to-r from-[#FF69B4] to-[#7B2CBF] text-white shadow-sm shadow-purple-900/50'
            : 'text-[#5B2C3B] dark:text-[#FFE6EE] hover:bg-pink-100/40'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-pink-200 fill-pink-200/30' : 'text-purple-400'}`} />
        <span className="hidden sm:inline">Midnight</span>
      </button>
    </div>
  );
};
