import { UnitCategory, UnitDefinition } from '../types';

export const UNIT_CATEGORIES: { id: UnitCategory; label: string }[] = [
  { id: 'length', label: 'Longitud' },
  { id: 'mass', label: 'Masa y Peso' },
  { id: 'temperature', label: 'Temperatura' },
  { id: 'pressure', label: 'Presión' },
  { id: 'energy', label: 'Energía' },
  { id: 'speed', label: 'Velocidad' },
  { id: 'digital', label: 'Datos Digitales' },
];

export const UNITS: Record<UnitCategory, UnitDefinition[]> = {
  length: [
    { id: 'm', name: 'Metro', symbol: 'm', toBase: v => v, fromBase: v => v },
    { id: 'km', name: 'Kilómetro', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'cm', name: 'Centímetro', symbol: 'cm', toBase: v => v * 0.01, fromBase: v => v * 100 },
    { id: 'mm', name: 'Milímetro', symbol: 'mm', toBase: v => v * 0.001, fromBase: v => v * 1000 },
    { id: 'in', name: 'Pulgada', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    { id: 'ft', name: 'Pie', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { id: 'yd', name: 'Yarda', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { id: 'mi', name: 'Milla', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    { id: 'nmi', name: 'Milla náutica', symbol: 'NM', toBase: v => v * 1852, fromBase: v => v / 1852 },
    { id: 'ly', name: 'Año luz', symbol: 'ly', toBase: v => v * 9.4607e15, fromBase: v => v / 9.4607e15 },
  ],
  mass: [
    { id: 'kg', name: 'Kilogramo', symbol: 'kg', toBase: v => v, fromBase: v => v },
    { id: 'g', name: 'Gramo', symbol: 'g', toBase: v => v * 0.001, fromBase: v => v * 1000 },
    { id: 'mg', name: 'Miligramo', symbol: 'mg', toBase: v => v * 1e-6, fromBase: v => v * 1e6 },
    { id: 'lb', name: 'Libra', symbol: 'lb', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
    { id: 'oz', name: 'Onza', symbol: 'oz', toBase: v => v * 0.028349523, fromBase: v => v / 0.028349523 },
    { id: 't', name: 'Tonelada métrica', symbol: 't', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'ct', name: 'Quilate', symbol: 'ct', toBase: v => v * 0.0002, fromBase: v => v / 0.0002 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v },
    { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * (5 / 9), fromBase: v => (v * 9) / 5 + 32 },
    { id: 'k', name: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    { id: 'r', name: 'Rankine', symbol: '°R', toBase: v => (v - 491.67) * (5 / 9), fromBase: v => (v + 273.15) * 1.8 },
  ],
  pressure: [
    { id: 'pa', name: 'Pascal', symbol: 'Pa', toBase: v => v, fromBase: v => v },
    { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'bar', name: 'Bar', symbol: 'bar', toBase: v => v * 100000, fromBase: v => v / 100000 },
    { id: 'atm', name: 'Atmósfera estándar', symbol: 'atm', toBase: v => v * 101325, fromBase: v => v / 101325 },
    { id: 'psi', name: 'PSI (lb/in²)', symbol: 'psi', toBase: v => v * 6894.757, fromBase: v => v / 6894.757 },
    { id: 'mmhg', name: 'Milímetro de mercurio', symbol: 'mmHg', toBase: v => v * 133.322, fromBase: v => v / 133.322 },
  ],
  energy: [
    { id: 'j', name: 'Julio (Joule)', symbol: 'J', toBase: v => v, fromBase: v => v },
    { id: 'kj', name: 'Kilojulio', symbol: 'kJ', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { id: 'cal', name: 'Caloría', symbol: 'cal', toBase: v => v * 4.184, fromBase: v => v / 4.184 },
    { id: 'kcal', name: 'Kilocaloría', symbol: 'kcal', toBase: v => v * 4184, fromBase: v => v / 4184 },
    { id: 'wh', name: 'Vatio-hora', symbol: 'Wh', toBase: v => v * 3600, fromBase: v => v / 3600 },
    { id: 'kwh', name: 'Kilovatio-hora', symbol: 'kWh', toBase: v => v * 3.6e6, fromBase: v => v / 3.6e6 },
    { id: 'ev', name: 'Electronvoltio', symbol: 'eV', toBase: v => v * 1.602176634e-19, fromBase: v => v / 1.602176634e-19 },
    { id: 'btu', name: 'BTU', symbol: 'BTU', toBase: v => v * 1055.06, fromBase: v => v / 1055.06 },
  ],
  speed: [
    { id: 'ms', name: 'Metro por segundo', symbol: 'm/s', toBase: v => v, fromBase: v => v },
    { id: 'kmh', name: 'Kilómetro por hora', symbol: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { id: 'mph', name: 'Milla por hora', symbol: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
    { id: 'knot', name: 'Nudo náutico', symbol: 'kn', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    { id: 'mach', name: 'Mach (en aire a 20°C)', symbol: 'Ma', toBase: v => v * 343, fromBase: v => v / 343 },
  ],
  digital: [
    { id: 'b', name: 'Byte', symbol: 'B', toBase: v => v, fromBase: v => v },
    { id: 'kb', name: 'Kilobyte', symbol: 'KB', toBase: v => v * 1024, fromBase: v => v / 1024 },
    { id: 'mb', name: 'Megabyte', symbol: 'MB', toBase: v => v * 1024 * 1024, fromBase: v => v / (1024 * 1024) },
    { id: 'gb', name: 'Gigabyte', symbol: 'GB', toBase: v => v * Math.pow(1024, 3), fromBase: v => v / Math.pow(1024, 3) },
    { id: 'tb', name: 'Terabyte', symbol: 'TB', toBase: v => v * Math.pow(1024, 4), fromBase: v => v / Math.pow(1024, 4) },
    { id: 'pb', name: 'Petabyte', symbol: 'PB', toBase: v => v * Math.pow(1024, 5), fromBase: v => v / Math.pow(1024, 5) },
  ]
};

export function convertUnit(
  value: number,
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string
): number {
  const categoryUnits = UNITS[category];
  const fromDef = categoryUnits.find(u => u.id === fromUnitId);
  const toDef = categoryUnits.find(u => u.id === toUnitId);

  if (!fromDef || !toDef || isNaN(value)) return 0;
  const baseValue = fromDef.toBase(value);
  return toDef.fromBase(baseValue);
}
