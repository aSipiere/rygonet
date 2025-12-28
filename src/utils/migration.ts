import { Roster, RosterUnit } from '../types';

interface LegacyRosterUnit extends Omit<RosterUnit, 'groupId' | 'relationship'> {
  groupId?: never;
  relationship?: never;
}

interface LegacyRoster extends Omit<Roster, 'groups' | 'units'> {
  groups?: never;
  units: LegacyRosterUnit[];
}

export function migrateRosterToV2(roster: Roster | LegacyRoster): Roster {
  // Check if already migrated
  if ('groups' in roster && roster.groups !== undefined) {
    return roster as Roster;
  }

  // Add groups array if missing and ensure units have no groupId or relationship
  return {
    ...roster,
    groups: [],
    units: roster.units.map((unit) => ({
      ...unit,
      groupId: undefined,
      relationship: undefined,
    })),
  };
}

export function migrateAllRosters(rosters: (Roster | LegacyRoster)[]): Roster[] {
  return rosters.map(migrateRosterToV2);
}
