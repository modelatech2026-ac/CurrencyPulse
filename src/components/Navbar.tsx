import React from 'react';
import { ThemeMode } from '../types';
import { ThemeToggle } from './ThemeToggle';
import {
  Menu,
  History,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
} from 'lucide-react';

interface NavbarProps {
  theme: ThemeMode;
  onOpenNavDrawer: () => void;
  onToggleTheme: () => void;
  onSelectTheme?: (theme: ThemeMode) => void;
  onOpenHistory: () => void;
  historyCount: number;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onOpenNavDrawer,
  onToggleTheme,
  onSelectTheme,
  onOpenHistory,
  historyCount,
  isSoundMuted,
  onToggleSound,
}) => {
  return (
    <header
      id="main-header"
      className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 mb-4 select-none px-1"
    >
      {/* Left: Hamburger Button (☰) & Brand Logo (Clean UI with no mode dropdowns) */}
      <div className="flex items-center gap-3">
        {/* Responsive Hamburger Icon Button - Exclusively opens the side-drawer */}
        <button
          id="hamburger-menu-btn"
          type="button"
          onClick={onOpenNavDrawer}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#251536]/80 border border-pink-200/80 dark:border-pink-500/25 text-[#5B2C3B] dark:text-[#FFE6EE] hover:bg-white hover:border-pink-400 active:scale-90 shadow-xs transition-all flex items-center justify-center group cursor-pointer"
          title="Open Calculator Modes Menu (☰)"
          aria-label="Open Calculator Modes Menu"
        >
          <Menu className="w-5 h-5 text-pink-700 dark:text-pink-300 group-hover:scale-110 transition-transform" />
        </button>

        {/* Brand Icon & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-400/30 border border-pink-300/60 shrink-0">
            <Heart className="w-5 h-5 fill-white/30 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-accent">
              <h1 className="text-base font-bold text-[#4A1E2D] dark:text-[#FFF0F5] tracking-tight">
                CurrencyPulse
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-500/30 flex items-center gap-1">
                <span>LIVE FX</span>
                <Sparkles className="w-2.5 h-2.5 text-pink-500" />
              </span>
            </div>
            <p className="text-[11px] font-accent text-pink-700/70 dark:text-pink-300/70 hidden sm:block">
              Aesthetic Math & Real-Time FX
            </p>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls (Theme Toggle, Audio Click, History Drawer) */}
      <div className="flex items-center gap-2">
        {/* Explicit Light / Dark Mode Toggle */}
        <ThemeToggle
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSelectTheme={onSelectTheme}
        />

        {/* Audio feedback toggle */}
        <button
          id="toggle-sound-btn"
          type="button"
          onClick={onToggleSound}
          className={`p-2 rounded-full border transition-all active:scale-90 shadow-xs cursor-pointer ${
            isSoundMuted
              ? 'bg-white/60 dark:bg-[#201230]/60 border-pink-200/60 dark:border-pink-500/20 text-pink-300 dark:text-pink-600'
              : 'bg-pink-100/90 dark:bg-pink-950/50 border-pink-300/80 dark:border-pink-500/30 text-pink-700 dark:text-pink-300'
          }`}
          title={isSoundMuted ? 'Unmute key sounds' : 'Mute key sounds'}
          aria-label="Toggle sound feedback"
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* History Drawer Button */}
        <button
          id="open-history-btn"
          type="button"
          onClick={onOpenHistory}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#201230]/80 hover:bg-pink-50 dark:hover:bg-[#2b1740] border border-pink-200/80 dark:border-pink-500/25 text-[#4A1E2D] dark:text-[#FFF0F5] text-xs font-accent font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
          title="Open calculation history"
        >
          <History className="w-3.5 h-3.5 text-pink-500" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span
              id="history-count-badge"
              className="ml-0.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-[10px] font-bold text-white font-accent"
            >
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
