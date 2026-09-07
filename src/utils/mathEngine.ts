import * as math from 'mathjs';
import { AngleUnit, NumberFormat } from '../types';

// Configure a customized mathjs instance
const mathInstance = math.create(math.all, {});

// Helper to convert an angle in current mode to radians
export function toRadians(val: number, unit: AngleUnit): number {
  if (unit === 'DEG') return (val * Math.PI) / 180;
  if (unit === 'GRAD') return (val * Math.PI) / 200;
  return val;
}

// Helper to convert from radians to current angle unit
export function fromRadians(rad: number, unit: AngleUnit): number {
  if (unit === 'DEG') return (rad * 180) / Math.PI;
  if (unit === 'GRAD') return (rad * 200) / Math.PI;
  return rad;
}

// Map custom trigonometric functions that respect the active AngleUnit
export function createScopeWithAngleUnit(unit: AngleUnit): Record<string, unknown> {
  return {
    pi: Math.PI,
    e: Math.E,
    phi: 1.618033988749895, // Golden ratio
    c: 299792458, // Speed of light m/s
    h: 6.62607015e-34, // Planck constant J*s
    g: 9.80665, // Standard gravity m/s^2
    
    // Trigonometry
    sin: (x: number) => Math.sin(toRadians(x, unit)),
    cos: (x: number) => Math.cos(toRadians(x, unit)),
    tan: (x: number) => {
      const rad = toRadians(x, unit);
      // Check for vertical asymptotes: pi/2 + k*pi
      const cosVal = Math.cos(rad);
      if (Math.abs(cosVal) < 1e-15) throw new Error('Tangente indefinida (asíntota vertical)');
      return Math.tan(rad);
    },
    sec: (x: number) => 1 / Math.cos(toRadians(x, unit)),
    csc: (x: number) => 1 / Math.sin(toRadians(x, unit)),
    cot: (x: number) => 1 / Math.tan(toRadians(x, unit)),

    // Inverse trigonometry
    asin: (x: number) => fromRadians(Math.asin(x), unit),
    acos: (x: number) => fromRadians(Math.acos(x), unit),
    atan: (x: number) => fromRadians(Math.atan(x), unit),

    // Hyperbolics (hyperbolics are geometric/exponential, always pure real numbers)
    sinh: (x: number) => Math.sinh(x),
    cosh: (x: number) => Math.cosh(x),
    tanh: (x: number) => Math.tanh(x),
    asinh: (x: number) => Math.asinh(x),
    acosh: (x: number) => Math.acosh(x),
    atanh: (x: number) => Math.atanh(x),

    // Factorials & Combinatorics
    nPr: (n: number, r: number) => {
      if (r > n || n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        throw new Error('Permutación inválida (requiere enteros n >= r >= 0)');
      }
      return mathInstance.permutations(n, r);
    },
    nCr: (n: number, r: number) => {
      if (r > n || n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        throw new Error('Combinación inválida (requiere enteros n >= r >= 0)');
      }
      return mathInstance.combinations(n, r);
    },
    
    // Roots
    cbrt: (x: number) => Math.cbrt(x),
    nthRoot: (x: number, n: number) => mathInstance.nthRoot(x, n),

    // Logarithms
    ln: (x: number) => Math.log(x),
    log10: (x: number) => Math.log10(x),
    log2: (x: number) => Math.log2(x),
    logBase: (x: number, b: number) => Math.log(x) / Math.log(b),
  };
}

// Sanitize user visual tokens into parseable mathematical expressions
export function preprocessExpression(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/φ/g, 'phi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/∛\(/g, 'cbrt(')
    .replace(/ln\(/g, 'ln(')
    .replace(/log\(/g, 'log10(')
    .replace(/Ans/g, 'ans')
    .trim();
}

// Primary mathematical evaluation
export function evaluateExpression(
  expression: string, 
  angleUnit: AngleUnit = 'DEG',
  previousAnswer = 0
): { result: number | string; formatted: string; isError: boolean; errorMsg?: string } {
  if (!expression.trim()) {
    return { result: 0, formatted: '0', isError: false };
  }

  try {
    const sanitized = preprocessExpression(expression);
    const scope = {
      ...createScopeWithAngleUnit(angleUnit),
      ans: previousAnswer,
    };

    const compiled = mathInstance.compile(sanitized);
    const evalResult = compiled.evaluate(scope);

    // Format output
    if (typeof evalResult === 'number') {
      if (isNaN(evalResult)) {
        return { result: 'NaN', formatted: 'Indefinido (NaN)', isError: true, errorMsg: 'Resultado no numérico' };
      }
      if (!isFinite(evalResult)) {
        return { result: evalResult > 0 ? 'Infinity' : '-Infinity', formatted: evalResult > 0 ? '+∞ (Infinito)' : '-∞ (Infinito)', isError: false };
      }
      // Round tiny floating precision errors like 1.2246467991473532e-16 for sin(180 deg)
      const cleanNum = Math.abs(evalResult) < 1e-13 ? 0 : evalResult;
      return {
        result: cleanNum,
        formatted: formatNumber(cleanNum, 'standard'),
        isError: false
      };
    } else if (typeof evalResult === 'object' && evalResult !== null) {
      // Complex number or mathjs object
      const str = evalResult.toString();
      return { result: str, formatted: str, isError: false };
    } else if (typeof evalResult === 'boolean') {
      return { result: evalResult ? 1 : 0, formatted: evalResult ? 'Verdadero (True)' : 'Falso (False)', isError: false };
    }

    return { result: String(evalResult), formatted: String(evalResult), isError: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error de sintaxis';
    return {
      result: 'Error',
      formatted: 'Error de sintaxis',
      isError: true,
      errorMsg: msg
    };
  }
}

// Convert decimal to simplified fraction (e.g., 0.75 -> "3/4")
export function toFraction(val: number): string {
  if (!isFinite(val)) return String(val);
  if (Number.isInteger(val)) return String(val);
  
  const precision = 1.0e-7;
  let numerator = 1;
  let h2 = 0;
  let denominator = 0;
  let k2 = 1;
  let b = val;
  
  do {
    const a = Math.floor(b);
    let aux = numerator;
    numerator = a * numerator + h2;
    h2 = aux;
    aux = denominator;
    denominator = a * denominator + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(val - numerator / denominator) > val * precision && denominator < 1000000);
  
  return `${numerator}/${denominator}`;
}

// Formatter for display
export function formatNumber(val: number, format: NumberFormat = 'standard', precision = 10): string {
  if (!isFinite(val)) return val > 0 ? '∞' : '-∞';
  if (isNaN(val)) return 'NaN';

  if (format === 'fraction') {
    return toFraction(val);
  }

  if (format === 'scientific') {
    return val.toExponential(6).replace('e+', ' × 10^').replace('e-', ' × 10^-');
  }

  // Standard formatting
  if (Math.abs(val) > 0 && (Math.abs(val) >= 1e12 || Math.abs(val) <= 1e-7)) {
    return val.toExponential(6).replace('e+', ' × 10^').replace('e-', ' × 10^-');
  }

  // Trim trailing zeros after decimal
  const str = Number(val.toFixed(precision)).toString();
  return str;
}

// Numerical Calculus: Derivative at a point using central difference: f'(x) ≈ (f(x+h) - f(x-h)) / 2h
export function computeDerivative(expr: string, xVal: number, h = 1e-5): number {
  const sanitized = preprocessExpression(expr);
  const compiled = mathInstance.compile(sanitized);
  const scope = createScopeWithAngleUnit('RAD'); // Calculus is defined in Radians

  const yPlus = compiled.evaluate({ ...scope, x: xVal + h });
  const yMinus = compiled.evaluate({ ...scope, x: xVal - h });

  return (yPlus - yMinus) / (2 * h);
}

// Numerical Calculus: Definite Integral using Composite Simpson's 1/3 Rule
export function computeIntegral(expr: string, a: number, b: number, n = 1000): number {
  // Ensure n is even for Simpson's rule
  if (n % 2 !== 0) n += 1;
  const h = (b - a) / n;
  const sanitized = preprocessExpression(expr);
  const compiled = mathInstance.compile(sanitized);
  const scope = createScopeWithAngleUnit('RAD');

  let sum = compiled.evaluate({ ...scope, x: a }) + compiled.evaluate({ ...scope, x: b });

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const y = compiled.evaluate({ ...scope, x });
    if (i % 2 === 0) {
      sum += 2 * y;
    } else {
      sum += 4 * y;
    }
  }

  return (h / 3) * sum;
}

// Solver: Quadratic Equation ax^2 + bx + c = 0
export function solveQuadratic(a: number, b: number, c: number): {
  discriminant: number;
  roots: string[];
  explanation: string;
} {
  if (a === 0) {
    if (b === 0) {
      return {
        discriminant: 0,
        roots: [],
        explanation: c === 0 ? 'Infinitas soluciones (0 = 0)' : 'Sin solución (contradicción: c ≠ 0)'
      };
    }
    const linearRoot = -c / b;
    return {
      discriminant: 0,
      roots: [formatNumber(linearRoot, 'standard')],
      explanation: `Es una ecuación lineal: x = -c/b = ${formatNumber(linearRoot, 'standard')}`
    };
  }

  const d = b * b - 4 * a * c;
  if (d > 0) {
    const r1 = (-b + Math.sqrt(d)) / (2 * a);
    const r2 = (-b - Math.sqrt(d)) / (2 * a);
    return {
      discriminant: d,
      roots: [formatNumber(r1, 'standard'), formatNumber(r2, 'standard')],
      explanation: `Discriminante Δ = ${d.toFixed(4)} > 0. Dos raíces reales distintas.`
    };
  } else if (d === 0) {
    const r = -b / (2 * a);
    return {
      discriminant: 0,
      roots: [formatNumber(r, 'standard')],
      explanation: 'Discriminante Δ = 0. Raíz real doble (multiplicidad 2).'
    };
  } else {
    const realPart = (-b / (2 * a)).toFixed(4);
    const imagPart = (Math.sqrt(-d) / (2 * a)).toFixed(4);
    return {
      discriminant: d,
      roots: [
        `${realPart} + ${imagPart}i`,
        `${realPart} - ${imagPart}i`
      ],
      explanation: `Discriminante Δ = ${d.toFixed(4)} < 0. Dos raíces complejas conjugadas.`
    };
  }
}

// Detailed Newton Iteration step
export interface NewtonIterationStep {
  iteration: number;
  x_n: number;
  fx: number;
  dfx: number;
  deltaX: number;
  x_next: number;
  error: number;
}

// Solver: Newton-Raphson method for root of f(x) = 0 starting from x0
export function solveNewtonRaphson(
  expr: string, 
  initialGuess: number, 
  maxIterations = 20, 
  tolerance = 1e-7
): { root: number | null; iterations: number; converged: boolean; error?: string; steps: NewtonIterationStep[] } {
  const sanitized = preprocessExpression(expr);
  let x = initialGuess;
  const scope = createScopeWithAngleUnit('RAD');
  const steps: NewtonIterationStep[] = [];
  
  try {
    const compiled = mathInstance.compile(sanitized);

    for (let i = 0; i < maxIterations; i++) {
      const fx = compiled.evaluate({ ...scope, x });
      const dfx = computeDerivative(expr, x);

      if (Math.abs(dfx) < 1e-12) {
        return { 
          root: null, 
          iterations: i, 
          converged: false, 
          error: 'Derivada cercana a cero (la pendiente de la recta tangente se anula en este punto).',
          steps 
        };
      }

      const deltaX = fx / dfx;
      const nextX = x - deltaX;
      const err = Math.abs(nextX - x);

      steps.push({
        iteration: i + 1,
        x_n: x,
        fx,
        dfx,
        deltaX,
        x_next: nextX,
        error: err,
      });

      if (Math.abs(fx) < tolerance || err < tolerance) {
        return { root: nextX, iterations: i + 1, converged: true, steps };
      }

      x = nextX;
    }

    return { 
      root: x, 
      iterations: maxIterations, 
      converged: false, 
      error: 'Se alcanzó el límite de iteraciones sin alcanzar la tolerancia requerida.',
      steps 
    };
  } catch (err: unknown) {
    return { 
      root: null, 
      iterations: 0, 
      converged: false, 
      error: err instanceof Error ? err.message : 'Error al evaluar la función',
      steps 
    };
  }
}

// Symbolic derivative helper using mathjs
export function computeSymbolicDerivative(expr: string, variable = 'x'): string {
  try {
    const sanitized = preprocessExpression(expr);
    const node = mathInstance.parse(sanitized);
    const d = mathInstance.derivative(node, variable);
    return mathInstance.simplify(d).toString();
  } catch {
    return '';
  }
}

// Algebraic simplify helper using mathjs
export function simplifyAlgebraic(expr: string): string {
  try {
    const sanitized = preprocessExpression(expr);
    const node = mathInstance.parse(sanitized);
    return mathInstance.simplify(node).toString();
  } catch {
    return expr;
  }
}
