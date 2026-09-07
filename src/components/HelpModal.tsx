import React from 'react';
import { X, Keyboard, BookOpen, Lightbulb, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-slate-100 text-base">
              Guía y Manual de la Calculadora Científica
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Atajos de teclado */}
          <section className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-2">
              <Keyboard className="w-4 h-4" />
              <span>Atajos de Teclado Físico</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div><strong className="text-slate-100">0 - 9</strong> : Dígitos</div>
              <div><strong className="text-slate-100">+ - * /</strong> : Operadores</div>
              <div><strong className="text-slate-100">^</strong> : Potencia xʸ</div>
              <div><strong className="text-slate-100">Enter / =</strong> : Calcular</div>
              <div><strong className="text-slate-100">Backspace</strong> : Borrar carácter</div>
              <div><strong className="text-slate-100">Escape</strong> : Borrar todo (AC)</div>
              <div><strong className="text-slate-100">p</strong> : Constante π</div>
              <div><strong className="text-slate-100">e</strong> : Constante de Euler</div>
              <div><strong className="text-slate-100">( )</strong> : Paréntesis</div>
            </div>
          </section>

          {/* Modos de Ángulo y Funciones Trigonométricas */}
          <section className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Unidades de Ángulo y Segunda Función (2nd / HYP)</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>
                <strong className="text-slate-200">DEG (Grados sexagesimales):</strong> 360° por círculo completo.
              </li>
              <li>
                <strong className="text-slate-200">RAD (Radianes):</strong> 2π por círculo. Modo estándar para cálculo diferencial e integral.
              </li>
              <li>
                <strong className="text-slate-200">GRAD (Gradianes o centesimales):</strong> 400 por vuelta completa.
              </li>
              <li>
                <strong className="text-slate-200">Tecla 2nd:</strong> Alterna funciones directas e inversas (<code className="text-cyan-300">sin → sin⁻¹/asin</code>, <code className="text-cyan-300">ln → eˣ</code>, <code className="text-cyan-300">x² → ∛x</code>, <code className="text-cyan-300">nPr → nCr</code>).
              </li>
              <li>
                <strong className="text-slate-200">Tecla HYP:</strong> Habilita funciones hiperbólicas (<code className="text-cyan-300">sinh, cosh, tanh, asinh, acosh, atanh</code>).
              </li>
            </ul>
          </section>

          {/* Formatos de Salida */}
          <section className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Formatos de Resultado</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Haz clic en el botón <strong className="text-cyan-400">FORMATO (STD / SCI / FRAC)</strong> en la esquina superior derecha de la pantalla:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-cyan-400 font-bold">STD (Estándar)</div>
                <div className="text-slate-400">0.75 o 1500000</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-cyan-400 font-bold">SCI (Científico)</div>
                <div className="text-slate-400">1.500000 × 10^6</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-cyan-400 font-bold">FRAC (Fracción)</div>
                <div className="text-slate-400">3/4</div>
              </div>
            </div>
          </section>

          {/* Graficador y Cálculo */}
          <section className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-2">
              <span>Herramientas Avanzadas Integradas</span>
            </div>
            <div className="space-y-2 text-slate-400">
              <p>
                <strong className="text-slate-200">Graficador 2D:</strong> Representa hasta 4 funciones simultáneamente. Arrastra con el ratón para desplazarte, usa la rueda para zoom interactivo o presiona el botón <strong className="text-cyan-400">Raíces</strong> para encontrar puntos de corte en el eje X.
              </p>
              <p>
                <strong className="text-slate-200">Graficador 3D (WebGL):</strong> Trazado tridimensional de superficies analíticas en el espacio <code className="text-cyan-300">z = f(x, y)</code>. Permite rotación orbital 360°, zoom, auto-giro, inspección de puntos $(x, y, z)$ bajo el cursor, 4 paletas térmicas (Cian/Ámbar, Turbo, Viridis, Magma), estilos de render (Malla, Superficie Lisa o Puntos 3D) y exportación a PNG.
              </p>
              <p>
                <strong className="text-slate-200">Cálculo & Álgebra:</strong> Derivadas numéricas instantáneas, integrales definidas por la regla de Simpson, solucionador cuadrático completo (raíces reales y complejas) y método Newton-Raphson.
              </p>
              <p>
                <strong className="text-slate-200">Programador & Conversor:</strong> Conversión simultánea HEX/DEC/OCT/BIN con matriz de bits interactiva y conversor de unidades físicas para ingeniería.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
