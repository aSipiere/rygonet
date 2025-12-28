import { Roster } from '../types';

export function migrateRosterToV2(roster: any): Roster {
  // Check if already migrated
  if (roster.groups !== undefined) {
    return roster;
  }

  // Add groups array if missing and ensure units have no groupId or relationship
  return {
    ...roster,
    groups: [],
    units: roster.units.map((unit: any) => ({
      ...unit,
      groupId: undefined,
      relationship: undefined,
    })),
  };
}

export function migrateAllRosters(rosters: any[]): Roster[] {
  return rosters.map(migrateRosterToV2);
}
