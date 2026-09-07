import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-amber-500/50 px-3.5 py-2 text-xs font-medium text-amber-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Modo Offline activo — Toda la funcionalidad científica está disponible sin conexión.</span>
    </div>
  );
};
