import React, { useState } from 'react';
import { Binary, Copy, Check, ListOrdered, ArrowRight, ChevronDown, ChevronUp, Share2 } from 'lucide-react';

type BaseType = 'HEX' | 'DEC' | 'OCT' | 'BIN';
type WordSize = 64 | 32 | 16 | 8;

interface DivisionStep {
  dividend: bigint;
  divisor: bigint;
  quotient: bigint;
  remainder: bigint;
  hexChar?: string;
}

export const ProgrammerMode: React.FC = () => {
  const [value, setValue] = useState<bigint>(42n);
  const [activeBase, setActiveBase] = useState<BaseType>('DEC');
  const [wordSize, setWordSize] = useState<WordSize>(32);
  const [copiedBase, setCopiedBase] = useState<string | null>(null);
  const [showProcedure, setShowProcedure] = useState<boolean>(true);
  const [procedureTarget, setProcedureTarget] = useState<'BIN' | 'HEX' | 'OCT'>('BIN');

  // Mask value according to word size (unsigned)
  const getMask = (size: WordSize): bigint => {
    if (size === 64) return 0xffffffffffffffffn;
    if (size === 32) return 0xffffffffn;
    if (size === 16) return 0xffffn;
    return 0xffn;
  };

  const mask = getMask(wordSize);
  const maskedVal = (value & mask);

  // Formatted representations
  const hexStr = maskedVal.toString(16).toUpperCase();
  const decStr = maskedVal.toString(10);
  const octStr = maskedVal.toString(8);
  const binStr = maskedVal.toString(2).padStart(wordSize, '0');

  // Generate successive division steps for conversion
  const generateDivisionSteps = (radix: 2 | 8 | 16): DivisionStep[] => {
    if (maskedVal === 0n) {
      return [{
        dividend: 0n,
        divisor: BigInt(radix),
        quotient: 0n,
        remainder: 0n,
        hexChar: '0'
      }];
    }

    const steps: DivisionStep[] = [];
    let current = maskedVal;
    const div = BigInt(radix);
    const hexMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

    while (current > 0n) {
      const q = current / div;
      const r = current % div;
      steps.push({
        dividend: current,
        divisor: div,
        quotient: q,
        remainder: r,
        hexChar: radix === 16 ? hexMap[Number(r)] : undefined,
      });
      current = q;
    }

    return steps;
  };

  // Generate polynomial expansion for BIN -> DEC
  const generatePolynomialSteps = () => {
    const rawBin = maskedVal.toString(2);
    const len = rawBin.length;
    const terms: { bit: string; power: number; termValue: bigint }[] = [];

    for (let i = 0; i < len; i++) {
      const bit = rawBin[i];
      const power = len - 1 - i;
      const termVal = bit === '1' ? 1n << BigInt(power) : 0n;
      terms.push({ bit, power, termValue: termVal });
    }

    return terms;
  };

  // Copy helper
  const handleCopy = (text: string, base: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBase(base);
    setTimeout(() => setCopiedBase(null), 1500);
  };

  // Bit toggle
  const toggleBit = (bitIndex: number) => {
    const bitMask = 1n << BigInt(bitIndex);
    const newVal = (maskedVal ^ bitMask) & mask;
    setValue(newVal);
  };

  // Input from keyboard / keypad
  const handleInputDigit = (digit: string) => {
    try {
      let currentStr = '';
      if (activeBase === 'HEX') currentStr = hexStr;
      else if (activeBase === 'DEC') currentStr = decStr;
      else if (activeBase === 'OCT') currentStr = octStr;
      else currentStr = binStr;

      if (currentStr === '0') currentStr = '';
      const newStr = currentStr + digit;

      let parsed = 0n;
      if (activeBase === 'HEX') parsed = BigInt('0x' + newStr);
      else if (activeBase === 'DEC') parsed = BigInt(newStr);
      else if (activeBase === 'OCT') parsed = BigInt('0o' + newStr);
      else parsed = BigInt('0b' + newStr);

      setValue(parsed & mask);
    } catch {
      // Invalid input
    }
  };

  const handleBackspace = () => {
    let currentStr = '';
    if (activeBase === 'HEX') currentStr = hexStr;
    else if (activeBase === 'DEC') currentStr = decStr;
    else if (activeBase === 'OCT') currentStr = octStr;
    else currentStr = binStr;

    if (currentStr.length <= 1) {
      setValue(0n);
      return;
    }

    const trimmed = currentStr.slice(0, -1);
    try {
      let parsed = 0n;
      if (activeBase === 'HEX') parsed = BigInt('0x' + trimmed);
      else if (activeBase === 'DEC') parsed = BigInt(trimmed);
      else if (activeBase === 'OCT') parsed = BigInt('0o' + trimmed);
      else parsed = BigInt('0b' + trimmed);

      setValue(parsed & mask);
    } catch {
      setValue(0n);
    }
  };

  const handleClear = () => {
    setValue(0n);
  };

  // Bitwise Operations
  const handleBitwise = (op: 'NOT' | 'LSH' | 'RSH') => {
    if (op === 'NOT') {
      setValue((~maskedVal) & mask);
    } else if (op === 'LSH') {
      setValue((maskedVal << 1n) & mask);
    } else if (op === 'RSH') {
      setValue((maskedVal >> 1n) & mask);
    }
  };

  // Check if button is enabled for active base
  const isDigitEnabled = (char: string): boolean => {
    if (activeBase === 'BIN') return char === '0' || char === '1';
    if (activeBase === 'OCT') return char >= '0' && char <= '7';
    if (activeBase === 'DEC') return char >= '0' && char <= '9';
    return true; // HEX has 0-9 and A-F
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Base Value Cards (HEX, DEC, OCT, BIN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {[
          { base: 'HEX' as BaseType, label: 'HEX (Hexadecimal)', val: hexStr, prefix: '0x' },
          { base: 'DEC' as BaseType, label: 'DEC (Decimal)', val: decStr, prefix: '' },
          { base: 'OCT' as BaseType, label: 'OCT (Octal)', val: octStr, prefix: '0o' },
          { base: 'BIN' as BaseType, label: 'BIN (Binario)', val: binStr.replace(/(.{4})/g, '$1 ').trim(), prefix: '0b' },
        ].map(item => (
          <div
            key={item.base}
            onClick={() => setActiveBase(item.base)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
              activeBase === item.base
                ? 'bg-slate-900 border-cyan-500/80 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-semibold ${
                  activeBase === item.base ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleCopy(item.val, item.base);
                }}
                className="p-1 rounded text-slate-500 hover:text-slate-300"
              >
                {copiedBase === item.base ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-slate-100 truncate">
              <span className="text-slate-500 text-xs mr-1">{item.prefix}</span>
              {item.val || '0'}
            </div>
          </div>
        ))}
      </div>

      {/* Bit Word Size and Bitwise Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 font-semibold mr-1">TAMAÑO:</span>
          {([64, 32, 16, 8] as WordSize[]).map(size => (
            <button
              key={size}
              onClick={() => setWordSize(size)}
              className={`px-2 py-1 rounded-lg transition-colors ${
                wordSize === size
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {size} bits
            </button>
          ))}
        </div>

        {/* Quick Operations */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => handleBitwise('NOT')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700"
          >
            NOT (~)
          </button>
          <button
            onClick={() => handleBitwise('LSH')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700"
          >
            LSH (&lt;&lt;)
          </button>
          <button
            onClick={() => handleBitwise('RSH')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700"
          >
            RSH (&gt;&gt;)
          </button>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50"
          >
            CLR
          </button>
        </div>
      </div>

      {/* Interactive Bit Toggle Matrix */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Matriz Interactiva de Bits (Haz clic para alternar 0/1)</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">MSB → LSB</span>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 pt-2">
          {Array.from({ length: wordSize }).map((_, i) => {
            const bitIndex = wordSize - 1 - i;
            const isBitSet = ((maskedVal >> BigInt(bitIndex)) & 1n) === 1n;
            return (
              <button
                key={bitIndex}
                onClick={() => toggleBit(bitIndex)}
                title={`Bit ${bitIndex}`}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                  isBitSet
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span className="font-mono text-sm font-bold">{isBitSet ? '1' : '0'}</span>
                <span className="text-[9px] text-slate-500 font-mono">{bitIndex}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Programmer Keypad */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 font-mono">
        {/* Hex characters A-F */}
        {['A', 'B', 'C', 'D', 'E', 'F'].map(ch => {
          const enabled = isDigitEnabled(ch);
          return (
            <button
              key={ch}
              onClick={() => handleInputDigit(ch)}
              disabled={!enabled}
              className={`h-11 rounded-xl text-base font-bold transition-colors ${
                enabled
                  ? 'bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-750'
                  : 'bg-slate-900/50 text-slate-700 border border-slate-900 cursor-not-allowed'
              }`}
            >
              {ch}
            </button>
          );
        })}

        {/* Numbers 7, 8, 9, 4, 5, 6, 1, 2, 3, 0 */}
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'].map(digit => {
          const enabled = isDigitEnabled(digit);
          return (
            <button
              key={digit}
              onClick={() => handleInputDigit(digit)}
              disabled={!enabled}
              className={`h-11 rounded-xl text-base font-bold transition-colors ${
                enabled
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800'
                  : 'bg-slate-900/50 text-slate-700 border border-slate-900 cursor-not-allowed'
              }`}
            >
              {digit}
            </button>
          );
        })}

        {/* Backspace & Clear */}
        <button
          onClick={handleBackspace}
          className="h-11 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold cursor-pointer"
        >
          ⌫
        </button>
        <button
          onClick={handleClear}
          className="h-11 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 font-bold cursor-pointer"
        >
          AC
        </button>
      </div>

      {/* Step-by-Step Base Conversion Procedure */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-100">
              Procedimiento de Conversión Paso a Paso ({decStr}₁₀)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = `Conversión de ${decStr} (Decimal):\n- Binario: ${binStr}\n- Hexadecimal: 0x${hexStr}\n- Octal: 0o${octStr}`;
                handleCopy(text, 'procedure');
              }}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
            >
              {copiedBase === 'procedure' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBase === 'procedure' ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={() => setShowProcedure(!showProcedure)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 cursor-pointer"
              title={showProcedure ? 'Ocultar' : 'Mostrar'}
            >
              {showProcedure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showProcedure && (
          <div className="flex flex-col gap-3 pt-1">
            {/* Conversion Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setProcedureTarget('BIN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  procedureTarget === 'BIN'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Decimal → Binario (÷ 2)
              </button>
              <button
                onClick={() => setProcedureTarget('HEX')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  procedureTarget === 'HEX'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Decimal → Hexadecimal (÷ 16)
              </button>
              <button
                onClick={() => setProcedureTarget('OCT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  procedureTarget === 'OCT'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Decimal → Octal (÷ 8)
              </button>
            </div>

            {/* Target 1: BINARY (Divisiones sucesivas) */}
            {procedureTarget === 'BIN' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-cyan-400 mb-1">
                    Método de Divisiones Sucesivas entre 2:
                  </div>
                  <p className="text-slate-400 text-[11px] mb-2">
                    Dividimos sucesivamente entre 2 hasta que el cociente sea 0. Los residuos leídos de abajo hacia arriba forman el número binario.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] font-mono">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800 text-left">
                          <th className="py-1 px-2">Dividendo</th>
                          <th className="py-1 px-2">÷</th>
                          <th className="py-1 px-2">Cociente</th>
                          <th className="py-1 px-2 text-cyan-300">Residuo (Bit)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {generateDivisionSteps(2).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-1 px-2 text-slate-200">{s.dividend.toString()}</td>
                            <td className="py-1 px-2 text-slate-500">÷ 2</td>
                            <td className="py-1 px-2 text-slate-400">{s.quotient.toString()}</td>
                            <td className="py-1 px-2 font-bold text-cyan-400">{s.remainder.toString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Resultado Binario Puro:</span>
                    <span className="font-mono font-bold text-emerald-400">{maskedVal.toString(2)}₂</span>
                  </div>
                </div>

                {/* Polynomial Verification */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-cyan-400 mb-1">
                    Comprobación: Expansión Polinómica (Binario → Decimal):
                  </div>
                  <p className="text-slate-400 text-[11px] mb-2 font-mono">
                    {generatePolynomialSteps()
                      .map(t => `${t.bit}·2^${t.power}`)
                      .join(' + ')}
                  </p>
                  <p className="font-mono text-emerald-400 font-bold text-xs">
                    = {generatePolynomialSteps()
                      .map(t => t.termValue.toString())
                      .join(' + ')} = {decStr}₁₀
                  </p>
                </div>
              </div>
            )}

            {/* Target 2: HEXADECIMAL (Divisiones sucesivas) */}
            {procedureTarget === 'HEX' && (
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
                <div className="font-semibold text-cyan-400 mb-1">
                  Método de Divisiones Sucesivas entre 16:
                </div>
                <p className="text-slate-400 text-[11px] mb-2">
                  Se divide sucesivamente entre 16. Si el residuo es ≥ 10, se traduce a letras hexadecimales (10=A, 11=B, 12=C, 13=D, 14=E, 15=F).
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-left">
                        <th className="py-1 px-2">Dividendo</th>
                        <th className="py-1 px-2">÷</th>
                        <th className="py-1 px-2">Cociente</th>
                        <th className="py-1 px-2 text-cyan-300">Residuo</th>
                        <th className="py-1 px-2 text-emerald-400">Dígito HEX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {generateDivisionSteps(16).map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-1 px-2 text-slate-200">{s.dividend.toString()}</td>
                          <td className="py-1 px-2 text-slate-500">÷ 16</td>
                          <td className="py-1 px-2 text-slate-400">{s.quotient.toString()}</td>
                          <td className="py-1 px-2 font-mono text-slate-300">{s.remainder.toString()}</td>
                          <td className="py-1 px-2 font-mono font-bold text-cyan-400">{s.hexChar}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Resultado Hexadecimal:</span>
                  <span className="font-mono font-bold text-emerald-400">0x{hexStr}</span>
                </div>
              </div>
            )}

            {/* Target 3: OCTAL (Divisiones sucesivas) */}
            {procedureTarget === 'OCT' && (
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
                <div className="font-semibold text-cyan-400 mb-1">
                  Método de Divisiones Sucesivas entre 8:
                </div>
                <p className="text-slate-400 text-[11px] mb-2">
                  Se divide sucesivamente entre 8. Los residuos entre 0 y 7 leídos de abajo hacia arriba componen la representación octal.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-left">
                        <th className="py-1 px-2">Dividendo</th>
                        <th className="py-1 px-2">÷</th>
                        <th className="py-1 px-2">Cociente</th>
                        <th className="py-1 px-2 text-cyan-300">Residuo (Octal)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {generateDivisionSteps(8).map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-1 px-2 text-slate-200">{s.dividend.toString()}</td>
                          <td className="py-1 px-2 text-slate-500">÷ 8</td>
                          <td className="py-1 px-2 text-slate-400">{s.quotient.toString()}</td>
                          <td className="py-1 px-2 font-mono font-bold text-cyan-400">{s.remainder.toString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Resultado Octal:</span>
                  <span className="font-mono font-bold text-emerald-400">0o{octStr}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
