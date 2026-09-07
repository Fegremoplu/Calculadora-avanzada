import React, { useState } from 'react';
import {
  ListOrdered,
  X,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { StepProcedure, StepCategory } from '../types';

interface StepByStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure: StepProcedure | null;
}

const CATEGORY_COLORS: Record<StepCategory, { bg: string; text: string; border: string }> = {
  parenthesis: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  constant: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  function: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  trigonometry: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  power: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  percentage: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  multiplication: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  division: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
  addition: { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  subtraction: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  fraction: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30' },
  general: { bg: 'bg-slate-700/30', text: 'text-slate-300', border: 'border-slate-600/40' },
};

export const StepByStepModal: React.FC<StepByStepModalProps> = ({
  isOpen,
  onClose,
  procedure,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !procedure) return null;

  const handleCopyProcedure = () => {
    let text = `Ejercicio: ${procedure.originalExpression}\n`;
    text += `Modo de ángulo: ${procedure.angleUnit}\n\n`;
    text += `--- PROCEDIMIENTO PASO A PASO ---\n`;
    procedure.steps.forEach((s) => {
      text += `\nPaso ${s.stepNumber}: ${s.title}\n`;
      if (s.subExpression) text += `• Operación: ${s.subExpression}\n`;
      text += `• Transformación: ${s.before}  ⟶  ${s.after}\n`;
      text += `• Explicación: ${s.explanation}\n`;
    });
    text += `\nResultado final: ${procedure.finalResult}`;
    if (procedure.fractionForm) {
      text += ` (${procedure.fractionForm})`;
    }
    text += `\n\nReglas aplicadas: ${procedure.rulesSummary.join(', ')}\n`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Procedimiento Paso a Paso</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {procedure.steps.length} {procedure.steps.length === 1 ? 'paso' : 'pasos'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Desglose analítico y jerarquía de operaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyProcedure}
              title="Copiar procedimiento completo al portapapeles"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/80 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Copiar pasos</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exercise Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Ejercicio a resolver ({procedure.angleUnit})
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-slate-100 mt-0.5 select-all">
              {procedure.originalExpression}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-slate-400 font-mono">=</span>
            <div className="px-3 py-1 bg-cyan-950/60 border border-cyan-500/50 rounded-xl text-cyan-300 font-mono font-bold text-base select-all shadow-sm">
              {procedure.finalResult}
            </div>
            {procedure.fractionForm && (
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                ({procedure.fractionForm})
              </span>
            )}
          </div>
        </div>

        {/* Steps List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {procedure.steps.map((step, idx) => {
              const catStyle = CATEGORY_COLORS[step.category] || CATEGORY_COLORS.general;
              const isLast = idx === procedure.steps.length - 1;

              return (
                <div key={step.stepNumber} className="relative group">
                  {/* Step Number Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-colors shadow-sm ${
                      isLast
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-cyan-500/50 text-cyan-300 group-hover:border-cyan-400'
                    }`}
                  >
                    {isLast ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNumber}
                  </div>

                  {/* Step Card */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      isLast
                        ? 'bg-gradient-to-r from-slate-900 to-emerald-950/20 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    {/* Step Title and Category */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                        <span>{step.title}</span>
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {step.category}
                      </span>
                    </div>

                    {/* Before & After Transformation */}
                    {step.before !== step.after && (
                      <div className="my-2.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 font-mono text-xs flex flex-wrap items-center gap-2">
                        <span className="text-slate-400 truncate max-w-[45%]">{step.before}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-cyan-300 font-bold truncate max-w-[45%]">
                          {step.after}
                        </span>
                      </div>
                    )}

                    {/* Explanation */}
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules Summary Card */}
          {procedure.rulesSummary.length > 0 && (
            <div className="mt-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Propiedades Matemáticas y Reglas Aplicadas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {procedure.rulesSummary.map((rule, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    ✓ {rule}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <button
            onClick={handleCopyProcedure}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copiar para tarea o apuntes</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
