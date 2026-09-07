import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check, Scale, ListOrdered, ChevronDown, ChevronUp } from 'lucide-react';
import { UnitCategory } from '../types';
import { UNIT_CATEGORIES, UNITS, convertUnit } from '../utils/unitData';

export const ConverterMode: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const availableUnits = UNITS[category];

  const [fromUnit, setFromUnit] = useState<string>(availableUnits[0].id);
  const [toUnit, setToUnit] = useState<string>(availableUnits[1]?.id || availableUnits[0].id);

  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState(false);
  const [showProcedure, setShowProcedure] = useState<boolean>(true);
  const [copiedProc, setCopiedProc] = useState(false);

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
  const safeInput = isNaN(parsedInput) ? 0 : parsedInput;
  const converted = convertUnit(safeInput, category, fromUnit, toUnit);

  const fromDef = availableUnits.find(u => u.id === fromUnit);
  const toDef = availableUnits.find(u => u.id === toUnit);
  const baseDef = availableUnits[0]; // First element is typically the base unit (e.g., m, kg, °C, Pa, J, m/s, B)

  // Intermediate base value
  const baseValue = fromDef ? fromDef.toBase(safeInput) : 0;
  const unitEquivalence = convertUnit(1, category, fromUnit, toUnit);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${converted}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyProcedure = () => {
    const procText = `Procedimiento de Conversión de ${category}:\n` +
      `1. Valor inicial: ${safeInput} ${fromDef?.symbol} (${fromDef?.name})\n` +
      `2. Conversión a unidad base (${baseDef?.name}): ${baseValue} ${baseDef?.symbol}\n` +
      `3. Conversión final: ${converted} ${toDef?.symbol} (${toDef?.name})\n` +
      `Factor: 1 ${fromDef?.symbol} = ${unitEquivalence} ${toDef?.symbol}`;
    navigator.clipboard.writeText(procText);
    setCopiedProc(true);
    setTimeout(() => setCopiedProc(false), 1500);
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

        {/* Step-by-Step Procedure Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <ListOrdered className="w-4 h-4 text-cyan-400" />
              <span>Procedimiento Paso a Paso: Conversión Dimensional</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyProcedure}
                className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedProc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedProc ? 'Copiado' : 'Copiar pasos'}</span>
              </button>
              <button
                onClick={() => setShowProcedure(!showProcedure)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                title={showProcedure ? 'Ocultar' : 'Mostrar'}
              >
                {showProcedure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showProcedure && (
            <div className="space-y-2.5 text-xs text-slate-300 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-cyan-400">Paso 1: Identificación de la magnitud y unidades</span>
                <p className="mt-1 font-mono text-slate-200">
                  Magnitud: {category.toUpperCase()} | Valor inicial: {safeInput} {fromDef?.symbol} ({fromDef?.name})
                </p>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  Unidad destino deseada: {toDef?.name} ({toDef?.symbol}).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-cyan-400">Paso 2: Conversión a la unidad base del Sistema Internacional ({baseDef?.symbol})</span>
                <p className="mt-1 font-mono text-slate-200">
                  {fromDef?.name} → {baseDef?.name}: {safeInput} {fromDef?.symbol} = {baseValue.toLocaleString('es-ES', { maximumFractionDigits: 8 })} {baseDef?.symbol}
                </p>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  El cálculo se normaliza a través de la unidad patrón estándar ({baseDef?.name}).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-cyan-400">Paso 3: Transformación dimensional a la unidad final ({toDef?.symbol})</span>
                <p className="mt-1 font-mono text-slate-200">
                  {baseValue.toLocaleString('es-ES', { maximumFractionDigits: 8 })} {baseDef?.symbol} → {converted.toLocaleString('es-ES', { maximumFractionDigits: 8 })} {toDef?.symbol}
                </p>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  Equivalencia directa: 1 {fromDef?.symbol} = {unitEquivalence.toLocaleString('es-ES', { maximumFractionDigits: 8 })} {toDef?.symbol}.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-cyan-400">Paso 4: Resultado final</span>
                <p className="mt-1 font-mono text-emerald-300 font-bold text-sm">
                  {safeInput} {fromDef?.symbol} = {converted.toLocaleString('es-ES', { maximumFractionDigits: 8 })} {toDef?.symbol}
                </p>
                {Math.abs(converted) >= 1e6 || (Math.abs(converted) > 0 && Math.abs(converted) < 1e-4) ? (
                  <p className="mt-0.5 text-slate-400 text-[11px] font-mono">
                    Notación científica: {converted.toExponential(6)} {toDef?.symbol}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
