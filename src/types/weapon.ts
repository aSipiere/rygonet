export interface WeaponAccuracy {
  stationary: number | string;
  moving: number | string;
}

export interface WeaponStrength {
  normal: number;
  halfRange: number;
}

export interface ShotType {
  name: string;
  target?: string | null;
  range?: number | null;
  accuracy?: number | string | WeaponAccuracy | null;
  strength?: number | string | WeaponStrength | null;
  dice?: number | null;
  specialRules?: string[];
}

export interface Weapon {
  name: string;
  target?: string;
  range?: number;
  accuracy?: number | string | WeaponAccuracy;
  strength?: number | string | WeaponStrength;
  dice?: number;
  ammo?: number | null;
  specialRules?: string[];
  shotTypes?: ShotType[];
}
