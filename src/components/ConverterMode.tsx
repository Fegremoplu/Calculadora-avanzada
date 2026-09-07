import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check, Scale } from 'lucide-react';
import { UnitCategory } from '../types';
import { UNIT_CATEGORIES, UNITS, convertUnit } from '../utils/unitData';

export const ConverterMode: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const availableUnits = UNITS[category];

  const [fromUnit, setFromUnit] = useState<string>(availableUnits[0].id);
  const [toUnit, setToUnit] = useState<string>(availableUnits[1]?.id || availableUnits[0].id);

  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState(false);

  // Handle category switch
  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const newUnits = UNITS[newCat];
    setFromUnit(newUnits[0].id);
    setToUnit(newUnits[1]?.id || newUnits[0].id);
  };

  // Swap units
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const parsedInput = parseFloat(inputValue);
  const converted = isNaN(parsedInput) ? 0 : convertUnit(parsedInput, category, fromUnit, toUnit);

  const fromDef = availableUnits.find(u => u.id === fromUnit);
  const toDef = availableUnits.find(u => u.id === toUnit);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${converted}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        {UNIT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              category === cat.id
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Conversion Card */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* FROM Unit Box */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400">De:</span>
            <select
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {availableUnits.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
            <div className="mt-1">
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-2xl font-mono font-bold text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              title="Intercambiar unidades"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 transition-all active:rotate-180"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO Unit Box */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">A:</span>
              <button
                onClick={handleCopy}
                title="Copiar resultado"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <select
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {availableUnits.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
            <div className="mt-1 overflow-x-auto scrollbar-none">
              <span className="text-2xl font-mono font-bold text-cyan-400">
                {isNaN(converted) ? '0' : converted.toLocaleString('es-ES', { maximumFractionDigits: 8 })}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic equivalence tag */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              1 {fromDef?.name} ({fromDef?.symbol}) ={' '}
              <strong className="text-slate-200">
                {convertUnit(1, category, fromUnit, toUnit).toLocaleString('es-ES', { maximumFractionDigits: 8 })}
              </strong>{' '}
              {toDef?.name} ({toDef?.symbol})
            </span>
          </div>
        </div>

        {/* Quick Multi-Unit Reference Table */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Valores equivalentes en otras unidades de {category}:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableUnits
              .filter(u => u.id !== fromUnit)
              .slice(0, 8)
              .map(u => {
                const val = convertUnit(parsedInput || 0, category, fromUnit, u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => setToUnit(u.id)}
                    className="p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="text-[11px] text-slate-400 truncate">{u.name}</div>
                    <div className="font-mono text-xs font-semibold text-cyan-300 truncate">
                      {val.toLocaleString('es-ES', { maximumFractionDigits: 4 })} {u.symbol}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
