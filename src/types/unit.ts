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

export type Toughness = string | {
  front: number | string;
  side: number | string;
  rear: number | string;
};

export interface UnitStats {
  unitClass: UnitType; // Unit class for PC capacity: Inf (1 PC), Inf(S) (2 PC), Vec variants
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
  points: number | string; // number or "X/Y" for split costs
  stats: UnitStats;
  specialRules?: UnitSpecialRule[];
  unitAbility?: string; // Unit special ability description
  weapons?: Weapon[];
  options?: UnitOption[];
}
