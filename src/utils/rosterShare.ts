import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { Roster } from '../types';

/**
 * Encode a roster into a shareable URL-safe string
 * Strips unnecessary data to minimize size
 */
export function encodeRosterForSharing(roster: Roster): string {
  try {
    // Create a minimal version of the roster for sharing
    const minimalRoster = {
      name: roster.name,
      factionId: roster.factionId,
      pointsLimit: roster.pointsLimit,
      units: roster.units.map(unit => ({
        unitId: unit.unitId,
        count: unit.count,
        ...(unit.customName && { customName: unit.customName }),
        ...(unit.selectedOptions && unit.selectedOptions.length > 0 && { selectedOptions: unit.selectedOptions }),
        ...(unit.groupId && { groupId: unit.groupId }),
        ...(unit.relationship && { relationship: unit.relationship }),
      })),
      groups: roster.groups.map(group => ({
        id: group.id,
        name: group.name,
      })),
    };

    const json = JSON.stringify(minimalRoster);
    const compressed = compressToEncodedURIComponent(json);
    return compressed;
  } catch (error) {
    console.error('Failed to encode roster:', error);
    throw new Error('Failed to create share link');
  }
}

/**
 * Decode a roster from a share string
 * Reconstructs missing data (IDs, timestamps)
 */
export function decodeRosterFromShare(shareCode: string): Roster | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(shareCode);
    if (!decompressed) {
      return null;
    }
    const minimalRoster = JSON.parse(decompressed);

    // Reconstruct full roster with generated IDs and timestamps
    const now = new Date().toISOString();
    const roster: Roster = {
      id: crypto.randomUUID(),
      name: minimalRoster.name,
      factionId: minimalRoster.factionId,
      pointsLimit: minimalRoster.pointsLimit,
      units: minimalRoster.units.map((unit: any) => ({
        id: crypto.randomUUID(),
        unitId: unit.unitId,
        count: unit.count,
        customName: unit.customName,
        selectedOptions: unit.selectedOptions,
        groupId: unit.groupId,
        relationship: unit.relationship,
      })),
      groups: minimalRoster.groups.map((group: any) => ({
        id: group.id,
        name: group.name,
      })),
      createdAt: now,
      updatedAt: now,
    };

    return roster;
  } catch (error) {
    console.error('Failed to decode roster:', error);
    return null;
  }
}

/**
 * Generate a full share URL pointing to the builder page
 */
export function generateShareURL(roster: Roster): string {
  const encoded = encodeRosterForSharing(roster);
  const baseURL = window.location.origin + '/builder';
  return `${baseURL}#share=${encoded}`;
}

/**
 * Extract share code from current URL hash
 */
export function getShareCodeFromURL(): string | null {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#share=')) {
    return null;
  }
  return hash.substring(7); // Remove '#share='
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Clear share code from URL without reloading page
 */
export function clearShareCodeFromURL(): void {
  if (window.location.hash.startsWith('#share=')) {
    history.replaceState(null, '', window.location.pathname);
  }
}
