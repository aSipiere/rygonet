import { Weapon } from './weapon';

export type UnitType = 'Vec' | 'Inf' | 'Air';

export type UnitCategory =
  | 'TACOMS'
  | 'Infantry'
  | 'Vehicles'
  | 'Aircraft'
  | 'Emplacements'
  | 'Support'
  | 'Scenario';

export interface UnitToughness {
  front: number;
  side: number;
  rear: number;
}

export interface UnitStats {
  unitType: UnitType;
  height?: number;
  speed?: number;
  movement: number;
  quality: number;
  toughness?: UnitToughness;
  command?: number;
  capacity?: number;
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
  points: number;
  stats: UnitStats;
  specialRules?: UnitSpecialRule[];
  weapons?: Weapon[];
  options?: UnitOption[];
}
