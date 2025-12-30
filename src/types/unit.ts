import { Weapon } from './weapon';

export type UnitType =
  | 'Vec' | 'Vec(W)' | 'Vec(C)' | 'Vec(S)' | 'Vec(M)' | 'Vec(L)' | 'Vec(H)'
  | 'Inf' | 'Inf(S)'
  | 'Air' | 'Air(CAP)' | 'Air(CAS)';

export type UnitCategory =
  | 'TACOMS'
  | 'Infantry'
  | 'Vehicles'
  | 'Aircraft'
  | 'Emplacements'
  | 'Support'
  | 'Scenario';

export interface UnitToughness {
  front: number | string;
  side: number | string;
  rear: number | string;
}

export type Toughness = UnitToughness | number | string;

export interface UnitStats {
  height?: number;
  movement: number;
  quality: number | '*';
  toughness?: Toughness;
  evasion?: number;
  command?: number;
  capacity?: number;
  spottingDistance?: number;
}

export interface UnitSpecialRule {
  name: string;
  description?: string;
}

export interface UnitOption {
  description?: string;
  points?: number;
}

export interface Unit {
  id: string;
  name: string;
  category: UnitCategory;
  subcategory?: string;
  descriptiveCategory?: string;
  unitClass: UnitType; // Unit class for PC capacity: Inf (1 PC), Inf(S) (2 PC), Vec variants
  points: number | string; // number or "X/Y" for split costs
  stats: UnitStats;
  specialRules?: UnitSpecialRule[];
  description?: string; // Unit special ability description or flavor text
  weapons?: Weapon[];
  options?: UnitOption[];
}
