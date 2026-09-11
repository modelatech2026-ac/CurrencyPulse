import React from 'react';
import { CalculatorMode } from '../types';
import { motion } from 'motion/react';
import { playKeySound } from '../utils/sound';
import { Delete, Sparkles } from 'lucide-react';

interface KeypadProps {
  mode: CalculatorMode;
  activeOperator: string | null;
  onInputDigit: (digit: string) => void;
  onInputOperator: (op: string) => void;
  onEquals: () => void;
  onClear: () => void;
  onDelete: () => void;
  onNegate: () => void;
  onPercent: () => void;
  onDecimal: () => void;
  onScientificFunc: (fn: string) => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-') => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  activeOperator,
  onInputDigit,
  onInputOperator,
  onEquals,
  onClear,
  onDelete,
  onNegate,
  onPercent,
  onDecimal,
  onScientificFunc,
  onMemoryAction,
}) => {
  // Categorized Key Button with distinct pastel shades & elastic bounce
  const KeyButton = ({
    label,
    onClick,
    category = 'number',
    className = '',
    active = false,
    ariaLabel,
    id,
  }: {
    label: React.ReactNode;
    onClick: () => void;
    category?: 'number' | 'operator' | 'action' | 'scientific' | 'memory' | 'equals';
    className?: string;
    active?: boolean;
    ariaLabel?: string;
    id: string;
  }) => {
    let colorClasses = '';

    switch (category) {
      case 'equals':
        // Primary Equals Key: Glowing Hot Pink Gradient (#FF69B4 to #FF1493) with bright white text and soft neon aura
        colorClasses =
          'bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white font-extrabold equals-glow border-2 border-pink-300/60 dark:border-pink-400/50';
        break;

      case 'operator':
        // Basic Operators: Sweet Cotton Candy Pink (#FFB7B2) with dark magenta text
        colorClasses = active
          ? 'bg-[#FF9EA5] dark:bg-[#782845] text-[#59102A] dark:text-[#FFE3EC] border-2 border-pink-400 dark:border-pink-300 shadow-[0_0_18px_rgba(255,105,180,0.45)] font-black'
          : 'bg-[#FFB7B2] hover:bg-[#FFA5A0] dark:bg-[#4E1F34] dark:hover:bg-[#612741] text-[#7A1E3D] dark:text-[#FFD1E0] border border-pink-300/80 dark:border-pink-400/20 font-bold shadow-xs';
        break;

      case 'action':
        // Action & Special Keys (AC, C, ±, %): Lilac / Pastel Lavender (#E2C2FF) with dark violet text
        colorClasses =
          'bg-[#E2C2FF] hover:bg-[#D7AEFF] dark:bg-[#3D1F5C] dark:hover:bg-[#4D2775] text-[#4C1D73] dark:text-[#EEDBFF] border border-purple-300/80 dark:border-purple-400/20 font-bold shadow-xs';
        break;

      case 'memory':
      case 'scientific':
        // Memory & Scientific: Soft Mint / Matcha Cloud (#C7CEEA / #D5E8D4) to distinguish finance/special operations
        colorClasses =
          'bg-[#C7CEEA] hover:bg-[#B6BFDE] dark:bg-[#25314D] dark:hover:bg-[#2E3C5E] text-[#2D3A60] dark:text-[#D6E0FF] border border-indigo-200/80 dark:border-indigo-400/20 font-semibold shadow-xs';
        break;

      case 'number':
      default:
        // Number Keys (0–9 & Decimal): Soft Pearl White (#FFFFFF) with glossy subtle inner shadows and dark rose text (#5B2C3B)
        colorClasses =
          'bg-white/95 hover:bg-white dark:bg-[#2A1A3B] dark:hover:bg-[#35214A] text-[#5B2C3B] dark:text-[#FFE6EE] border border-pink-200/90 dark:border-pink-400/15 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_8px_rgba(255,182,193,0.15)] dark:shadow-none font-bold text-xl sm:text-2xl';
        break;
    }

    return (
      <motion.button
        id={id}
        type="button"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.92, y: 2 }}
        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
        onClick={() => {
          if (category === 'equals') playKeySound('equals');
          else if (category === 'operator') playKeySound('operator');
          else if (category === 'action') playKeySound('clear');
          else playKeySound('digit');
          onClick();
        }}
        aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
        className={`keypad-elastic-bounce relative flex items-center justify-center rounded-2xl p-3 select-none font-accent ${colorClasses} ${className}`}
      >
        {label}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Memory Action Row (Soft Mint / Matcha Green #C7CEEA) */}
      <div className="grid grid-cols-5 gap-1.5 px-0.5">
        <KeyButton id="btn-mem-mc" label="MC" category="memory" onClick={() => onMemoryAction('MC')} ariaLabel="Memory Clear" className="text-xs" />
        <KeyButton id="btn-mem-mr" label="MR" category="memory" onClick={() => onMemoryAction('MR')} ariaLabel="Memory Recall" className="text-xs" />
        <KeyButton id="btn-mem-mplus" label="M+" category="memory" onClick={() => onMemoryAction('M+')} ariaLabel="Memory Add" className="text-xs" />
        <KeyButton id="btn-mem-mminus" label="M−" category="memory" onClick={() => onMemoryAction('M-')} ariaLabel="Memory Subtract" className="text-xs" />
        <KeyButton
          id="btn-delete"
          label={<Delete className="w-4 h-4 text-[#7A1E3D] dark:text-[#FFD1E0]" />}
          category="action"
          onClick={onDelete}
          ariaLabel="Backspace Delete"
        />
      </div>

      {/* Main Grid */}
      {mode === 'scientific' ? (
        <div className="grid grid-cols-5 gap-2">
          {/* Scientific Extra Row 1 (Soft Mint / Matcha) */}
          <KeyButton id="btn-sci-sin" label="sin" category="scientific" className="text-xs sm:text-sm" onClick={() => onScientificFunc('sin')} />
          <KeyButton id="btn-sci-cos" label="cos" category="scientific" className="text-xs sm:text-sm" onClick={() => onScientificFunc('cos')} />
          <KeyButton id="btn-sci-tan" label="tan" category="scientific" className="text-xs sm:text-sm" onClick={() => onScientificFunc('tan')} />
          <KeyButton id="btn-sci-log" label="log" category="scientific" className="text-xs sm:text-sm" onClick={() => onScientificFunc('log')} />
          <KeyButton id="btn-sci-ln" label="ln" category="scientific" className="text-xs sm:text-sm" onClick={() => onScientificFunc('ln')} />

          {/* Scientific Extra Row 2 */}
          <KeyButton id="btn-sci-sqrt" label="√" category="scientific" onClick={() => onScientificFunc('sqrt')} />
          <KeyButton id="btn-sci-sq" label="x²" category="scientific" onClick={() => onScientificFunc('sq')} />
          <KeyButton id="btn-sci-pow" label="xʸ" category="scientific" onClick={() => onInputOperator('^')} />
          <KeyButton id="btn-sci-pi" label="π" category="scientific" onClick={() => onInputDigit('π')} />
          <KeyButton id="btn-sci-e" label="e" category="scientific" onClick={() => onInputDigit('e')} />

          {/* Scientific Extra Row 3 */}
          <KeyButton id="btn-sci-lparen" label="(" category="scientific" onClick={() => onInputDigit('(')} />
          <KeyButton id="btn-sci-rparen" label=")" category="scientific" onClick={() => onInputDigit(')')} />
          <KeyButton id="btn-sci-fact" label="x!" category="scientific" onClick={() => onScientificFunc('fact')} />
          <KeyButton id="btn-sci-inv" label="1/x" category="scientific" onClick={() => onScientificFunc('inv')} />
          <KeyButton id="btn-action-ac" label="AC" category="action" onClick={onClear} ariaLabel="All Clear" />

          {/* Standard Keypad Mixed in 5-column scientific layout */}
          <KeyButton id="btn-num-7" label="7" category="number" onClick={() => onInputDigit('7')} />
          <KeyButton id="btn-num-8" label="8" category="number" onClick={() => onInputDigit('8')} />
          <KeyButton id="btn-num-9" label="9" category="number" onClick={() => onInputDigit('9')} />
          <KeyButton id="btn-op-div" label="÷" category="operator" active={activeOperator === '÷'} onClick={() => onInputOperator('÷')} />
          <KeyButton id="btn-sci-cbrt" label="∛" category="scientific" onClick={() => onScientificFunc('cbrt')} />

          <KeyButton id="btn-num-4" label="4" category="number" onClick={() => onInputDigit('4')} />
          <KeyButton id="btn-num-5" label="5" category="number" onClick={() => onInputDigit('5')} />
          <KeyButton id="btn-num-6" label="6" category="number" onClick={() => onInputDigit('6')} />
          <KeyButton id="btn-op-mul" label="×" category="operator" active={activeOperator === '×'} onClick={() => onInputOperator('×')} />
          <KeyButton id="btn-percent" label="%" category="action" onClick={onPercent} />

          <KeyButton id="btn-num-1" label="1" category="number" onClick={() => onInputDigit('1')} />
          <KeyButton id="btn-num-2" label="2" category="number" onClick={() => onInputDigit('2')} />
          <KeyButton id="btn-num-3" label="3" category="number" onClick={() => onInputDigit('3')} />
          <KeyButton id="btn-op-sub" label="−" category="operator" active={activeOperator === '−'} onClick={() => onInputOperator('−')} />
          <KeyButton id="btn-negate" label="±" category="action" onClick={onNegate} />

          <KeyButton id="btn-num-0" label="0" category="number" onClick={() => onInputDigit('0')} />
          <KeyButton id="btn-dot" label="." category="number" onClick={onDecimal} />
          <KeyButton id="btn-op-add" label="+" category="operator" active={activeOperator === '+'} onClick={() => onInputOperator('+')} />
          <KeyButton
            id="btn-equals"
            label={
              <span className="flex items-center gap-1">
                <span>=</span>
                <Sparkles className="w-4 h-4 text-pink-100" />
              </span>
            }
            category="equals"
            className="col-span-2 text-2xl"
            onClick={onEquals}
            ariaLabel="Calculate Equals"
          />
        </div>
      ) : (
        /* Standard 4-column layout */
        <div className="grid grid-cols-4 gap-2.5">
          {/* Action Row */}
          <KeyButton id="btn-action-ac" label="AC" category="action" onClick={onClear} ariaLabel="All Clear" />
          <KeyButton id="btn-negate" label="±" category="action" onClick={onNegate} />
          <KeyButton id="btn-percent" label="%" category="action" onClick={onPercent} />
          <KeyButton id="btn-op-div" label="÷" category="operator" active={activeOperator === '÷'} onClick={() => onInputOperator('÷')} className="text-2xl font-black" />

          {/* Row 7 8 9 × */}
          <KeyButton id="btn-num-7" label="7" category="number" onClick={() => onInputDigit('7')} />
          <KeyButton id="btn-num-8" label="8" category="number" onClick={() => onInputDigit('8')} />
          <KeyButton id="btn-num-9" label="9" category="number" onClick={() => onInputDigit('9')} />
          <KeyButton id="btn-op-mul" label="×" category="operator" active={activeOperator === '×'} onClick={() => onInputOperator('×')} className="text-2xl font-black" />

          {/* Row 4 5 6 − */}
          <KeyButton id="btn-num-4" label="4" category="number" onClick={() => onInputDigit('4')} />
          <KeyButton id="btn-num-5" label="5" category="number" onClick={() => onInputDigit('5')} />
          <KeyButton id="btn-num-6" label="6" category="number" onClick={() => onInputDigit('6')} />
          <KeyButton id="btn-op-sub" label="−" category="operator" active={activeOperator === '−'} onClick={() => onInputOperator('−')} className="text-2xl font-black" />

          {/* Row 1 2 3 + */}
          <KeyButton id="btn-num-1" label="1" category="number" onClick={() => onInputDigit('1')} />
          <KeyButton id="btn-num-2" label="2" category="number" onClick={() => onInputDigit('2')} />
          <KeyButton id="btn-num-3" label="3" category="number" onClick={() => onInputDigit('3')} />
          <KeyButton id="btn-op-add" label="+" category="operator" active={activeOperator === '+'} onClick={() => onInputOperator('+')} className="text-2xl font-black" />

          {/* Row 0 . = */}
          <KeyButton id="btn-num-0" label="0" category="number" className="col-span-1" onClick={() => onInputDigit('0')} />
          <KeyButton id="btn-dot" label="." category="number" onClick={onDecimal} />
          <KeyButton
            id="btn-equals"
            label={
              <span className="flex items-center justify-center gap-1.5 font-display font-extrabold text-3xl">
                <span>=</span>
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </span>
            }
            category="equals"
            className="col-span-2"
            onClick={onEquals}
            ariaLabel="Calculate Equals"
          />
        </div>
      )}
    </div>
  );
};
