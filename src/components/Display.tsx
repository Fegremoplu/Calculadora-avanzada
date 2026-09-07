import React, { useState } from 'react';
import { Copy, Check, CornerDownLeft, ListOrdered } from 'lucide-react';
import { AngleUnit, NumberFormat } from '../types';

interface DisplayProps {
  expression: string;
  result: string;
  livePreview: string | null;
  angleUnit: AngleUnit;
  onCycleAngleUnit: () => void;
  isSecondActive: boolean;
  isHypActive: boolean;
  hasMemory: boolean;
  numberFormat: NumberFormat;
  onCycleNumberFormat: () => void;
  isError: boolean;
  errorMessage?: string;
  onInsertAns: () => void;
  onOpenStepByStep?: () => void;
  hasProcedure?: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  livePreview,
  angleUnit,
  onCycleAngleUnit,
  isSecondActive,
  isHypActive,
  hasMemory,
  numberFormat,
  onCycleNumberFormat,
  isError,
  errorMessage,
  onOpenStepByStep,
  hasProcedure,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[148px]">
      {/* Top Indicators Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono select-none border-b border-slate-800/60 pb-2 mb-2">
        {/* Left Flags */}
        <div className="flex items-center gap-2">
          {/* Angle Unit Badge (Clickable) */}
          <button
            id="angle-unit-badge-btn"
            onClick={onCycleAngleUnit}
            title="Cambiar unidad de ángulo (DEG / RAD / GRAD)"
            className="px-2 py-0.5 rounded font-semibold bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            {angleUnit}
          </button>

          {/* 2nd Function Flag */}
          <span
            className={`px-1.5 py-0.5 rounded transition-colors ${
              isSecondActive
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold'
                : 'text-slate-600'
            }`}
          >
            2nd
          </span>

          {/* HYP Flag */}
          <span
            className={`px-1.5 py-0.5 rounded transition-colors ${
              isHypActive
                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 font-bold'
                : 'text-slate-600'
            }`}
          >
            HYP
          </span>

          {/* Memory Flag */}
          <span
            className={`px-1.5 py-0.5 rounded transition-colors ${
              hasMemory
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold'
                : 'text-slate-600'
            }`}
          >
            M
          </span>
        </div>

        {/* Right Format Selector */}
        <div className="flex items-center gap-2">
          <button
            id="number-format-toggle-btn"
            onClick={onCycleNumberFormat}
            title="Formato de resultado: Estándar / Científico / Fracción"
            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors flex items-center gap-1"
          >
            <span className="text-[10px] text-slate-400">FORMATO:</span>
            <span className="text-cyan-400 font-semibold uppercase">
              {numberFormat === 'standard' ? 'STD' : numberFormat === 'scientific' ? 'SCI' : 'FRAC'}
            </span>
          </button>

          {/* Copy Button */}
          <button
            id="copy-result-btn"
            onClick={handleCopy}
            title="Copiar resultado al portapapeles"
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expression Row */}
      <div className="overflow-x-auto whitespace-nowrap scrollbar-none text-right py-1">
        <span
          id="calculator-expression-text"
          className="font-mono text-base md:text-lg text-slate-300 tracking-wide select-all"
        >
          {expression || '0'}
        </span>
      </div>

      {/* Live Preview / Error Banner / Main Result */}
      <div className="flex flex-col items-end justify-end mt-1">
        {isError && errorMessage ? (
          <div className="text-rose-400 text-xs font-mono flex items-center gap-1">
            <span>⚠</span>
            <span>{errorMessage}</span>
          </div>
        ) : livePreview && livePreview !== result ? (
          <div className="text-slate-500 text-xs font-mono flex items-center gap-1 mb-0.5">
            <CornerDownLeft className="w-3 h-3 text-slate-600" />
            <span>≈ {livePreview}</span>
          </div>
        ) : null}

        <div className="w-full flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pt-1">
          {/* Step-by-Step Procedure Trigger Button */}
          {hasProcedure && onOpenStepByStep && !isError ? (
            <button
              id="view-step-by-step-btn"
              onClick={onOpenStepByStep}
              title="Ver el procedimiento matemático paso a paso"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-all shadow-xs shrink-0 cursor-pointer animate-in fade-in"
            >
              <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Pasos</span>
            </button>
          ) : (
            <div />
          )}

          <span
            id="calculator-result-text"
            className={`font-mono text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight select-all ${
              isError
                ? 'text-rose-400'
                : 'text-slate-50 drop-shadow-[0_0_12px_rgba(56,189,248,0.15)]'
            }`}
          >
            {result || '0'}
          </span>
        </div>
      </div>
    </div>
  );
};
