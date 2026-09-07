import React from 'react';
import { Trash2, X, Clock, ArrowUpRight, Copy, Download } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectExpression: (expr: string) => void;
  onSelectResult: (res: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectExpression,
  onSelectResult,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const handleExportHistory = () => {
    if (history.length === 0) return;
    const content = history
      .map(
        h =>
          `[${new Date(h.timestamp).toLocaleString()}] (${h.angleUnit || 'DEG'})\n${h.expression} = ${h.result}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-calculadora-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold text-slate-100 text-sm">Historial de Cálculos</h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <>
                <button
                  id="export-history-btn"
                  onClick={handleExportHistory}
                  title="Exportar historial a archivo .txt"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
                <button
                  id="clear-all-history-btn"
                  onClick={onClearHistory}
                  title="Borrar todo el historial"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Vaciar</span>
                </button>
              </>
            )}
            <button
              id="close-history-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Clock className="w-10 h-10 mb-2 opacity-30 stroke-1" />
              <p className="text-sm font-medium text-slate-400">Sin cálculos registrados</p>
              <p className="text-xs text-slate-500 mt-1">
                Las operaciones que resuelvas aparecerán aquí para reutilizarlas en cualquier momento.
              </p>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className="group bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-cyan-500/80">[{item.angleUnit}]</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>

                {/* Expression */}
                <div
                  onClick={() => onSelectExpression(item.expression)}
                  className="font-mono text-slate-300 text-xs sm:text-sm hover:text-cyan-300 cursor-pointer flex items-center justify-between gap-2 overflow-x-auto scrollbar-none"
                  title="Haga clic para cargar expresión"
                >
                  <span className="truncate">{item.expression}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity shrink-0" />
                </div>

                {/* Result */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span
                    onClick={() => onSelectResult(item.result)}
                    className="font-mono text-base font-bold text-slate-50 hover:text-cyan-400 cursor-pointer"
                    title="Haga clic para insertar resultado"
                  >
                    = {item.result}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.result);
                    }}
                    title="Copiar resultado"
                    className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
