import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Cloud,
  CheckCircle2,
  LogOut,
  Download,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  EyeOff,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  logoutUser,
  deleteUserAccountAndCloudData,
  loadHistoryFromCloud,
} from '../lib/firebase';

interface CloudSyncStatusProps {
  user: User | null;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const CloudSyncStatus: React.FC<CloudSyncStatusProps> = ({
  user,
  onSyncNow,
  isSyncing,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isAnonymous = user?.isAnonymous ?? true;

  const handleGoogleLogin = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setAuthError(res.error);
      } else {
        onSyncNow();
      }
    } catch (err) {
      setAuthError('Ocurrió un error inesperado al conectar con Google.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      await logoutUser();
      onSyncNow();
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleExportData = async () => {
    try {
      const history = await loadHistoryFromCloud();
      const exportBlob = new Blob(
        [
          JSON.stringify(
            {
              exportDate: new Date().toISOString(),
              userEmail: user?.email || 'anonimo',
              history,
            },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calculadora-datos-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteUserAccountAndCloudData();
      if (success) {
        setShowConfirmDelete(false);
        setIsOpen(false);
        onSyncNow();
      } else {
        setAuthError('No se pudieron eliminar todos los datos. Intenta nuevamente.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Cloud & Google Account Button in Header */}
      <button
        id="cloud-sync-btn"
        onClick={() => setIsOpen(true)}
        title={
          user && !isAnonymous
            ? `Conectado con Google: ${user.email} (Privacidad Activa)`
            : 'Acceder con Google o gestionar sincronización segura'
        }
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          user && !isAnonymous
            ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/40 hover:bg-cyan-900/50'
            : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-800 hover:border-cyan-500/40'
        }`}
      >
        {user && !isAnonymous && user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Usuario'}
            className="w-4 h-4 rounded-full border border-cyan-400"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="relative flex items-center justify-center">
            <Cloud className={`w-3.5 h-3.5 ${user ? 'text-cyan-400' : 'text-slate-500'}`} />
            {user && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
        )}

        <span className="text-[11px] font-medium hidden sm:inline">
          {user && !isAnonymous
            ? user.displayName?.split(' ')[0] || 'Mi Cuenta'
            : 'Acceder con Google'}
        </span>
      </button>

      {/* Cloud & Privacy Management Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <span>Acceso Google & Privacidad</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Protegido
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Sincronización en la nube con aislamiento estricto de datos
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowConfirmDelete(false);
                  setAuthError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex flex-col gap-3 text-xs text-slate-300">
              {/* Error Banner */}
              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* User Account State Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user && !isAnonymous && user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuario'}
                      className="w-10 h-10 rounded-full border border-cyan-500/50 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{isAnonymous ? 'Sesión Local Anónima' : user?.displayName || 'Usuario Google'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                      {isAnonymous ? 'Sin vincular a Google' : user?.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  title="Sincronizar historial con Firestore"
                  className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              </div>

              {/* Login with Google Action (if anonymous) */}
              {isAnonymous ? (
                <div className="flex flex-col gap-2 p-3 bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 rounded-xl">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Inicia sesión con tu cuenta de Google para respaldar tus cálculos y acceder a tus funciones y gráficas desde cualquier teléfono o computadora:
                  </p>

                  <button
                    id="google-signin-btn"
                    onClick={handleGoogleLogin}
                    disabled={isLoadingAuth}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {/* Official Google G SVG */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isLoadingAuth ? 'Conectando con Google...' : 'Continuar con Google'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-300">
                    Sesión activa como <strong className="text-cyan-400">{user.email}</strong>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoadingAuth}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}

              {/* Transparency & Privacy Guarantees */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Garantía de Privacidad y Cero Invasión</span>
                </div>

                <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-200">Permisos Mínimos Estrictos:</strong> Solo solicitamos tu identificador de perfil básico (nombre y correo). <span className="text-cyan-300">Nunca</span> pedimos ni tenemos acceso a tus correos de Gmail, Google Drive, Contactos, Fotos ni Contraseñas.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-200">Aislamiento Criptográfico:</strong> Tus cálculos se almacenan en una partición protegida en Firestore donde solo tu usuario autenticado tiene permiso de lectura y escritura (<code className="text-cyan-400 text-[10px]">auth.uid == userId</code>).
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-200">Sin Publicidad ni Venta de Datos:</strong> Tus operaciones matemáticas no son compartidas con terceras empresas ni se rastrean con fines publicitarios.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <EyeOff className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-200">Uso Opcional:</strong> Si no deseas usar Google, puedes continuar calculando de manera anónima y 100% desconectada de la red.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Data Portability & GDPR Right to be Forgotten */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-slate-300">
                  Control de Datos Personales (GDPR)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportData}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700/80 rounded-lg text-[11px] transition-colors"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Descargar mis datos (JSON)</span>
                  </button>

                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>Borrar datos</span>
                  </button>
                </div>

                {/* Confirm Delete prompt */}
                {showConfirmDelete && (
                  <div className="mt-2 p-2.5 bg-rose-950/70 border border-rose-800 rounded-lg flex flex-col gap-2 animate-in fade-in duration-100">
                    <p className="text-[10px] text-rose-200">
                      ¿Seguro que deseas eliminar definitivamente todo tu historial y datos de la nube? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowConfirmDelete(false)}
                        className="px-2 py-1 text-[10px] bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="px-2.5 py-1 text-[10px] bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded transition-colors"
                      >
                        {isDeleting ? 'Borrando...' : 'Sí, borrar todo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 text-[11px] text-slate-400">
              <a
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:underline"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Política de Privacidad Oficial</span>
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowConfirmDelete(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
