import { AngleUnit, CalculationStep, StepProcedure, StepCategory } from '../types';
import {
  evaluateExpression,
  formatNumber,
  toFraction,
  preprocessExpression,
  toRadians,
} from './mathEngine';

// Helper to round float precision
function roundClean(val: number): number {
  if (Math.abs(val) < 1e-12) return 0;
  return Number(val.toFixed(8));
}

// Format numbers nicely in mathematical steps
function fmt(val: number): string {
  const rounded = roundClean(val);
  return Number(rounded.toFixed(6)).toString();
}

/**
 * Step-by-step solver engine.
 * Takes a mathematical expression and deconstructs it into ordered pedagogical steps
 * following PEMDAS / jerarquía de operaciones.
 */
export function generateStepByStepProcedure(
  rawExpression: string,
  angleUnit: AngleUnit = 'DEG'
): StepProcedure {
  const cleanExpr = rawExpression.trim();

  // If empty or initial
  if (!cleanExpr || cleanExpr === '0') {
    return {
      originalExpression: '0',
      finalResult: '0',
      angleUnit,
      steps: [
        {
          stepNumber: 1,
          title: 'Expresión inicial nula',
          before: '0',
          after: '0',
          explanation: 'No hay ninguna operación que realizar. El valor inicial es 0.',
          category: 'general',
        },
      ],
      rulesSummary: ['Valor constante'],
    };
  }

  // Pre-evaluate full result for verification
  const fullEval = evaluateExpression(cleanExpr, angleUnit);
  const finalResultStr = fullEval.formatted;

  // If direct error
  if (fullEval.isError) {
    return {
      originalExpression: cleanExpr,
      finalResult: 'Error',
      angleUnit,
      steps: [
        {
          stepNumber: 1,
          title: 'Error de sintaxis u operación indefinida',
          before: cleanExpr,
          after: 'Error',
          explanation:
            fullEval.errorMsg ||
            'La expresión no es matemáticamente válida (revisa paréntesis sin cerrar o símbolos consecutivos).',
          category: 'general',
        },
      ],
      rulesSummary: ['Validación matemática'],
    };
  }

  // If already a single plain number
  const numRegex = /^-?\d+(\.\d+)?$/;
  if (numRegex.test(cleanExpr.replace(/\s+/g, ''))) {
    return {
      originalExpression: cleanExpr,
      finalResult: finalResultStr,
      angleUnit,
      steps: [
        {
          stepNumber: 1,
          title: 'Valor constante elemental',
          before: cleanExpr,
          after: finalResultStr,
          explanation: `La expresión introducida ya es un valor numérico directo (${finalResultStr}). No requiere reducciones adicionales.`,
          category: 'general',
        },
      ],
      rulesSummary: ['Identidad numérica directa'],
    };
  }

  const steps: CalculationStep[] = [];
  const rulesSet = new Set<string>();

  let current = preprocessExpression(cleanExpr);
  let stepIndex = 1;
  const maxIterations = 30; // Protect against any infinite cycles

  // Pre-pass: replace standalone percentage like "50 * 15%" -> "50 * (15 / 100)"
  const percentMatch = /(\d+(?:\.\d+)?)%/;
  while (percentMatch.test(current) && stepIndex <= maxIterations) {
    const match = current.match(percentMatch);
    if (!match) break;
    const val = parseFloat(match[1]);
    const decimalVal = val / 100;
    const before = current;
    current = current.replace(match[0], fmt(decimalVal));
    rulesSet.add('Conversión de porcentajes a decimal');
    steps.push({
      stepNumber: stepIndex++,
      title: `Conversión de porcentaje (${match[0]})`,
      subExpression: match[0],
      before,
      after: current,
      explanation: `El símbolo de porcentaje (%) equivale a dividir entre 100: ${match[1]}% = ${match[1]} ÷ 100 = ${fmt(decimalVal)}.`,
      category: 'percentage',
    });
  }

  // Pre-pass: replace constants pi, e, phi
  const piMatch = /\bpi\b/i;
  if (piMatch.test(current) && stepIndex <= maxIterations) {
    const before = current;
    current = current.replace(/\bpi\b/gi, '3.141593');
    rulesSet.add('Sustitución de constantes (π)');
    steps.push({
      stepNumber: stepIndex++,
      title: 'Sustitución de constante π (Pi)',
      subExpression: 'π',
      before,
      after: current,
      explanation: 'Se sustituye el número irracional π por su valor aproximado: π ≈ 3.14159265.',
      category: 'constant',
    });
  }

  const eMatch = /\be\b/i;
  if (eMatch.test(current) && stepIndex <= maxIterations) {
    const before = current;
    current = current.replace(/\be\b/g, '2.718282');
    rulesSet.add('Sustitución de constantes (e)');
    steps.push({
      stepNumber: stepIndex++,
      title: 'Sustitución de constante de Euler e',
      subExpression: 'e',
      before,
      after: current,
      explanation: 'Se sustituye la base de los logaritmos naturales e ≈ 2.7182818.',
      category: 'constant',
    });
  }

  // Primary Reduction Loop
  while (stepIndex <= maxIterations) {
    // Check if current expression is already reduced to a single number
    if (numRegex.test(current.trim())) {
      break;
    }

    let reduced = false;

    // 1. Check for Functions with simple arguments: sin(30), cos(0), sqrt(16), cbrt(8), ln(1), log10(100), abs(-5)
    const funcRegex = /\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|cbrt|ln|log10|abs)\((-?\d+(?:\.\d+)?)\)/;
    const funcMatch = current.match(funcRegex);

    if (funcMatch) {
      const fnName = funcMatch[1];
      const argVal = parseFloat(funcMatch[2]);
      let resVal = 0;
      let explanation = '';
      let cat: StepCategory = 'function';

      switch (fnName) {
        case 'sin': {
          cat = 'trigonometry';
          rulesSet.add('Razones trigonométricas');
          resVal = Math.sin(toRadians(argVal, angleUnit));
          explanation = `Se calcula sin(${argVal}${angleUnit === 'DEG' ? '°' : angleUnit === 'RAD' ? ' rad' : ' grad'}) en modo ${angleUnit}: sin(${argVal}) = ${fmt(resVal)}.`;
          break;
        }
        case 'cos': {
          cat = 'trigonometry';
          rulesSet.add('Razones trigonométricas');
          resVal = Math.cos(toRadians(argVal, angleUnit));
          explanation = `Se calcula cos(${argVal}${angleUnit === 'DEG' ? '°' : angleUnit === 'RAD' ? ' rad' : ' grad'}) en modo ${angleUnit}: cos(${argVal}) = ${fmt(resVal)}.`;
          break;
        }
        case 'tan': {
          cat = 'trigonometry';
          rulesSet.add('Razones trigonométricas');
          resVal = Math.tan(toRadians(argVal, angleUnit));
          explanation = `Se calcula tan(${argVal}${angleUnit === 'DEG' ? '°' : ''}) en modo ${angleUnit}: tan(${argVal}) = ${fmt(resVal)}.`;
          break;
        }
        case 'sqrt': {
          rulesSet.add('Radicación / Raíz cuadrada');
          if (argVal < 0) {
            explanation = `La raíz cuadrada de un número negativo (${argVal}) no tiene solución real; produce un número imaginario.`;
            resVal = Math.sqrt(Math.abs(argVal));
          } else {
            resVal = Math.sqrt(argVal);
            explanation = `Se calcula la raíz cuadrada: √(${argVal}) = ${fmt(resVal)}, ya que (${fmt(resVal)})² = ${argVal}.`;
          }
          break;
        }
        case 'cbrt': {
          rulesSet.add('Raíz cúbica');
          resVal = Math.cbrt(argVal);
          explanation = `Se calcula la raíz cúbica: ∛(${argVal}) = ${fmt(resVal)}.`;
          break;
        }
        case 'ln': {
          rulesSet.add('Logaritmos naturales');
          resVal = Math.log(argVal);
          explanation = `Se calcula el logaritmo natural ln(${argVal}) = ${fmt(resVal)}.`;
          break;
        }
        case 'log10': {
          rulesSet.add('Logaritmos decimales');
          resVal = Math.log10(argVal);
          explanation = `Se calcula el logaritmo en base 10: log₁₀(${argVal}) = ${fmt(resVal)} (porque 10^${fmt(resVal)} = ${argVal}).`;
          break;
        }
        case 'abs': {
          rulesSet.add('Valor absoluto');
          resVal = Math.abs(argVal);
          explanation = `El valor absoluto representa la distancia al cero: |${argVal}| = ${fmt(resVal)}.`;
          break;
        }
        default: {
          resVal = Math.sin(argVal);
          explanation = `Se evalúa la función ${fnName}(${argVal}) = ${fmt(resVal)}.`;
        }
      }

      const before = current;
      const cleanRes = fmt(resVal);
      current = current.replace(funcMatch[0], cleanRes);
      steps.push({
        stepNumber: stepIndex++,
        title: `Evaluar ${fnName}(${argVal})`,
        subExpression: funcMatch[0],
        before,
        after: current,
        explanation,
        category: cat,
      });
      reduced = true;
      continue;
    }

    // 2. Innermost redundant Parenthesis removal: e.g. (42) -> 42
    const singleParenRegex = /\((-?\d+(?:\.\d+)?)\)/;
    const parenMatch = current.match(singleParenRegex);
    if (parenMatch) {
      // Check if preceded by a letter (function) which would be handled above
      const idx = parenMatch.index ?? 0;
      const charBefore = idx > 0 ? current[idx - 1] : '';
      if (!/[a-zA-Z]/.test(charBefore)) {
        const before = current;
        current = current.replace(parenMatch[0], parenMatch[1]);
        rulesSet.add('Simplificación de paréntesis resueltos');
        steps.push({
          stepNumber: stepIndex++,
          title: `Eliminar paréntesis resuelto (${parenMatch[1]})`,
          subExpression: parenMatch[0],
          before,
          after: current,
          explanation: `El contenido dentro del paréntesis se redujo al valor ${parenMatch[1]}, por lo que se retiran los paréntesis.`,
          category: 'parenthesis',
        });
        reduced = true;
        continue;
      }
    }

    // 3. Exponents inside parentheses or outside: e.g. a ^ b
    // Find innermost parenthesis or evaluate direct exponent
    const powRegex = /(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)/;
    const powMatch = current.match(powRegex);
    if (powMatch) {
      const base = parseFloat(powMatch[1]);
      const exp = parseFloat(powMatch[2]);
      const resVal = Math.pow(base, exp);
      const before = current;
      const cleanRes = fmt(resVal);
      current = current.replace(powMatch[0], cleanRes);
      rulesSet.add('Propiedad de potencias y exponentes (Jerarquía PEMDAS)');
      steps.push({
        stepNumber: stepIndex++,
        title: `Calcular potencia: ${powMatch[1]}^${powMatch[2]}`,
        subExpression: powMatch[0],
        before,
        after: current,
        explanation: `Por jerarquía de operaciones, las potencias se resuelven antes de multiplicar o sumar: (${powMatch[1]})^${powMatch[2]} = ${cleanRes}.`,
        category: 'power',
      });
      reduced = true;
      continue;
    }

    // 4. Operations inside the innermost parentheses: e.g. (3 + 5 * 2)
    const innerParenRegex = /\(([^()]+)\)/;
    const innerMatch = current.match(innerParenRegex);
    if (innerMatch) {
      const innerContent = innerMatch[1];

      // Check multiplication or division inside parenthesis
      const innerMulDivRegex = /(-?\d+(?:\.\d+)?)\s*([*\/])\s*(-?\d+(?:\.\d+)?)/;
      const innerMulDivMatch = innerContent.match(innerMulDivRegex);

      if (innerMulDivMatch) {
        const a = parseFloat(innerMulDivMatch[1]);
        const op = innerMulDivMatch[2];
        const b = parseFloat(innerMulDivMatch[3]);
        let resVal = 0;
        let explanation = '';
        let cat: StepCategory = 'multiplication';

        if (op === '*') {
          resVal = a * b;
          explanation = `Dentro del paréntesis (${innerContent}), la multiplicación tiene prioridad sobre la suma/resta: ${a} × ${b} = ${fmt(resVal)}.`;
          rulesSet.add('Multiplicación y división dentro de paréntesis');
        } else {
          cat = 'division';
          if (b === 0) {
            explanation = 'División por cero: dividir entre cero no está definido en los números reales.';
            resVal = Infinity;
          } else {
            resVal = a / b;
            explanation = `Dentro del paréntesis (${innerContent}), se resuelve la división: ${a} ÷ ${b} = ${fmt(resVal)}.`;
          }
          rulesSet.add('Multiplicación y división dentro de paréntesis');
        }

        const newInner = innerContent.replace(innerMulDivMatch[0], fmt(resVal));
        const before = current;
        current = current.replace(innerMatch[0], `(${newInner})`);
        steps.push({
          stepNumber: stepIndex++,
          title: `Operación en paréntesis: ${innerMulDivMatch[1]} ${op === '*' ? '×' : '÷'} ${innerMulDivMatch[3]}`,
          subExpression: innerMulDivMatch[0],
          before,
          after: current,
          explanation,
          category: cat,
        });
        reduced = true;
        continue;
      }

      // Check addition or subtraction inside parenthesis
      const innerAddSubRegex = /(-?\d+(?:\.\d+)?)\s*([+\-])\s*(-?\d+(?:\.\d+)?)/;
      const innerAddSubMatch = innerContent.match(innerAddSubRegex);

      if (innerAddSubMatch) {
        const a = parseFloat(innerAddSubMatch[1]);
        const op = innerAddSubMatch[2];
        const b = parseFloat(innerAddSubMatch[3]);
        const resVal = op === '+' ? a + b : a - b;
        const explanation =
          op === '+'
            ? `Dentro del paréntesis, se resuelve la suma: ${a} + ${b} = ${fmt(resVal)}.`
            : `Dentro del paréntesis, se resuelve la resta: ${a} - ${b} = ${fmt(resVal)}.`;

        const newInner = innerContent.replace(innerAddSubMatch[0], fmt(resVal));
        const before = current;
        current = current.replace(innerMatch[0], `(${newInner})`);
        rulesSet.add('Suma y resta dentro de paréntesis');
        steps.push({
          stepNumber: stepIndex++,
          title: `Operación en paréntesis: ${innerAddSubMatch[1]} ${op} ${innerAddSubMatch[3]}`,
          subExpression: innerAddSubMatch[0],
          before,
          after: current,
          explanation,
          category: op === '+' ? 'addition' : 'subtraction',
        });
        reduced = true;
        continue;
      }
    }

    // 5. Global Multiplications and Divisions (from left to right)
    const mulDivRegex = /(-?\d+(?:\.\d+)?)\s*([*\/])\s*(-?\d+(?:\.\d+)?)/;
    const mulDivMatch = current.match(mulDivRegex);
    if (mulDivMatch) {
      const a = parseFloat(mulDivMatch[1]);
      const op = mulDivMatch[2];
      const b = parseFloat(mulDivMatch[3]);
      let resVal = 0;
      let explanation = '';
      let cat: StepCategory = 'multiplication';

      if (op === '*') {
        resVal = a * b;
        explanation = `Por jerarquía PEMDAS, multiplicamos de izquierda a derecha antes de sumar o restar: ${a} × ${b} = ${fmt(resVal)}.`;
        rulesSet.add('Multiplicación (Jerarquía de operaciones)');
      } else {
        cat = 'division';
        if (b === 0) {
          explanation = 'Indefinido: División entre cero.';
          resVal = Infinity;
        } else {
          resVal = a / b;
          explanation = `Por jerarquía PEMDAS, dividimos de izquierda a derecha: ${a} ÷ ${b} = ${fmt(resVal)}.`;
          rulesSet.add('División (Jerarquía de operaciones)');
        }
      }

      const before = current;
      current = current.replace(mulDivMatch[0], fmt(resVal));
      steps.push({
        stepNumber: stepIndex++,
        title: `Multiplicación o división: ${mulDivMatch[1]} ${op === '*' ? '×' : '÷'} ${mulDivMatch[3]}`,
        subExpression: mulDivMatch[0],
        before,
        after: current,
        explanation,
        category: cat,
      });
      reduced = true;
      continue;
    }

    // 6. Global Additions and Subtractions (from left to right)
    const addSubRegex = /(-?\d+(?:\.\d+)?)\s*([+\-])\s*(-?\d+(?:\.\d+)?)/;
    const addSubMatch = current.match(addSubRegex);
    if (addSubMatch) {
      const a = parseFloat(addSubMatch[1]);
      const op = addSubMatch[2];
      const b = parseFloat(addSubMatch[3]);
      const resVal = op === '+' ? a + b : a - b;
      const explanation =
        op === '+'
          ? `Operación final de suma: ${a} + ${b} = ${fmt(resVal)}.`
          : `Operación final de resta: ${a} - ${b} = ${fmt(resVal)}.`;

      const before = current;
      current = current.replace(addSubMatch[0], fmt(resVal));
      rulesSet.add('Suma y resta (Nivel final de jerarquía)');
      steps.push({
        stepNumber: stepIndex++,
        title: `Suma o resta: ${addSubMatch[1]} ${op} ${addSubMatch[3]}`,
        subExpression: addSubMatch[0],
        before,
        after: current,
        explanation,
        category: op === '+' ? 'addition' : 'subtraction',
      });
      reduced = true;
      continue;
    }

    // If nothing could be matched by regex, break out to avoid infinite loops
    if (!reduced) {
      break;
    }
  }

  // If no reduction steps were generated (or expression has advanced syntax), evaluate with full engine
  if (steps.length === 0) {
    steps.push({
      stepNumber: 1,
      title: 'Evaluación y simplificación analítica',
      before: cleanExpr,
      after: finalResultStr,
      explanation: `Se analiza y calcula la expresión completa aplicando las reglas de precedencia matemática: ${cleanExpr} = ${finalResultStr}.`,
      category: 'general',
    });
    rulesSet.add('Evaluación analítica estándar');
  } else {
    // Add final result confirmation step
    steps.push({
      stepNumber: stepIndex,
      title: 'Resultado final simplificado',
      before: current,
      after: finalResultStr,
      explanation: `Todas las operaciones han sido resueltas en su orden estricto de precedencia. El resultado simplificado final es ${finalResultStr}.`,
      category: 'general',
    });
  }

  // Calculate fraction representation if numeric
  let fractionForm: string | undefined = undefined;
  const numVal = parseFloat(finalResultStr);
  if (!isNaN(numVal) && isFinite(numVal) && !Number.isInteger(numVal)) {
    const frac = toFraction(numVal);
    if (frac !== finalResultStr && frac.includes('/')) {
      fractionForm = frac;
      rulesSet.add('Conversión a fracción irreductible');
    }
  }

  return {
    originalExpression: cleanExpr,
    finalResult: finalResultStr,
    angleUnit,
    steps,
    rulesSummary: Array.from(rulesSet),
    fractionForm,
  };
}
