import { Roster, RosterUnit, Unit, TransportValidation } from '../types';
import { getEffectiveCapacity, getDesantingCapacity } from './transportCapacity';

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

  // Find all units that can transport (PC capacity or desanting capacity)
  const transports = rosterUnits.filter(({ unit }) =>
    getEffectiveCapacity(unit) > 0 || getDesantingCapacity(unit) > 0
  );

  transports.forEach(({ rosterUnit: transportUnit, unit: transportDef }) => {
    const pcCapacity = getEffectiveCapacity(transportDef);
    const desantingCapacity = getDesantingCapacity(transportDef);

    // Find embarked units (use PC capacity)
    const embarkedUnits = rosterUnits.filter(({ rosterUnit }) =>
      rosterUnit.relationship?.transportUnitId === transportUnit.id &&
      rosterUnit.relationship?.type === 'embarked'
    );

    // Find desanting units (use desanting capacity)
    const desantingUnits = rosterUnits.filter(({ rosterUnit }) =>
      rosterUnit.relationship?.transportUnitId === transportUnit.id &&
      rosterUnit.relationship?.type === 'desanting'
    );

    // Calculate loads separately
    const embarkedLoad = embarkedUnits.reduce(
      (sum, { rosterUnit }) => sum + rosterUnit.count,
      0
    );

    const desantingLoad = desantingUnits.reduce(
      (sum, { rosterUnit }) => sum + rosterUnit.count,
      0
    );

    const errors: string[] = [];

    // Validate embarked capacity
    if (embarkedLoad > pcCapacity) {
      errors.push(`Embarked overcapacity: ${embarkedLoad}/${pcCapacity} models`);
    }

    // Validate desanting capacity
    if (desantingLoad > desantingCapacity) {
      errors.push(`Desanting overcapacity: ${desantingLoad}/${desantingCapacity} units`);
    }

    // Combine all transported units for display
    const allTransportedUnits = [...embarkedUnits, ...desantingUnits];
    const totalLoad = embarkedLoad + desantingLoad;

    validations.push({
      transportUnit,
      capacity: pcCapacity, // Keep PC capacity as primary for backwards compatibility
      currentLoad: totalLoad,
      embarkedUnits: allTransportedUnits.map((item) => item.rosterUnit),
      isValid: embarkedLoad <= pcCapacity && desantingLoad <= desantingCapacity,
      errors,
      // New separate capacity fields
      pcCapacity,
      embarkedLoad,
      desantingCapacity,
      desantingLoad,
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
