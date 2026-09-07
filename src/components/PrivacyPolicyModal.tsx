import React, { useState } from 'react';
import { ShieldCheck, X, Copy, Check, ExternalLink, Mail, Lock } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    const origin = window.location.origin;
    const privacyUrl = `${origin}/privacy.html`;
    navigator.clipboard.writeText(privacyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      prompt('Copia esta URL para Google Play Console:', privacyUrl);
    });
  };

  const directUrl = `${window.location.origin}/privacy.html`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Política de Privacidad Oficial</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Play Ready
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Cumplimiento de las políticas para desarrolladores de Google Play
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Copy Link Banner for Google Play Console */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-cyan-300">
              Enlace público para Google Play Console
            </span>
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
              {directUrl}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyUrl}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-950" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Abrir en pestaña independiente"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Policy Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Summary Box */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-slate-300">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100">Garantía de No Invasión:</strong> Esta aplicación es una herramienta de cálculo científico y matemática. Nunca solicitamos permisos para acceder a tus correos de Gmail, Google Drive, contactos, fotos, cámara, ubicación ni contraseñas.
            </div>
          </div>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              1. Responsable y Contacto
            </h3>
            <p className="text-slate-400">
              Aplicación: <strong>Calculadora Científica Avanzada & Trazador 3D WebGL</strong>.
              <br />
              Correo de contacto oficial para soporte y privacidad: <strong className="text-slate-200">itzelvalentina260@gmail.com</strong>
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              2. Datos que Recopilamos
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">Identificador Básico (Opcional):</strong> Si decides iniciar sesión con Google, se recibe nombre, correo y avatar público vía Firebase Auth exclusivamente para asociar tu historial personal.
              </li>
              <li>
                <strong className="text-slate-200">Historial y Preferencias:</strong> Operaciones matemáticas calculadas, fórmulas guardadas y modos de visualización (DEG/RAD, formato de números).
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              3. Datos que NUNCA Recopilamos
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>No recopilamos ubicación física por GPS o red celular.</li>
              <li>No accedemos a la libreta de contactos ni mensajes.</li>
              <li>No leemos archivos personales de Google Drive ni fotos.</li>
              <li>No recopilamos información bancaria ni cobros directos sin pasarela oficial.</li>
              <li>No vendemos ni comercializamos tus datos con redes publicitarias externas.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              4. Infraestructura y Seguridad (Google Firebase)
            </h3>
            <p className="text-slate-400">
              Los datos en la nube se alojan en <strong>Google Cloud Firestore</strong> bajo cifrado TLS/HTTPS en tránsito y en reposo. Las reglas de seguridad impiden que ningún otro usuario tenga acceso a tus cálculos matemáticos (<code className="text-cyan-400 font-mono text-[10px]">request.auth.uid == userId</code>).
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              5. Eliminación de Datos y Cuenta (Google Play Data Deletion)
            </h3>
            <p className="text-slate-400">
              En cualquier momento puedes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                Presionar <strong>"Borrar datos"</strong> dentro del menú de cuenta en la app para eliminar de manera inmediata e irreversible todos tus documentos de Firestore.
              </li>
              <li>
                Solicitar el borrado de tu cuenta enviando un correo a <strong className="text-slate-200">itzelvalentina260@gmail.com</strong> (procesado en un máximo de 48 horas).
              </li>
              <li>
                Exportar una copia de tus cálculos en formato JSON con el botón <strong>"Descargar mis datos"</strong>.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              6. Privacidad de Menores y Modo Offline
            </h3>
            <p className="text-slate-400">
              La app no recopila datos deliberadamente de menores sin supervisión de sus padres. Además, toda la calculadora funciona al 100% sin conexión a internet y sin necesidad de registrarse.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>itzelvalentina260@gmail.com</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
