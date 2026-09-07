import React, { useState } from 'react';
import {
  computeDerivative,
  computeIntegral,
  solveQuadratic,
  solveNewtonRaphson,
  formatNumber,
} from '../utils/mathEngine';
import { Sigma, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const CalculusSolver: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'derivative' | 'integral' | 'quadratic' | 'newton'>('derivative');

  // Derivative State
  const [derivExpr, setDerivExpr] = useState('x^3 - 2*x + 5');
  const [derivX, setDerivX] = useState('2');
  const [derivResult, setDerivResult] = useState<number | null>(null);
  const [derivError, setDerivError] = useState<string | null>(null);

  // Integral State
  const [intExpr, setIntExpr] = useState('x^2');
  const [intA, setIntA] = useState('0');
  const [intB, setIntB] = useState('3');
  const [intResult, setIntResult] = useState<number | null>(null);
  const [intError, setIntError] = useState<string | null>(null);

  // Quadratic State
  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('-5');
  const [quadC, setQuadC] = useState('6');
  const [quadSolution, setQuadSolution] = useState<ReturnType<typeof solveQuadratic> | null>(null);

  // Newton-Raphson State
  const [newtonExpr, setNewtonExpr] = useState('cos(x) - x');
  const [newtonX0, setNewtonX0] = useState('0.5');
  const [newtonResult, setNewtonResult] = useState<ReturnType<typeof solveNewtonRaphson> | null>(null);

  // Handlers
  const handleComputeDerivative = () => {
    setDerivError(null);
    try {
      const xVal = parseFloat(derivX);
      if (isNaN(xVal)) throw new Error('El valor de x debe ser un número válido');
      const res = computeDerivative(derivExpr, xVal);
      if (isNaN(res)) throw new Error('La función no es diferenciable en este punto');
      setDerivResult(res);
    } catch (err: unknown) {
      setDerivError(err instanceof Error ? err.message : 'Error de cálculo');
      setDerivResult(null);
    }
  };

  const handleComputeIntegral = () => {
    setIntError(null);
    try {
      const a = parseFloat(intA);
      const b = parseFloat(intB);
      if (isNaN(a) || isNaN(b)) throw new Error('Los límites a y b deben ser números');
      const res = computeIntegral(intExpr, a, b);
      if (isNaN(res)) throw new Error('La integral no converge o la función tiene discontinuidades en el intervalo');
      setIntResult(res);
    } catch (err: unknown) {
      setIntError(err instanceof Error ? err.message : 'Error al integrar');
      setIntResult(null);
    }
  };

  const handleSolveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return;
    const sol = solveQuadratic(a, b, c);
    setQuadSolution(sol);
  };

  const handleSolveNewton = () => {
    const x0 = parseFloat(newtonX0);
    if (isNaN(x0)) return;
    const res = solveNewtonRaphson(newtonExpr, x0);
    setNewtonResult(res);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('derivative')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSubTab === 'derivative'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          d/dx Derivada en un Punto
        </button>
        <button
          onClick={() => setActiveSubTab('integral')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSubTab === 'integral'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ∫ Integral Definida
        </button>
        <button
          onClick={() => setActiveSubTab('quadratic')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSubTab === 'quadratic'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ax² + bx + c = 0 Ecuación Cuadrática
        </button>
        <button
          onClick={() => setActiveSubTab('newton')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeSubTab === 'newton'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          f(x) = 0 Raíces (Newton-Raphson)
        </button>
      </div>

      {/* Main calculation card */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl">
        {/* DERIVATIVE MODULE */}
        {activeSubTab === 'derivative' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Derivada Numérica en un Punto: f&apos;(x₀)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calcula la tasa de cambio instantánea y la pendiente de la recta tangente evaluada en x = x₀.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Función f(x):
                </label>
                <input
                  type="text"
                  value={derivExpr}
                  onChange={e => setDerivExpr(e.target.value)}
                  placeholder="e.g. x^3 - 2*x + 5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Evaluar en x₀ =
                </label>
                <input
                  type="text"
                  value={derivX}
                  onChange={e => setDerivX(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleComputeDerivative}
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>Calcular Derivada</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {derivError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{derivError}</span>
              </div>
            )}

            {derivResult !== null && !derivError && (
              <div className="mt-2 p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-2">
                <div className="text-xs text-slate-400 font-mono">
                  d/dx [{derivExpr}] en x = {derivX}:
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">
                  {formatNumber(derivResult, 'standard')}
                </div>
                <div className="text-xs text-slate-400">
                  Pendiente de la recta tangente m = {derivResult.toFixed(4)}.
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTEGRAL MODULE */}
        {activeSubTab === 'integral' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Integral Definida Numérica: ∫ₐᵇ f(x) dx</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calcula el área neta acumulada bajo la curva entre los límites a y b usando la regla compuesta de Simpson.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Integrando f(x):
                </label>
                <input
                  type="text"
                  value={intExpr}
                  onChange={e => setIntExpr(e.target.value)}
                  placeholder="e.g. x^2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Límite inferior (a):
                </label>
                <input
                  type="text"
                  value={intA}
                  onChange={e => setIntA(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Límite superior (b):
                </label>
                <input
                  type="text"
                  value={intB}
                  onChange={e => setIntB(e.target.value)}
                  placeholder="3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleComputeIntegral}
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>Calcular Integral</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {intError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{intError}</span>
              </div>
            )}

            {intResult !== null && !intError && (
              <div className="mt-2 p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-2">
                <div className="text-xs text-slate-400 font-mono">
                  ∫({intA} a {intB}) [{intExpr}] dx:
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">
                  {formatNumber(intResult, 'standard')}
                </div>
                <div className="text-xs text-slate-400">
                  Área estimada con tolerancia de 1000 subintervalos.
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUADRATIC MODULE */}
        {activeSubTab === 'quadratic' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Solucionador de Ecuación Cuadrática: ax² + bx + c = 0</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Encuentra las raíces exactas y el discriminante Δ, admitiendo soluciones tanto reales como complejas conjugadas.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Coeficiente a:</label>
                <input
                  type="number"
                  value={quadA}
                  onChange={e => setQuadA(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Coeficiente b:</label>
                <input
                  type="number"
                  value={quadB}
                  onChange={e => setQuadB(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Coeficiente c:</label>
                <input
                  type="number"
                  value={quadC}
                  onChange={e => setQuadC(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleSolveQuadratic}
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>Resolver Ecuación</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {quadSolution && (
              <div className="mt-2 p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-3">
                <div className="text-xs text-slate-400">{quadSolution.explanation}</div>

                <div className="flex flex-wrap gap-4 items-center">
                  {quadSolution.roots.map((root, i) => (
                    <div
                      key={i}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-2"
                    >
                      <span className="text-xs font-mono text-slate-400">x_{i + 1} =</span>
                      <span className="text-lg font-mono font-bold text-cyan-400">{root}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-mono text-slate-500">
                  Discriminante Δ = b² - 4ac = {quadSolution.discriminant.toFixed(4)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEWTON-RAPHSON MODULE */}
        {activeSubTab === 'newton' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Método de Newton-Raphson: f(x) = 0</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aproximación iterativa de raíces para ecuaciones trascendentes y no lineales generales: xₙ₊₁ = xₙ - f(xₙ)/f&apos;(xₙ).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Ecuación f(x) = 0:
                </label>
                <input
                  type="text"
                  value={newtonExpr}
                  onChange={e => setNewtonExpr(e.target.value)}
                  placeholder="e.g. cos(x) - x"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Semilla inicial x₀:
                </label>
                <input
                  type="text"
                  value={newtonX0}
                  onChange={e => setNewtonX0(e.target.value)}
                  placeholder="0.5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleSolveNewton}
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>Iterar y Encontrar Raíz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {newtonResult && (
              <div className="mt-2 p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-2">
                {newtonResult.converged && newtonResult.root !== null ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Convergencia alcanzada en {newtonResult.iterations} iteraciones</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">
                      x ≈ {newtonResult.root.toFixed(8)}
                    </div>
                  </>
                ) : (
                  <div className="text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{newtonResult.error || 'No converge con la semilla dada'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
