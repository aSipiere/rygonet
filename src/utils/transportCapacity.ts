import { Unit } from '@/types';

export interface TransportCapacityInfo {
  capacity: number;
  type: 'pc' | 'tow' | 'capacity' | 'none';
  exitPoint?: string; // For PC: "Rear", "Sides", etc.
  maxToughness?: number; // For Tow
}

/**
 * Parse transport capacity from unit special rules or stats
 * Supports:
 * - PC(Rear, 2) - Personnel Carrier, exits from rear, carries 2 units
 * - PC(1, Sides) - Personnel Carrier, carries 1 unit, exits from sides
 * - Tow(4) - Can tow 1 unit with max toughness 4, or 2 units with max toughness 2
 * - Fallback to stats.capacity if no special rules found
 */
export function parseTransportCapacity(unit: Unit): TransportCapacityInfo {
  // Check special rules for PC() or Tow() notation
  if (unit.specialRules) {
    for (const rule of unit.specialRules) {
      const ruleName = typeof rule === 'string' ? rule : rule.name;

      // Match PC(Rear, 2) or PC(2, Sides) formats
      const pcMatch = ruleName.match(/PC\(([^,]+),\s*(\d+)\)|PC\((\d+),\s*([^)]+)\)/i);
      if (pcMatch) {
        if (pcMatch[1]) {
          // Format: PC(Rear, 2)
          return {
            capacity: parseInt(pcMatch[2]),
            type: 'pc',
            exitPoint: pcMatch[1].trim(),
          };
        } else {
          // Format: PC(2, Sides)
          return {
            capacity: parseInt(pcMatch[3]),
            type: 'pc',
            exitPoint: pcMatch[4].trim(),
          };
        }
      }

      // Match Tow(4) format
      const towMatch = ruleName.match(/Tow\((\d+)\)/i);
      if (towMatch) {
        return {
          capacity: 1, // Can tow 1 unit at max toughness, or 2 at half
          type: 'tow',
          maxToughness: parseInt(towMatch[1]),
        };
      }
    }
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
 * All vehicles (unitType 'Vec') have a default desanting capacity of 2
 * Non-vehicles cannot have desanting units
 */
export function getDesantingCapacity(unit: Unit): number {
  // Only vehicles can have desanting units
  if (unit.stats.unitType === 'Vec') {
    return 2;
  }
  return 0;
}
