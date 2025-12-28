import { Faction } from './faction';
import { Unit } from './unit';

export type UnitRelationshipType = 'embarked' | 'desanting' | 'towed';

export interface UnitRelationship {
  type: UnitRelationshipType;
  transportUnitId: string;
}

export interface RosterGroup {
  id: string;
  name: string;
  collapsed?: boolean;
}

export interface RosterUnit {
  id: string;
  unitId: string;
  customName?: string;
  selectedOptions?: number[];
  count: number;
  groupId?: string;
  relationship?: UnitRelationship;
}

export interface Roster {
  id: string;
  name: string;
  factionId: string;
  pointsLimit: number;
  units: RosterUnit[];
  groups: RosterGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface FactionData {
  faction: Faction;
  units: Unit[];
}

export interface TransportValidation {
  transportUnit: RosterUnit;
  capacity: number; // PC capacity (for backwards compatibility)
  currentLoad: number; // Total load (for backwards compatibility)
  embarkedUnits: RosterUnit[]; // All transported units
  isValid: boolean;
  errors: string[];
  // Separate capacity tracking
  pcCapacity: number;
  embarkedLoad: number;
  desantingCapacity: number;
  desantingLoad: number;
}
