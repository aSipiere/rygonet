import { Unit } from '@/types';

export interface TransportCapacityInfo {
  capacity: number;
  type: 'pc' | 'tow' | 'capacity' | 'none' | 'both'; // 'both' for units with PC and Tow
  exitPoint?: string; // For PC: "Rear", "Sides", etc.
  maxToughness?: number; // For Tow
  pcCapacity?: number; // For units with both PC and Tow
}

/**
 * Parse transport capacity from unit special rules or stats
 * Supports:
 * - PC(Rear, 2) - Personnel Carrier, exits from rear, carries 2 units
 * - PC(1, Sides) - Personnel Carrier, carries 1 unit, exits from sides
 * - Tow(4) - Can tow 1 unit with max toughness 4, or 2 units with max toughness 2
 * - Units can have BOTH PC and Tow rules
 * - Fallback to stats.capacity if no special rules found
 */
export function parseTransportCapacity(unit: Unit): TransportCapacityInfo {
  let pcInfo: { capacity: number; exitPoint: string } | null = null;
  let towInfo: { maxToughness: number } | null = null;

  // Check special rules for PC() or Tow() notation
  if (unit.specialRules) {
    for (const ruleName of unit.specialRules) {

      // Match PC(Rear, 2) or PC(2, Sides) formats (with optional space after PC)
      const pcMatch = ruleName.match(/PC\s*\(([^,]+),\s*(\d+)\)|PC\s*\((\d+),\s*([^)]+)\)/i);
      if (pcMatch) {
        if (pcMatch[1]) {
          // Format: PC(Rear, 2)
          pcInfo = {
            capacity: parseInt(pcMatch[2]),
            exitPoint: pcMatch[1].trim(),
          };
        } else {
          // Format: PC(2, Sides)
          pcInfo = {
            capacity: parseInt(pcMatch[3]),
            exitPoint: pcMatch[4].trim(),
          };
        }
      }

      // Match Tow(4) or Tow(Infinite) format (with optional space after Tow)
      const towMatch = ruleName.match(/Tow\s*\((\d+|Infinite)\)/i);
      if (towMatch) {
        const towValue = towMatch[1].toLowerCase() === 'infinite' ? 999 : parseInt(towMatch[1]);
        towInfo = {
          maxToughness: towValue,
        };
      }
    }
  }

  // Return appropriate type based on what was found
  if (pcInfo && towInfo) {
    // Unit has BOTH PC and Tow
    return {
      capacity: pcInfo.capacity,
      type: 'both',
      exitPoint: pcInfo.exitPoint,
      maxToughness: towInfo.maxToughness,
      pcCapacity: pcInfo.capacity,
    };
  } else if (pcInfo) {
    // Unit has only PC
    return {
      capacity: pcInfo.capacity,
      type: 'pc',
      exitPoint: pcInfo.exitPoint,
    };
  } else if (towInfo) {
    // Unit has only Tow
    return {
      capacity: 1, // Can tow 1 unit at max toughness, or 2 at half
      type: 'tow',
      maxToughness: towInfo.maxToughness,
    };
  }

  // Fallback to stats.capacity
  if (unit.stats.capacity !== undefined && unit.stats.capacity > 0) {
    return {
      capacity: unit.stats.capacity,
      type: 'capacity',
    };
  }

  return {
    capacity: 0,
    type: 'none',
  };
}

/**
 * Get the effective capacity for a transport unit
 * For Tow units, this is simplified to 2 units max (game rule complexity not fully modeled)
 */
export function getEffectiveCapacity(unit: Unit): number {
  const info = parseTransportCapacity(unit);

  if (info.type === 'tow') {
    // Tow can carry 1 unit at max toughness OR 2 units at half toughness
    // For simplicity, we'll use 2 as the max capacity
    return 2;
  }

  return info.capacity;
}

/**
 * Check if a unit can transport/tow other units
 */
export function canUnitTransportOthers(unit: Unit): boolean {
  const info = parseTransportCapacity(unit);
  return info.capacity > 0;
}

/**
 * Get the desanting capacity for a vehicle
 * All vehicles (unitClass starts with 'Vec') have a default desanting capacity of 2
 * Non-vehicles cannot have desanting units
 */
export function getDesantingCapacity(unit: Unit): number {
  // Only vehicles can have desanting units
  if (unit.stats.unitClass.startsWith('Vec')) {
    return 2;
  }
  return 0;
}

/**
 * Calculate how much capacity a unit consumes when embarked or desanting
 * - Inf (S) or Inf(S) units take 2 capacity slots
 * - All other units take 1 capacity slot
 */
export function getUnitCapacityCost(unit: Unit): number {
  // Infantry (Small) units take 2 capacity slots (handle both formats with and without space)
  if (unit.stats.unitClass === 'Inf (S)' || unit.stats.unitClass === 'Inf(S)') {
    return 2;
  }
  // All other units take 1 capacity slot
  return 1;
}
