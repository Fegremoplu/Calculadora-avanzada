import React, { useState } from 'react';
import {
  computeDerivative,
  computeIntegral,
  solveQuadratic,
  solveNewtonRaphson,
  formatNumber,
  computeSymbolicDerivative,
  simplifyAlgebraic,
} from '../utils/mathEngine';
import {
  Sigma,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ListOrdered,
  Copy,
  Check,
  Sparkles,
  FunctionSquare,
} from 'lucide-react';

type SubTab = 'derivative' | 'integral' | 'quadratic' | 'newton' | 'algebra';

export const CalculusSolver: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('derivative');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Derivative State
  const [derivExpr, setDerivExpr] = useState('x^3 - 2*x + 5');
  const [derivX, setDerivX] = useState('2');
  const [derivResult, setDerivResult] = useState<number | null>(null);
  const [symbolicDeriv, setSymbolicDeriv] = useState<string>('');
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

  // Algebra State
  const [algebraExpr, setAlgebraExpr] = useState('(x + 2) * (x - 3)');
  const [algebraResult, setAlgebraResult] = useState<string | null>(null);
  const [algebraError, setAlgebraError] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Derivative Handler
  const handleComputeDerivative = () => {
    setDerivError(null);
    try {
      const xVal = parseFloat(derivX);
      if (isNaN(xVal)) throw new Error('El valor de x debe ser un número válido');
      const numRes = computeDerivative(derivExpr, xVal);
      if (isNaN(numRes)) throw new Error('La función no es diferenciable en este punto');
      const symb = computeSymbolicDerivative(derivExpr, 'x');
      setDerivResult(numRes);
      setSymbolicDeriv(symb);
    } catch (err: unknown) {
      setDerivError(err instanceof Error ? err.message : 'Error de cálculo');
      setDerivResult(null);
      setSymbolicDeriv('');
    }
  };

  // Integral Handler
  const handleComputeIntegral = () => {
    setIntError(null);
    try {
      const a = parseFloat(intA);
      const b = parseFloat(intB);
      if (isNaN(a) || isNaN(b)) throw new Error('Los límites a y b deben ser números válidos');
      const res = computeIntegral(intExpr, a, b);
      if (isNaN(res)) throw new Error('La integral no converge en el intervalo especificado');
      setIntResult(res);
    } catch (err: unknown) {
      setIntError(err instanceof Error ? err.message : 'Error al integrar');
      setIntResult(null);
    }
  };

  // Quadratic Handler
  const handleSolveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return;
    const sol = solveQuadratic(a, b, c);
    setQuadSolution(sol);
  };

  // Newton-Raphson Handler
  const handleSolveNewton = () => {
    const x0 = parseFloat(newtonX0);
    if (isNaN(x0)) return;
    const res = solveNewtonRaphson(newtonExpr, x0);
    setNewtonResult(res);
  };

  // Algebra Handler
  const handleSolveAlgebra = () => {
    setAlgebraError(null);
    try {
      if (!algebraExpr.trim()) throw new Error('Introduce una expresión algebraica');
      const simplified = simplifyAlgebraic(algebraExpr);
      setAlgebraResult(simplified);
    } catch (err: unknown) {
      setAlgebraError(err instanceof Error ? err.message : 'Error al simplificar');
      setAlgebraResult(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('derivative')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'derivative'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>d/dx Derivadas</span>
        </button>
        <button
          onClick={() => setActiveSubTab('integral')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'integral'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>∫ Integrales</span>
        </button>
        <button
          onClick={() => setActiveSubTab('quadratic')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'quadratic'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>ax² + bx + c = 0 Cuadrática</span>
        </button>
        <button
          onClick={() => setActiveSubTab('algebra')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'algebra'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Álgebra & Polinomios</span>
        </button>
        <button
          onClick={() => setActiveSubTab('newton')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'newton'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Newton-Raphson</span>
        </button>
      </div>

      {/* Main calculation card */}
      <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col gap-4">
        {/* ===================== 1. DERIVATIVE MODULE ===================== */}
        {activeSubTab === 'derivative' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Derivada Simbólica y Numérica en un Punto</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calcula la función derivada analítica f&apos;(x), la pendiente en x₀ y la recta tangente con procedimiento paso a paso.
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
                  placeholder="2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleComputeDerivative}
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Calcular Derivada con Procedimiento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {derivError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{derivError}</span>
              </div>
            )}

            {derivResult !== null && !derivError && (
              <div className="mt-2 flex flex-col gap-4">
                {/* Result Highlights */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      Derivada Analítica f&apos;(x):
                    </span>
                    <div className="font-mono text-lg font-bold text-cyan-400 mt-0.5">
                      f&apos;(x) = {symbolicDeriv || 'Obtenida numéricamente'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      Pendiente en x = {derivX}:
                    </span>
                    <div className="font-mono text-lg font-bold text-emerald-400 mt-0.5">
                      m = f&apos;({derivX}) = {formatNumber(derivResult, 'standard')}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Procedure */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <ListOrdered className="w-4 h-4 text-cyan-400" />
                      <span>Procedimiento Paso a Paso: Derivación</span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          `Procedimiento Derivada:\nFunción: f(x) = ${derivExpr}\nPunto x0: ${derivX}\nDerivada f'(x) = ${symbolicDeriv}\nPendiente m = ${derivResult}`,
                          'deriv'
                        )
                      }
                      className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedText === 'deriv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'deriv' ? 'Copiado' : 'Copiar pasos'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 1: Identificación de la función</span>
                      <p className="mt-1 font-mono text-slate-300">f(x) = {derivExpr}</p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Se define la variable independiente x y el punto de evaluación x₀ = {derivX}.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 2: Aplicación de reglas de diferenciación</span>
                      <p className="mt-1 font-mono text-slate-200">
                        d/dx [{derivExpr}] = {symbolicDeriv || derivResult.toFixed(4)}
                      </p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Se aplican la regla de la potencia (d/dx xⁿ = n·xⁿ⁻¹), linealidad de la suma/resta y derivada de constantes (d/dx c = 0).
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 3: Sustitución en el punto x₀ = {derivX}</span>
                      <p className="mt-1 font-mono text-slate-200">
                        f&apos;({derivX}) = {formatNumber(derivResult, 'standard')}
                      </p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Evaluando la función derivada en x = {derivX}, se obtiene la pendiente instantánea m = {derivResult.toFixed(4)}.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 4: Interpretación Geométrica</span>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        La recta tangente a la curva en el punto ({derivX}, f({derivX})) tiene inclinación m = {derivResult.toFixed(4)}. Si m &gt; 0 la función es creciente en ese punto; si m &lt; 0 es decreciente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== 2. INTEGRAL MODULE ===================== */}
        {activeSubTab === 'integral' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Integral Definida con Procedimiento: ∫ₐᵇ f(x) dx</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calcula el área neta acumulada bajo la curva entre los límites a y b con desglose numérico paso a paso.
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
                  Límite inferior a:
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
                  Límite superior b:
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
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Calcular Integral con Procedimiento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {intError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{intError}</span>
              </div>
            )}

            {intResult !== null && !intError && (
              <div className="mt-2 flex flex-col gap-4">
                {/* Result Highlight */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      Área Neta Acumulada ∫({intA} a {intB}) [{intExpr}] dx:
                    </span>
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400 mt-1">
                      {formatNumber(intResult, 'standard')}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Procedure */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <ListOrdered className="w-4 h-4 text-cyan-400" />
                      <span>Procedimiento Paso a Paso: Integración</span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          `Procedimiento Integral:\n∫_${intA}^${intB} (${intExpr}) dx = ${intResult}`,
                          'integral'
                        )
                      }
                      className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedText === 'integral' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'integral' ? 'Copiado' : 'Copiar pasos'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 1: Planteamiento de la integral</span>
                      <p className="mt-1 font-mono text-slate-300">
                        I = ∫({intA} → {intB}) [{intExpr}] dx
                      </p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Límite inferior a = {intA}, límite superior b = {intB}. Ancho del intervalo: Δx = {intB} - {intA} = {(parseFloat(intB) - parseFloat(intA)).toFixed(4)}.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 2: Subdivisión para cuadratura de Simpson</span>
                      <p className="mt-1 font-mono text-slate-300">
                        h = (b - a) / N = ({(parseFloat(intB) - parseFloat(intA)).toFixed(4)}) / 1000 = {((parseFloat(intB) - parseFloat(intA)) / 1000).toFixed(6)}
                      </p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Se discretiza el intervalo en N = 1000 subintervalos para garantizar precisión analítica superior a 10⁻⁸.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 3: Evaluación de la Regla Compuesta 1/3 de Simpson</span>
                      <p className="mt-1 font-mono text-slate-200">
                        S = (h/3) · [f(a) + 4·∑ f(x_impar) + 2·∑ f(x_par) + f(b)]
                      </p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Las parábolas interpolares capturan exactamente la curvatura del integrando.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 4: Resultado del Área</span>
                      <p className="mt-1 font-mono text-emerald-300 font-bold text-sm">
                        Área = {formatNumber(intResult, 'standard')} u²
                      </p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Representa el área neta entre la curva y el eje horizontal en el intervalo dado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== 3. QUADRATIC MODULE ===================== */}
        {activeSubTab === 'quadratic' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Ecuación Cuadrática con Procedimiento: ax² + bx + c = 0</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Averigua las raíces exactas con el desglose paso a paso de la fórmula general y el discriminante Δ.
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
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Resolver Ecuación con Procedimiento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {quadSolution && (
              <div className="mt-2 flex flex-col gap-4">
                {/* Roots banner */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    {quadSolution.roots.map((root, i) => (
                      <div
                        key={i}
                        className="bg-slate-950 border border-slate-800 p-2.5 px-4 rounded-xl flex items-center gap-2"
                      >
                        <span className="text-xs font-mono text-slate-400">x_{i + 1} =</span>
                        <span className="text-lg font-mono font-bold text-cyan-400">{root}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {quadSolution.explanation}
                  </div>
                </div>

                {/* Step by Step Breakdown */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <ListOrdered className="w-4 h-4 text-cyan-400" />
                      <span>Procedimiento Paso a Paso: Fórmula General</span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          `Procedimiento Ecuación Cuadrática:\n${quadA}x² + ${quadB}x + ${quadC} = 0\nΔ = ${quadSolution.discriminant}\nRaíces: ${quadSolution.roots.join(', ')}`,
                          'quad'
                        )
                      }
                      className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedText === 'quad' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'quad' ? 'Copiado' : 'Copiar pasos'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 1: Identificación de coeficientes</span>
                      <p className="mt-1 font-mono text-slate-300">
                        a = {quadA}, b = {quadB}, c = {quadC}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 2: Cálculo del Discriminante (Δ)</span>
                      <p className="mt-1 font-mono text-slate-200">
                        Δ = b² - 4ac = ({quadB})² - 4·({quadA})·({quadC})
                      </p>
                      <p className="mt-0.5 font-mono text-cyan-300">
                        Δ = {parseFloat(quadB) ** 2} - ({4 * parseFloat(quadA) * parseFloat(quadC)}) = {quadSolution.discriminant.toFixed(4)}
                      </p>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        {quadSolution.discriminant > 0
                          ? 'Como Δ > 0, la ecuación posee 2 soluciones reales y distintas.'
                          : quadSolution.discriminant === 0
                          ? 'Como Δ = 0, la ecuación posee una raíz real doble.'
                          : 'Como Δ < 0, la raíz de un número negativo produce 2 soluciones complejas conjugadas.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 3: Sustitución en la fórmula general</span>
                      <p className="mt-1 font-mono text-slate-200">
                        x = [-({quadB}) ± √({quadSolution.discriminant.toFixed(2)})] / [2·({quadA})]
                      </p>
                      <p className="mt-0.5 font-mono text-slate-200">
                        x = [{-(parseFloat(quadB))} ± √({quadSolution.discriminant.toFixed(2)})] / [{2 * parseFloat(quadA)}]
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 4: Soluciones finales</span>
                      <div className="mt-1 font-mono text-emerald-300 flex flex-wrap gap-4 font-bold">
                        {quadSolution.roots.map((r, i) => (
                          <span key={i}>x_{i + 1} = {r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== 4. ALGEBRA MODULE ===================== */}
        {activeSubTab === 'algebra' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <FunctionSquare className="w-4 h-4 text-cyan-400" />
                <span>Álgebra, Polinomios y Simplificación con Procedimiento</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Simplifica, expande o factoriza expresiones polinómicas paso a paso aplicando propiedades algebraicas.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Expresión algebraica a simplificar:
              </label>
              <input
                type="text"
                value={algebraExpr}
                onChange={e => setAlgebraExpr(e.target.value)}
                placeholder="e.g. (x + 2) * (x - 3) o 2*x + 5*x - 3"
                className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              onClick={handleSolveAlgebra}
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Simplificar Expresión con Procedimiento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {algebraError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{algebraError}</span>
              </div>
            )}

            {algebraResult !== null && !algebraError && (
              <div className="mt-2 flex flex-col gap-4">
                {/* Result Highlight */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      Expresión Simplificada Canónica:
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 mt-1">
                      {algebraResult}
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <ListOrdered className="w-4 h-4 text-cyan-400" />
                      <span>Procedimiento de Reducción Algebraica</span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          `Procedimiento Algebraico:\nOriginal: ${algebraExpr}\nResultado: ${algebraResult}`,
                          'alg'
                        )
                      }
                      className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedText === 'alg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'alg' ? 'Copiado' : 'Copiar pasos'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 1: Expresión inicial</span>
                      <p className="mt-1 font-mono text-slate-300">{algebraExpr}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 2: Aplicación de la propiedad distributiva y productos</span>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Se multiplican los binomios o factores término a término y se expanden los exponentes.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 3: Agrupación y reducción de términos semejantes</span>
                      <p className="mt-0.5 text-slate-400 text-[11px]">
                        Se suman y restan los coeficientes que comparten la misma potencia de la variable.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Paso 4: Forma canónica final</span>
                      <p className="mt-1 font-mono text-emerald-300 font-bold text-sm">
                        {algebraResult}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== 5. NEWTON-RAPHSON MODULE ===================== */}
        {activeSubTab === 'newton' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sigma className="w-4 h-4 text-cyan-400" />
                <span>Método de Newton-Raphson con Tabla de Iteraciones Paso a Paso</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aproximación iterativa de raíces para ecuaciones no lineales: xₙ₊₁ = xₙ - f(xₙ)/f&apos;(xₙ).
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
              className="self-start px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Iterar y Mostrar Tabla Paso a Paso</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {newtonResult && (
              <div className="mt-2 flex flex-col gap-4">
                {/* Result header */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
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

                {/* Iteration Table */}
                {newtonResult.steps && newtonResult.steps.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                        <ListOrdered className="w-4 h-4 text-cyan-400" />
                        <span>Tabla de Iteraciones Paso a Paso</span>
                      </div>
                      <button
                        onClick={() => {
                          const tableText = newtonResult.steps
                            .map(
                              s =>
                                `Iter ${s.iteration}: x_n=${s.x_n.toFixed(6)}, f(x_n)=${s.fx.toFixed(6)}, f'(x_n)=${s.dfx.toFixed(6)}, x_next=${s.x_next.toFixed(6)}`
                            )
                            .join('\n');
                          handleCopy(tableText, 'newton');
                        }}
                        className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                      >
                        {copiedText === 'newton' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === 'newton' ? 'Copiado' : 'Copiar tabla'}</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] font-mono text-left">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-800">
                            <th className="py-1.5 px-2">n</th>
                            <th className="py-1.5 px-2">xₙ</th>
                            <th className="py-1.5 px-2">f(xₙ)</th>
                            <th className="py-1.5 px-2">f&apos;(xₙ)</th>
                            <th className="py-1.5 px-2">Δx = f/f&apos;</th>
                            <th className="py-1.5 px-2 text-cyan-300">xₙ₊₁</th>
                            <th className="py-1.5 px-2 text-slate-400">Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {newtonResult.steps.map(s => (
                            <tr key={s.iteration} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-1.5 px-2 text-cyan-400 font-bold">{s.iteration}</td>
                              <td className="py-1.5 px-2">{s.x_n.toFixed(6)}</td>
                              <td className="py-1.5 px-2">{s.fx.toExponential(3)}</td>
                              <td className="py-1.5 px-2">{s.dfx.toFixed(6)}</td>
                              <td className="py-1.5 px-2">{s.deltaX.toExponential(3)}</td>
                              <td className="py-1.5 px-2 text-cyan-300 font-bold">{s.x_next.toFixed(6)}</td>
                              <td className="py-1.5 px-2 text-slate-400">{s.error.toExponential(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
