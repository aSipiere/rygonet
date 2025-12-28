export interface FactionSpecialRule {
  name: string;
  description?: string;
}

export interface Faction {
  id: string;
  name: string;
  description?: string;
  version?: string;
  specialRules?: FactionSpecialRule[];
}
