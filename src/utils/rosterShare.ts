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
      units: roster.units.map(unit => {
        // Convert transportUnitId to transportUnitIndex for reliable decoding
        let relationship: any = unit.relationship;
        if (relationship) {
          const transportIndex = roster.units.findIndex(u => u.id === relationship!.transportUnitId);
          relationship = {
            type: relationship.type,
            transportUnitIndex: transportIndex,
          };
        }

        return {
          unitId: unit.unitId,
          count: unit.count,
          ...(unit.customName && { customName: unit.customName }),
          ...(unit.selectedOptions && unit.selectedOptions.length > 0 && { selectedOptions: unit.selectedOptions }),
          ...(unit.groupId && { groupId: unit.groupId }),
          ...(relationship && { relationship }),
        };
      }),
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

    // First pass: Create all units with new IDs
    const newUnits = minimalRoster.units.map((unit: any) => ({
      id: crypto.randomUUID(),
      unitId: unit.unitId,
      count: unit.count,
      customName: unit.customName,
      selectedOptions: unit.selectedOptions,
      groupId: unit.groupId,
      relationship: unit.relationship, // Keep temporarily, will be updated
    }));

    // Second pass: Update relationship transportUnitId using the index
    minimalRoster.units.forEach((unit: any, index: number) => {
      if (unit.relationship?.transportUnitIndex !== undefined) {
        const transportIndex = unit.relationship.transportUnitIndex;
        if (transportIndex >= 0 && transportIndex < newUnits.length) {
          // Update the relationship to use the new transport unit ID
          newUnits[index].relationship = {
            type: unit.relationship.type,
            transportUnitId: newUnits[transportIndex].id,
          };
        }
      } else if (unit.relationship?.transportUnitId) {
        // Handle legacy encoded rosters that still use transportUnitId
        // This maintains backwards compatibility but won't work correctly
        // (relationships will be broken for old share links)
        newUnits[index].relationship = unit.relationship;
      }
    });

    const roster: Roster = {
      id: crypto.randomUUID(),
      name: minimalRoster.name,
      factionId: minimalRoster.factionId,
      pointsLimit: minimalRoster.pointsLimit,
      units: newUnits,
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
