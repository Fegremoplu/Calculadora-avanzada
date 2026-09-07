import React, { useState } from 'react';
import { Binary, Copy, Check } from 'lucide-react';

type BaseType = 'HEX' | 'DEC' | 'OCT' | 'BIN';
type WordSize = 64 | 32 | 16 | 8;

export const ProgrammerMode: React.FC = () => {
  const [value, setValue] = useState<bigint>(42n);
  const [activeBase, setActiveBase] = useState<BaseType>('DEC');
  const [wordSize, setWordSize] = useState<WordSize>(32);
  const [copiedBase, setCopiedBase] = useState<string | null>(null);

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
          className="h-11 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold"
        >
          ⌫
        </button>
        <button
          onClick={handleClear}
          className="h-11 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 font-bold"
        >
          AC
        </button>
      </div>
    </div>
  );
};
