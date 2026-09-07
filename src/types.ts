export type AngleUnit = 'DEG' | 'RAD' | 'GRAD';

export type CalculatorTab = 'scientific' | 'grapher' | 'grapher3d' | 'calculus' | 'programmer' | 'converter';

export type NumberFormat = 'standard' | 'scientific' | 'fraction';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  angleUnit: AngleUnit;
}

export interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  name: string;
}

export type UnitCategory = 
  | 'length'
  | 'mass'
  | 'temperature'
  | 'pressure'
  | 'energy'
  | 'speed'
  | 'digital';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}
