import React, { useEffect, useState } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { AngleUnit } from '../types';
import { playKeyClick } from '../utils/sound';

interface KeypadProps {
  onInsert: (token: string) => void;
  onClear: () => void;
  onClearEntry: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onNegate: () => void;
  angleUnit: AngleUnit;
  onCycleAngleUnit: () => void;
  isSecondActive: boolean;
  onToggleSecond: () => void;
  isHypActive: boolean;
  onToggleHyp: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  onMemoryStore: () => void;
  soundEnabled: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInsert,
  onClear,
  onClearEntry,
  onBackspace,
  onCalculate,
  onNegate,
  angleUnit,
  onCycleAngleUnit,
  isSecondActive,
  onToggleSecond,
  isHypActive,
  onToggleHyp,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryRecall,
  onMemoryClear,
  onMemoryStore,
  soundEnabled,
}) => {
  const [showConstantsModal, setShowConstantsModal] = useState(false);

  // Keyboard shortcut binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        playKeyClick('num', soundEnabled);
        onInsert(e.key);
      } else if (e.key === '.') {
        playKeyClick('num', soundEnabled);
        onInsert('.');
      } else if (e.key === '+') {
        playKeyClick('op', soundEnabled);
        onInsert('+');
      } else if (e.key === '-') {
        playKeyClick('op', soundEnabled);
        onInsert('-');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        playKeyClick('op', soundEnabled);
        onInsert('×');
      } else if (e.key === '/') {
        e.preventDefault();
        playKeyClick('op', soundEnabled);
        onInsert('÷');
      } else if (e.key === '^') {
        playKeyClick('op', soundEnabled);
        onInsert('^');
      } else if (e.key === '(' || e.key === ')') {
        playKeyClick('op', soundEnabled);
        onInsert(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        playKeyClick('equal', soundEnabled);
        onCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        playKeyClick('action', soundEnabled);
        onBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playKeyClick('action', soundEnabled);
        onClear();
      } else if (e.key === '%') {
        playKeyClick('op', soundEnabled);
        onInsert('%');
      } else if (e.key === 'p' || e.key === 'P') {
        playKeyClick('op', soundEnabled);
        onInsert('π');
      } else if (e.key === 'e' || e.key === 'E') {
        playKeyClick('op', soundEnabled);
        onInsert('e');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInsert, onCalculate, onBackspace, onClear, soundEnabled]);

  const handleKey = (token: string, type: 'num' | 'op' | 'action' | 'equal' = 'num') => {
    playKeyClick(type, soundEnabled);
    onInsert(token);
  };

  // Dynamic Trigonometric button labels and actions
  const getTrigButton = (base: 'sin' | 'cos' | 'tan') => {
    if (isHypActive) {
      if (isSecondActive) {
        return { label: `a${base}h`, token: `a${base}h(` };
      }
      return { label: `${base}h`, token: `${base}h(` };
    }
    if (isSecondActive) {
      return { label: `${base}⁻¹`, token: `a${base}(` };
    }
    return { label: base, token: `${base}(` };
  };

  const sinBtn = getTrigButton('sin');
  const cosBtn = getTrigButton('cos');
  const tanBtn = getTrigButton('tan');

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Top Utility & Memory Row */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 text-xs font-mono">
        {/* 2nd toggle */}
        <button
          id="key-2nd"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onToggleSecond();
          }}
          className={`py-2 rounded-lg font-semibold transition-all shadow-sm ${
            isSecondActive
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-800 text-amber-400 hover:bg-slate-750 border border-slate-700/60'
          }`}
        >
          2nd
        </button>

        {/* HYP toggle */}
        <button
          id="key-hyp"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onToggleHyp();
          }}
          className={`py-2 rounded-lg font-semibold transition-all shadow-sm ${
            isHypActive
              ? 'bg-purple-500 text-slate-950 shadow-purple-500/20'
              : 'bg-slate-800 text-purple-300 hover:bg-slate-750 border border-slate-700/60'
          }`}
        >
          HYP
        </button>

        {/* DEG / RAD / GRAD switch */}
        <button
          id="key-angle-mode"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onCycleAngleUnit();
          }}
          className="py-2 rounded-lg font-semibold bg-slate-800 text-cyan-400 hover:bg-slate-750 border border-slate-700/60 transition-colors"
        >
          {angleUnit}
        </button>

        {/* Memory Buttons */}
        <button
          id="key-mc"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onMemoryClear();
          }}
          title="Memory Clear (Borrar memoria)"
          className="py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-750 transition-colors text-[11px]"
        >
          MC
        </button>
        <button
          id="key-mr"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onMemoryRecall();
          }}
          title="Memory Recall (Recuperar memoria)"
          className="py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 transition-colors text-[11px]"
        >
          MR
        </button>
        <button
          id="key-m-plus"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onMemoryAdd();
          }}
          title="Sumar a memoria (M+)"
          className="py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-emerald-400 border border-slate-750 transition-colors text-[11px]"
        >
          M+
        </button>
        <button
          id="key-m-minus"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onMemorySubtract();
          }}
          title="Restar de memoria (M-)"
          className="py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-emerald-400 border border-slate-750 transition-colors text-[11px]"
        >
          M-
        </button>
        <button
          id="key-ms"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onMemoryStore();
          }}
          title="Guardar en memoria (MS)"
          className="py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 transition-colors text-[11px]"
        >
          MS
        </button>

        {/* Constants Quick Button */}
        <button
          id="key-const-menu"
          onClick={() => setShowConstantsModal(!showConstantsModal)}
          className="col-span-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700/60 font-medium transition-colors text-xs flex items-center justify-center gap-1"
        >
          <span>Constantes</span>
          <span className="text-[10px] text-cyan-500 font-mono">(π, e, c...)</span>
        </button>
      </div>

      {/* Constants Flyout / Modal */}
      {showConstantsModal && (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono animate-in fade-in zoom-in-95">
          <button
            onClick={() => {
              handleKey('π', 'num');
              setShowConstantsModal(false);
            }}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left text-slate-200 border border-slate-750"
          >
            <div className="font-bold text-cyan-400">π (Pi)</div>
            <div className="text-[10px] text-slate-400">3.14159265...</div>
          </button>
          <button
            onClick={() => {
              handleKey('e', 'num');
              setShowConstantsModal(false);
            }}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left text-slate-200 border border-slate-750"
          >
            <div className="font-bold text-cyan-400">e (Euler)</div>
            <div className="text-[10px] text-slate-400">2.71828182...</div>
          </button>
          <button
            onClick={() => {
              handleKey('φ', 'num');
              setShowConstantsModal(false);
            }}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left text-slate-200 border border-slate-750"
          >
            <div className="font-bold text-cyan-400">φ (Áureo)</div>
            <div className="text-[10px] text-slate-400">1.61803398...</div>
          </button>
          <button
            onClick={() => {
              handleKey('c', 'num');
              setShowConstantsModal(false);
            }}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left text-slate-200 border border-slate-750"
          >
            <div className="font-bold text-cyan-400">c (Luz)</div>
            <div className="text-[10px] text-slate-400">299,792,458 m/s</div>
          </button>
          <button
            onClick={() => {
              handleKey('g', 'num');
              setShowConstantsModal(false);
            }}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left text-slate-200 border border-slate-750"
          >
            <div className="font-bold text-cyan-400">g (Gravedad)</div>
            <div className="text-[10px] text-slate-400">9.80665 m/s²</div>
          </button>
          <button
            onClick={() => {
              handleKey('h', 'num');
              setShowConstantsModal(false);
            }}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left text-slate-200 border border-slate-750"
          >
            <div className="font-bold text-cyan-400">h (Planck)</div>
            <div className="text-[10px] text-slate-400">6.62607e-34</div>
          </button>
        </div>
      )}

      {/* Main Combined Scientific & Numeric Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-sm font-mono">
        {/* Row 1: Scientific Functions */}
        <button
          id="key-sin"
          onClick={() => handleKey(sinBtn.token, 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          {sinBtn.label}
        </button>
        <button
          id="key-cos"
          onClick={() => handleKey(cosBtn.token, 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          {cosBtn.label}
        </button>
        <button
          id="key-tan"
          onClick={() => handleKey(tanBtn.token, 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          {tanBtn.label}
        </button>
        <button
          id="key-ln"
          onClick={() => handleKey(isSecondActive ? 'e^(' : 'ln(', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          {isSecondActive ? 'eˣ' : 'ln'}
        </button>
        <button
          id="key-log"
          onClick={() => handleKey(isSecondActive ? '10^(' : 'log(', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          {isSecondActive ? '10ˣ' : 'log'}
        </button>

        {/* Digits 7, 8, 9, Clear Entry, All Clear */}
        <button
          id="key-7"
          onClick={() => handleKey('7', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          7
        </button>
        <button
          id="key-8"
          onClick={() => handleKey('8', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          8
        </button>
        <button
          id="key-9"
          onClick={() => handleKey('9', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          9
        </button>
        <button
          id="key-ce"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onClearEntry();
          }}
          title="Borrar entrada actual"
          className="h-11 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-400 font-semibold border border-amber-800/40"
        >
          CE
        </button>
        <button
          id="key-ac"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onClear();
          }}
          title="Borrar todo (All Clear)"
          className="h-11 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-semibold border border-rose-800/40"
        >
          AC
        </button>

        {/* Row 2: Powers, Roots & Numbers 4, 5, 6 */}
        <button
          id="key-square"
          onClick={() => handleKey(isSecondActive ? 'cbrt(' : '^2', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          {isSecondActive ? '∛x' : 'x²'}
        </button>
        <button
          id="key-power"
          onClick={() => handleKey('^', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          xʸ
        </button>
        <button
          id="key-sqrt"
          onClick={() => handleKey(isSecondActive ? 'nthRoot(' : 'sqrt(', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          {isSecondActive ? 'ʸ√x' : '√x'}
        </button>
        <button
          id="key-reciprocal"
          onClick={() => handleKey('^(-1)', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          1/x
        </button>
        <button
          id="key-factorial"
          onClick={() => handleKey('!', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          n!
        </button>

        {/* Digits 4, 5, 6, Multiply, Divide */}
        <button
          id="key-4"
          onClick={() => handleKey('4', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          4
        </button>
        <button
          id="key-5"
          onClick={() => handleKey('5', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          5
        </button>
        <button
          id="key-6"
          onClick={() => handleKey('6', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          6
        </button>
        <button
          id="key-multiply"
          onClick={() => handleKey('×', 'op')}
          className="h-11 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xl font-bold border border-cyan-800/40"
        >
          ×
        </button>
        <button
          id="key-divide"
          onClick={() => handleKey('÷', 'op')}
          className="h-11 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xl font-bold border border-cyan-800/40"
        >
          ÷
        </button>

        {/* Row 3: Combinatorics, Brackets & Numbers 1, 2, 3 */}
        <button
          id="key-npr"
          onClick={() => handleKey(isSecondActive ? 'nCr(' : 'nPr(', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-xs"
        >
          {isSecondActive ? 'nCr' : 'nPr'}
        </button>
        <button
          id="key-open-paren"
          onClick={() => handleKey('(', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          (
        </button>
        <button
          id="key-close-paren"
          onClick={() => handleKey(')', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          )
        </button>
        <button
          id="key-percent"
          onClick={() => handleKey('%', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold"
        >
          %
        </button>
        <button
          id="key-abs"
          onClick={() => handleKey('abs(', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-xs"
        >
          |x|
        </button>

        {/* Digits 1, 2, 3, Plus, Minus */}
        <button
          id="key-1"
          onClick={() => handleKey('1', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          1
        </button>
        <button
          id="key-2"
          onClick={() => handleKey('2', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          2
        </button>
        <button
          id="key-3"
          onClick={() => handleKey('3', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          3
        </button>
        <button
          id="key-plus"
          onClick={() => handleKey('+', 'op')}
          className="h-11 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xl font-bold border border-cyan-800/40"
        >
          +
        </button>
        <button
          id="key-minus"
          onClick={() => handleKey('-', 'op')}
          className="h-11 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xl font-bold border border-cyan-800/40"
        >
          −
        </button>

        {/* Row 4: Constants, 0, Decimal, Ans, Negate, Equal */}
        <button
          id="key-pi"
          onClick={() => handleKey('π', 'num')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700/60 font-semibold text-base"
        >
          π
        </button>
        <button
          id="key-e"
          onClick={() => handleKey('e', 'num')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700/60 font-semibold text-base"
        >
          e
        </button>
        <button
          id="key-mod"
          onClick={() => handleKey(' mod ', 'op')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-xs"
        >
          mod
        </button>
        <button
          id="key-ans"
          onClick={() => handleKey('Ans', 'num')}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700/60 font-semibold text-xs"
        >
          Ans
        </button>
        <button
          id="key-backspace"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onBackspace();
          }}
          className="h-11 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Negate, Zero, Dot, Equal */}
        <button
          id="key-negate"
          onClick={() => {
            playKeyClick('action', soundEnabled);
            onNegate();
          }}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-base"
        >
          ±
        </button>
        <button
          id="key-0"
          onClick={() => handleKey('0', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          0
        </button>
        <button
          id="key-dot"
          onClick={() => handleKey('.', 'num')}
          className="h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-lg font-bold border border-slate-800 transition-colors"
        >
          .
        </button>
        <button
          id="key-equals"
          onClick={() => {
            playKeyClick('equal', soundEnabled);
            onCalculate();
          }}
          className="col-span-2 h-11 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-2xl font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center active:scale-[0.98]"
        >
          =
        </button>
      </div>
    </div>
  );
};
