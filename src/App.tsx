import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AngleMode, CalculatorMode, Currency, HistoryItem, ThemeMode } from './types';
import { CURRENCIES, convertCurrency } from './data/currencies';
import { evaluateExpression, formatDisplayNumber, sanitizeNumber, factorial } from './utils/calculator';
import { useExchangeRates } from './hooks/useExchangeRates';
import { Navbar } from './components/Navbar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { Keypad } from './components/Keypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CurrencyHubView } from './components/CurrencyHubView';
import { HourlyCalculatorView } from './components/HourlyCalculatorView';
import { Keyboard } from 'lucide-react';

export default function App() {
  // 1. Theme State (Persistent Dark/Light Mode)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('currencypulse_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {
      // fallback
    }
    return 'dark';
  });

  // Apply theme class to <html> and <body> and persist
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('currencypulse_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Mode state ('standard' | 'scientific' | 'currency' | 'hourly')
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');

  // Navigation Drawer state (Hamburger Menu)
  const [isNavOpen, setIsNavOpen] = useState(false);

  // 3. Currency State & Real-Time Engine (60s Auto-Poll & Offline Cache)
  const [baseCurrency, setBaseCurrency] = useState<Currency>(CURRENCIES[0]); // USD
  const [targetCurrency, setTargetCurrency] = useState<Currency>(CURRENCIES.find(c => c.code === 'INR') || CURRENCIES[1]); // INR

  // Custom hook handling live exchange rates, auto-polling (60s), manual refresh, connectivity status, and offline caching
  const {
    ratesData,
    isRefreshing: isRefreshingRates,
    refreshRates: loadRates,
    statusText: ratesStatusText,
    isLive: isRatesLive,
  } = useExchangeRates(baseCurrency.code, targetCurrency.code);

  // 4. Calculator State Machine
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [activeOperator, setActiveOperator] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Sound Mute state
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    return localStorage.getItem('currencypulse_sound_muted') === 'true';
  });

  // History Drawer state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('currencypulse_history') || localStorage.getItem('vaultcalc_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('currencypulse_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Current numeric value for history snapshot
  const currentNumericValue = useMemo(() => {
    const num = parseFloat(displayValue);
    return isNaN(num) ? 0 : num;
  }, [displayValue]);

  // --- Calculator Operations ---

  // Input Digit
  const handleInputDigit = useCallback((digit: string) => {
    setError(null);
    setDisplayValue(prev => {
      if (hasCalculated) {
        setHasCalculated(false);
        setExpression('');
        return digit;
      }
      if (prev === '0' || prev === 'Error') {
        return digit;
      }
      return prev + digit;
    });
  }, [hasCalculated]);

  // Input Decimal
  const handleDecimal = useCallback(() => {
    setError(null);
    setDisplayValue(prev => {
      if (hasCalculated) {
        setHasCalculated(false);
        setExpression('');
        return '0.';
      }
      const parts = prev.split(/[+\-×÷^]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) return prev;
      return prev + '.';
    });
  }, [hasCalculated]);

  // Input Operator (+, −, ×, ÷, ^)
  const handleInputOperator = useCallback((op: string) => {
    setError(null);
    setActiveOperator(op);
    setHasCalculated(false);

    setDisplayValue(prev => {
      const trimmed = prev.trim();
      const lastChar = trimmed.slice(-1);
      if (['+', '−', '×', '÷', '^'].includes(lastChar)) {
        return trimmed.slice(0, -1) + op;
      }
      return prev + op;
    });
  }, []);

  // Backspace / Delete
  const handleDelete = useCallback(() => {
    setError(null);
    setDisplayValue(prev => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  }, []);

  // All Clear (AC)
  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setExpression('');
    setActiveOperator(null);
    setError(null);
    setHasCalculated(false);
  }, []);

  // Negate (+/-)
  const handleNegate = useCallback(() => {
    setError(null);
    setDisplayValue(prev => {
      const num = parseFloat(prev);
      if (isNaN(num)) return prev;
      return sanitizeNumber(-num);
    });
  }, []);

  // Percent (%)
  const handlePercent = useCallback(() => {
    setError(null);
    setDisplayValue(prev => {
      const num = parseFloat(prev);
      if (isNaN(num)) return prev;
      return sanitizeNumber(num / 100);
    });
  }, []);

  // Scientific Functions
  const handleScientificFunc = useCallback((fn: string) => {
    setError(null);
    setDisplayValue(prev => {
      const num = parseFloat(prev);
      if (isNaN(num)) return prev;

      let resultVal = num;
      switch (fn) {
        case 'sin':
          resultVal = angleMode === 'deg' ? Math.sin((num * Math.PI) / 180) : Math.sin(num);
          break;
        case 'cos':
          resultVal = angleMode === 'deg' ? Math.cos((num * Math.PI) / 180) : Math.cos(num);
          break;
        case 'tan':
          resultVal = angleMode === 'deg' ? Math.tan((num * Math.PI) / 180) : Math.tan(num);
          break;
        case 'log':
          resultVal = Math.log10(num);
          break;
        case 'ln':
          resultVal = Math.log(num);
          break;
        case 'sqrt':
          resultVal = num < 0 ? NaN : Math.sqrt(num);
          break;
        case 'cbrt':
          resultVal = Math.cbrt(num);
          break;
        case 'sq':
          resultVal = num * num;
          break;
        case 'fact':
          resultVal = factorial(num);
          break;
        case 'inv':
          resultVal = num === 0 ? NaN : 1 / num;
          break;
        default:
          break;
      }

      if (isNaN(resultVal)) {
        setError('Invalid operation');
        return 'Error';
      }

      const clean = sanitizeNumber(resultVal);
      setExpression(`${fn}(${prev}) =`);
      return clean;
    });
  }, [angleMode]);

  // Memory Actions (MC, MR, M+, M-)
  const handleMemoryAction = useCallback((action: 'MC' | 'MR' | 'M+' | 'M-') => {
    const num = parseFloat(displayValue) || 0;
    if (action === 'MC') {
      setMemoryValue(0);
    } else if (action === 'MR') {
      setDisplayValue(sanitizeNumber(memoryValue));
      setHasCalculated(true);
    } else if (action === 'M+') {
      setMemoryValue(prev => prev + num);
    } else if (action === 'M-') {
      setMemoryValue(prev => prev - num);
    }
  }, [displayValue, memoryValue]);

  // Equals (=)
  const handleEquals = useCallback(() => {
    if (!displayValue || displayValue === '0') return;

    setActiveOperator(null);
    const { result, error: evalError } = evaluateExpression(displayValue, angleMode);

    if (evalError) {
      setError(evalError);
      return;
    }

    const cleanResult = sanitizeNumber(result);
    const prevExpr = displayValue;
    setExpression(`${prevExpr} =`);
    setDisplayValue(cleanResult);
    setHasCalculated(true);

    // Save snapshot to history with live currency conversion rate
    const convertedSnap = convertCurrency(
      result,
      baseCurrency.code,
      targetCurrency.code,
      ratesData.rates
    );

    const newHistoryItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      expression: prevExpr,
      result: cleanResult,
      mode,
      baseCurrency: baseCurrency.code,
      baseAmount: result,
      targetCurrency: targetCurrency.code,
      targetAmount: convertedSnap,
    };

    setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]); // keep last 50
  }, [displayValue, angleMode, mode, baseCurrency.code, targetCurrency.code, ratesData.rates]);

  // Physical Keyboard Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleInputDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '+') {
        e.preventDefault();
        handleInputOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        handleInputOperator('−');
      } else if (key === '*') {
        e.preventDefault();
        handleInputOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleInputOperator('÷');
      } else if (key === '^') {
        e.preventDefault();
        handleInputOperator('^');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (key === '%') {
        e.preventDefault();
        handlePercent();
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleInputDigit(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputDigit, handleDecimal, handleInputOperator, handleEquals, handleDelete, handleClear, handlePercent]);

  // Currency Swapping
  const handleSwapCurrencies = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
  };

  // Recall item from history
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setDisplayValue(item.result);
    setExpression(`${item.expression} =`);
    setHasCalculated(true);
  };

  const handleToggleSound = () => {
    const nextState = !isSoundMuted;
    setIsSoundMuted(nextState);
    localStorage.setItem('currencypulse_sound_muted', String(nextState));
  };

  return (
    <div
      id="currencypulse-app-root"
      className="min-h-screen w-full pastel-mesh-bg text-[#4A1E2D] dark:text-[#FFF0F5] flex flex-col items-center justify-between p-3 sm:p-6 select-none relative overflow-x-hidden transition-colors duration-300"
    >
      {/* Background soft pastel ambient mesh orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-pink-300/30 dark:bg-pink-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-10 right-1/4 w-[450px] h-[450px] bg-purple-300/30 dark:bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed top-1/2 -left-20 w-[400px] h-[400px] bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto flex flex-col z-10">
        {/* Navigation Header with Hamburger Menu & Explicit Theme Switcher */}
        <Navbar
          mode={mode}
          theme={theme}
          onOpenNavDrawer={() => setIsNavOpen(true)}
          onToggleTheme={handleToggleTheme}
          onSelectTheme={setTheme}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
          isSoundMuted={isSoundMuted}
          onToggleSound={handleToggleSound}
        />

        {/* Dynamic Mode Routing */}
        {mode === 'currency' ? (
          /* TAB 2: Dedicated Full-Screen Currency Converter Hub */
          <CurrencyHubView
            baseCurrency={baseCurrency}
            targetCurrency={targetCurrency}
            ratesData={ratesData}
            onSelectBase={setBaseCurrency}
            onSelectTarget={setTargetCurrency}
            onSwapCurrencies={handleSwapCurrencies}
            onRefreshRates={loadRates}
            isRefreshingRates={isRefreshingRates}
            statusText={ratesStatusText}
            onSendToCalculator={amt => {
              setDisplayValue(sanitizeNumber(amt));
              setMode('standard');
            }}
          />
        ) : mode === 'hourly' ? (
          /* TAB 3: Dedicated Hourly Rate / Freelance Project Calculator */
          <HourlyCalculatorView
            baseCurrency={baseCurrency}
            targetCurrency={targetCurrency}
            ratesData={ratesData}
            onSelectBase={setBaseCurrency}
            onSelectTarget={setTargetCurrency}
            onSendToCalculator={amt => {
              setDisplayValue(sanitizeNumber(amt));
              setMode('standard');
            }}
          />
        ) : (
          /* TAB 1: Isolated Standard & Scientific Calculator (Pure Math, Distraction-Free Display & Keypad) */
          <div className="w-full max-w-xl mx-auto space-y-3.5">
            {/* Pure Mathematical Display */}
            <CalculatorDisplay
              expression={expression}
              displayValue={formatDisplayNumber(displayValue)}
              activeOperator={activeOperator}
              angleMode={angleMode}
              mode={mode}
              hasMemory={memoryValue !== 0}
              error={error}
              onToggleAngleMode={() => setAngleMode(prev => (prev === 'deg' ? 'rad' : 'deg'))}
            />

            {/* Tactile Categorized Pastel Keypad */}
            <div
              id="calculator-keypad-panel"
              className="p-4 sm:p-5 rounded-3xl pastel-glass-panel transition-all"
            >
              <Keypad
                mode={mode}
                activeOperator={activeOperator}
                onInputDigit={handleInputDigit}
                onInputOperator={handleInputOperator}
                onEquals={handleEquals}
                onClear={handleClear}
                onDelete={handleDelete}
                onNegate={handleNegate}
                onPercent={handlePercent}
                onDecimal={handleDecimal}
                onScientificFunc={handleScientificFunc}
                onMemoryAction={handleMemoryAction}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Info Bar */}
      <footer className="w-full max-w-4xl mx-auto mt-6 pt-3 border-t border-pink-200/60 dark:border-pink-500/15 flex flex-col sm:flex-row items-center justify-between text-xs font-accent text-pink-700/80 dark:text-pink-300/80 gap-2 z-10">
        <div className="flex items-center gap-2">
          <Keyboard className="w-3.5 h-3.5 text-pink-500" />
          <span>Full keyboard support active (0-9, + - * / Enter Esc)</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold">
          <span>CurrencyPulse ✨ Aesthetic Math & FX Studio</span>
        </div>
      </footer>

      {/* Slide-out Navigation Drawer (Hamburger Menu) */}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        mode={mode}
        onModeChange={setMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectTheme={setTheme}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* History Slide-out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
