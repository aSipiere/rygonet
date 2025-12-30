import { RosterUnit, Unit, RosterGroup } from '../types';
import { generateRandomGroupName } from './nameGenerator';
import { getEffectiveCapacity } from './transportCapacity';

/**
 * Parse a points value which can be a number or a string like "10/15"
 * For string values, returns the first number
 */
export function parsePoints(points: number | string): number {
  if (typeof points === 'number') {
    return points;
  }
  // Handle split costs like "10/15" - take the first value
  const match = points.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function calculateTotalPoints(
  rosterUnits: { rosterUnit: RosterUnit; unit: Unit }[]
): number {
  return rosterUnits.reduce((total, { rosterUnit, unit }) => {
    let unitTotal = parsePoints(unit.points);

    // Add selected options points
    if (rosterUnit.selectedOptions && unit.options) {
      rosterUnit.selectedOptions.forEach((optionIndex) => {
        const option = unit.options![optionIndex];
        if (option && option.points) {
          unitTotal += option.points;
        }
      });
    }

    // Multiply by count
    return total + unitTotal * rosterUnit.count;
  }, 0);
}

export function categorizeUnits(units: Unit[]): Record<string, Unit[]> {
  const categorized: Record<string, Unit[]> = {};

  units.forEach((unit) => {
    if (!categorized[unit.category]) {
      categorized[unit.category] = [];
    }
    categorized[unit.category].push(unit);
  });

  return categorized;
}

export function sortUnitsByName(units: Unit[]): Unit[] {
  return [...units].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortUnitsByPoints(units: Unit[]): Unit[] {
  return [...units].sort((a, b) => parsePoints(a.points) - parsePoints(b.points));
}

// Group management helpers
export function createGroup(name?: string): RosterGroup {
  return {
    id: crypto.randomUUID(),
    name: name || generateRandomGroupName(),
    collapsed: false,
  };
}

export function getUnitsInGroup(
  units: RosterUnit[],
  groupId: string
): RosterUnit[] {
  return units.filter((unit) => unit.groupId === groupId);
}

export function getUngroupedUnits(units: RosterUnit[]): RosterUnit[] {
  return units.filter((unit) => !unit.groupId);
}

// Relationship helpers
export function getTransportedUnits(
  units: RosterUnit[],
  transportId: string
): RosterUnit[] {
  return units.filter((unit) => unit.relationship?.transportUnitId === transportId);
}

export function canUnitBeTransported(unit: Unit): boolean {
  return unit.unitClass.startsWith('Inf') || unit.unitClass.startsWith('Vec'); // Infantry and vehicles can be transported/towed
}

export function canUnitTransport(unit: Unit): boolean {
  return getEffectiveCapacity(unit) > 0;
}
