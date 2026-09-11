import { AngleMode } from '../types';

/**
 * High precision formatting helper: strips floating point inaccuracies (e.g. 0.1 + 0.2 -> 0.3)
 */
export function sanitizeNumber(val: number): string {
  if (isNaN(val)) return 'Error';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

  // Round to 12 decimal places to remove floating noise
  const rounded = parseFloat(val.toFixed(12));
  
  // If absolute value is huge or tiny, use scientific notation
  if (Math.abs(rounded) > 1e15 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
    return rounded.toExponential(6).replace('e+', 'e');
  }

  return rounded.toString();
}

/**
 * Calculates factorial of a non-negative integer
 */
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // JS overflow
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

/**
 * Safely evaluates mathematical expression with standard and scientific functions
 */
export function evaluateExpression(expr: string, angleMode: AngleMode = 'deg'): { result: number; error: string | null } {
  try {
    if (!expr.trim()) {
      return { result: 0, error: null };
    }

    // Clean up symbols
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`);

    // Convert trig functions depending on angleMode
    // deg to rad factor: Math.PI / 180
    const toRadFactor = angleMode === 'deg' ? `* (${Math.PI} / 180)` : '';
    const fromRadFactor = angleMode === 'deg' ? `* (180 / ${Math.PI})` : '';

    // Replace functions safely using Math
    sanitized = sanitized
      .replace(/sin\(([^)]+)\)/g, `Math.sin(($1)${toRadFactor})`)
      .replace(/cos\(([^)]+)\)/g, `Math.cos(($1)${toRadFactor})`)
      .replace(/tan\(([^)]+)\)/g, `Math.tan(($1)${toRadFactor})`)
      .replace(/asin\(([^)]+)\)/g, `(Math.asin($1)${fromRadFactor})`)
      .replace(/acos\(([^)]+)\)/g, `(Math.acos($1)${fromRadFactor})`)
      .replace(/atan\(([^)]+)\)/g, `(Math.atan($1)${fromRadFactor})`)
      .replace(/log\(([^)]+)\)/g, `Math.log10($1)`)
      .replace(/ln\(([^)]+)\)/g, `Math.log($1)`)
      .replace(/sqrt\(([^)]+)\)/g, `Math.sqrt($1)`)
      .replace(/cbrt\(([^)]+)\)/g, `Math.cbrt($1)`)
      .replace(/exp\(([^)]+)\)/g, `Math.exp($1)`)
      .replace(/(\d+(\.\d+)?)%/g, '($1 / 100)')
      .replace(/\^/g, '**');

    // Handle factorial syntax: e.g. 5! -> factorial(5)
    sanitized = sanitized.replace(/(\d+)!/g, (_, num) => {
      return `${factorial(parseInt(num, 10))}`;
    });

    // Check balance of parentheses and auto-close if missing
    let openCount = 0;
    for (const char of sanitized) {
      if (char === '(') openCount++;
      if (char === ')') openCount--;
    }
    if (openCount > 0) {
      sanitized += ')'.repeat(openCount);
    }

    // Check for division by zero beforehand
    if (/\/0(?!\.)(?!\d)/.test(sanitized)) {
      return { result: NaN, error: 'Cannot divide by zero' };
    }

    // Safe execution using Function constructor with restricted scope
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function('Math', `"use strict"; return (${sanitized});`);
    const val = fn(Math);

    if (isNaN(val)) {
      return { result: NaN, error: 'Invalid operation' };
    }
    if (!isFinite(val)) {
      return { result: val, error: 'Calculation overflow' };
    }

    return { result: val, error: null };
  } catch {
    return { result: NaN, error: 'Syntax Error' };
  }
}

/**
 * Formats display string with thousands separators while preserving decimals
 */
export function formatDisplayNumber(str: string): string {
  if (!str) return '0';
  if (str === 'Error' || str === 'Cannot divide by zero' || str === 'Infinity' || str === '-Infinity') {
    return str;
  }

  // If ends with a decimal point or operator, format the numeric part
  const parts = str.split(/([+\-×÷^])/);
  if (parts.length > 1) {
    return parts
      .map(part => {
        if (/^[+\-×÷^]$/.test(part)) return ` ${part} `;
        const num = parseFloat(part);
        if (!isNaN(num) && !part.includes('(') && !part.includes(')')) {
          const [intPart, decPart] = part.split('.');
          const formattedInt = parseInt(intPart, 10).toLocaleString('en-US');
          return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
        }
        return part;
      })
      .join('');
  }

  // Single number
  const [intPart, decPart] = str.split('.');
  const intNum = parseFloat(intPart);
  if (isNaN(intNum)) return str;

  const formattedInt = (intPart.startsWith('-') && intNum === 0 ? '-' : '') + Math.abs(intNum).toLocaleString('en-US');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}
