import { Roster, RosterUnit, Unit, TransportValidation } from '../types';
import { getEffectiveCapacity } from './transportCapacity';

export interface ValidationError {
  type: 'warning' | 'error';
  message: string;
}

export function validateTACOMS(
  rosterUnits: { rosterUnit: RosterUnit; unit: Unit }[],
  totalPoints: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Calculate required TACOMS (1 per 100 points, rounded up)
  const requiredTACOMS = Math.ceil(totalPoints / 100);

  // Count TACOMS units
  const tacomsCount = rosterUnits.reduce((count, { rosterUnit, unit }) => {
    return count + (unit.category === 'TACOMS' ? rosterUnit.count : 0);
  }, 0);

  if (tacomsCount < requiredTACOMS) {
    errors.push({
      type: 'error',
      message: `Insufficient TACOMS: ${tacomsCount}/${requiredTACOMS} required (1 per 100 points)`,
    });
  }

  return errors;
}

export function validateTransportCapacity(
  rosterUnits: { rosterUnit: RosterUnit; unit: Unit }[]
): TransportValidation[] {
  const validations: TransportValidation[] = [];

  // Find all units with capacity (transports)
  const transports = rosterUnits.filter(({ unit }) => getEffectiveCapacity(unit) > 0);

  transports.forEach(({ rosterUnit: transportUnit, unit: transportDef }) => {
    const capacity = getEffectiveCapacity(transportDef);

    // Find all units embarked/desanting on this transport
    const embarkedUnits = rosterUnits.filter(({ rosterUnit }) =>
      rosterUnit.relationship?.transportUnitId === transportUnit.id &&
      (rosterUnit.relationship?.type === 'embarked' || rosterUnit.relationship?.type === 'desanting')
    );

    // Calculate current load (count * unit count)
    const currentLoad = embarkedUnits.reduce(
      (sum, { rosterUnit }) => sum + rosterUnit.count,
      0
    );

    const errors: string[] = [];
    if (currentLoad > capacity) {
      errors.push(`Overcapacity: ${currentLoad}/${capacity} models`);
    }

    validations.push({
      transportUnit,
      capacity,
      currentLoad,
      embarkedUnits: embarkedUnits.map((item) => item.rosterUnit),
      isValid: currentLoad <= capacity,
      errors,
    });
  });

  return validations;
}

export function validateRoster(
  roster: Roster,
  rosterUnits: { rosterUnit: RosterUnit; unit: Unit }[],
  totalPoints: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check points limit
  if (totalPoints > roster.pointsLimit) {
    errors.push({
      type: 'error',
      message: `Roster exceeds points limit by ${totalPoints - roster.pointsLimit} points`,
    });
  }

  // Check if roster is empty
  if (roster.units.length === 0) {
    errors.push({
      type: 'warning',
      message: 'Roster has no units',
    });
  }

  // Check for invalid units
  const invalidUnits = roster.units.filter((ru) => {
    return !rosterUnits.find((item) => item.rosterUnit.id === ru.id);
  });

  if (invalidUnits.length > 0) {
    errors.push({
      type: 'error',
      message: `Found ${invalidUnits.length} invalid unit(s)`,
    });
  }

  // TACOMS validation
  errors.push(...validateTACOMS(rosterUnits, totalPoints));

  // Transport capacity validation
  const transportValidations = validateTransportCapacity(rosterUnits);
  transportValidations.forEach((validation) => {
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        errors.push({
          type: 'error',
          message: `Transport ${validation.transportUnit.id}: ${error}`,
        });
      });
    }
  });

  return errors;
}
