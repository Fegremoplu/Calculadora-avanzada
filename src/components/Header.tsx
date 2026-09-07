import React from 'react';
import {
  Calculator,
  LineChart,
  Box,
  Binary,
  Scale,
  History,
  Volume2,
  VolumeX,
  Sigma,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { CalculatorTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { CloudSyncStatus } from './CloudSyncStatus';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: CalculatorTab;
  onTabChange: (tab: CalculatorTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  onOpenHelp: () => void;
  user: User | null;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  onToggleHistory,
  historyCount,
  onOpenHelp,
  user,
  onSyncNow,
  isSyncing,
}) => {
  const tabs = [
    { id: 'scientific' as CalculatorTab, label: 'Científica', icon: Calculator },
    { id: 'grapher' as CalculatorTab, label: 'Gráficos 2D', icon: LineChart },
    { id: 'grapher3d' as CalculatorTab, label: 'Gráficos 3D', icon: Box },
    { id: 'calculus' as CalculatorTab, label: 'Cálculo & Álgebra', icon: Sigma },
    { id: 'programmer' as CalculatorTab, label: 'Programador', icon: Binary },
    { id: 'converter' as CalculatorTab, label: 'Conversor', icon: Scale },
  ];

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 py-2.5 px-4 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold tracking-wide text-slate-100">
                Calculadora Científica Avanzada
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                v2.5 PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Motor de alta precisión, funciones analíticas y graficación
            </p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Utility Controls */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          {/* Firebase Cloud Sync Status */}
          <CloudSyncStatus user={user} onSyncNow={onSyncNow} isSyncing={isSyncing} />

          {/* In-App PWA Install Button */}
          <PWAInstallButton />

          {/* History Button */}
          <button
            id="history-toggle-btn"
            onClick={onToggleHistory}
            title="Historial de cálculos"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Historial</span>
            {historyCount > 0 && (
              <span className="bg-cyan-500/30 text-cyan-300 text-[10px] font-mono px-1 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos de teclas' : 'Activar sonido de teclas'}
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-cyan-400 border-slate-700/60'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Help Modal Toggle */}
          <button
            id="help-toggle-btn"
            onClick={onOpenHelp}
            title="Guía rápida de funciones y atajos"
            className="p-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
