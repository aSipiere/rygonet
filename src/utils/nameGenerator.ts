const PREFIXES = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Ghost',
  'Hunter',
  'Iron',
  'Kodiak',
  'Lightning',
  'Maverick',
  'Night',
  'Oscar',
  'Phoenix',
  'Raven',
  'Shadow',
  'Storm',
  'Thunder',
  'Viper',
  'Wolf',
  'Zulu',
];

const SUFFIXES = [
  'Battalion',
  'Brigade',
  'Company',
  'Detachment',
  'Division',
  'Element',
  'Force',
  'Group',
  'Legion',
  'Platoon',
  'Regiment',
  'Squad',
  'Strike Team',
  'Task Force',
  'Team',
  'Troop',
  'Unit',
  'Wing',
];

export function generateRandomGroupName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];

  return `${prefix} ${suffix}`;
}
