export interface WeaponAccuracy {
  stationary: number;
  moving: number;
}

export interface ShotType {
  name: string;
  target?: string | null;
  range?: number | null;
  accuracy?: number | WeaponAccuracy | null;
  strength?: number | null;
  damage?: number | null;
  specialRules?: string[];
}

export interface Weapon {
  name: string;
  range?: number;
  accuracy?: number | WeaponAccuracy;
  strength?: number;
  damage?: number;
  ammo?: number | null;
  specialRules?: string[];
  shotTypes?: ShotType[];
}
