import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Handle Android / Chrome / Edge installation
  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (justInstalled) {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-xl">
        <Check className="w-3.5 h-3.5" />
        <span>¡Instalada con éxito!</span>
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        title="Instalar Calculadora Científica en tu dispositivo para uso offline"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-sm hover:shadow transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Cómo instalar en iPhone o iPad"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-xl transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-100">Instalar en iPhone o iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-100">Paso 1:</strong> Toca el botón de{' '}
                    <strong className="text-cyan-400">Compartir</strong> en la barra inferior de Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-100">Paso 2:</strong> Desplázate hacia abajo y selecciona{' '}
                    <strong className="text-cyan-400">Agregar a inicio</strong> (Add to Home Screen).
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2 text-xs font-semibold text-slate-950 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback if not standalone and prompt not fired yet or on unsupported browser
  return null;
};
