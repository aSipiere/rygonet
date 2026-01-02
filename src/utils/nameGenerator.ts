const NATO_ALPHABET = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliet',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
  'Uniform',
  'Victor',
  'Whiskey',
  'X-ray',
  'Yankee',
  'Zulu',
];

/**
 * Generate a sequential group name using NATO phonetic alphabet
 * @param index The sequential index (0-based) for the group
 * @returns A group name like "Alpha", "Bravo", etc.
 */
export function generateSequentialGroupName(index: number): string {
  if (index < NATO_ALPHABET.length) {
    return NATO_ALPHABET[index];
  }
  // If we exceed 26 groups, start adding numbers: "Alpha 2", "Bravo 2", etc.
  const cycle = Math.floor(index / NATO_ALPHABET.length);
  const alphabetIndex = index % NATO_ALPHABET.length;
  return `${NATO_ALPHABET[alphabetIndex]} ${cycle + 1}`;
}

/**
 * @deprecated Use generateSequentialGroupName instead
 */
export function generateRandomGroupName(): string {
  // For backwards compatibility, just return Alpha for now
  return generateSequentialGroupName(0);
}
