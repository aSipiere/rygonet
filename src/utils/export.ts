import { Roster, RosterUnit, Unit } from '../types';
import { parsePoints, getUnitsInGroup, getUngroupedUnits } from './roster';
import { copyToClipboard } from './rosterShare';

export function exportToJSON(roster: Roster) {
  const dataStr = JSON.stringify(roster, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${roster.name.replace(/\s+/g, '_')}_roster.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportToPDF(roster: Roster) {
  // Navigate to print page which will have print styles
  window.open(`/print/${roster.id}`, '_blank');
}

export function shareRoster(roster: Roster): string {
  // Generate a shareable URL (for future implementation)
  const baseUrl = window.location.origin;
  return `${baseUrl}/builder/${roster.id}`;
}

/**
 * Export roster as formatted text and copy to clipboard
 */
export async function exportToText(
  roster: Roster,
  factionName: string,
  getUnitById: (factionId: string, unitId: string) => Unit | undefined
): Promise<boolean> {
  try {
    const text = generateTextExport(roster, factionName, getUnitById);
    return await copyToClipboard(text);
  } catch (error) {
    console.error('Failed to export to text:', error);
    return false;
  }
}

/**
 * Generate formatted text representation of roster
 */
function generateTextExport(
  roster: Roster,
  factionName: string,
  getUnitById: (factionId: string, unitId: string) => Unit | undefined
): string {
  const lines: string[] = [];

  // Calculate total points and command
  let totalPoints = 0;
  let totalCommand = 0;

  const unitsWithData = roster.units.map(rosterUnit => {
    const unit = getUnitById(roster.factionId, rosterUnit.unitId);
    return { rosterUnit, unit };
  }).filter(item => item.unit !== undefined) as Array<{ rosterUnit: RosterUnit; unit: Unit }>;

  // Calculate totals
  unitsWithData.forEach(({ rosterUnit, unit }) => {
    let unitPoints = parsePoints(unit.points);

    // Add option points
    if (rosterUnit.selectedOptions && unit.options) {
      rosterUnit.selectedOptions.forEach(optionIndex => {
        const option = unit.options![optionIndex];
        if (option && option.points) {
          unitPoints += option.points;
        }
      });
    }

    totalPoints += unitPoints;

    // Add command
    if (unit.stats.command) {
      totalCommand += unit.stats.command;
    }
  });

  // Header
  lines.push(`${factionName.toUpperCase()}, "${roster.name.toUpperCase()}"`);
  lines.push(`${totalPoints} PTS, ${totalCommand} COMMAND`);
  lines.push('__________________________');

  // Helper to format unit name to title case with quotes around last word
  const formatUnitName = (name: string): string => {
    const words = name.split(' ');
    if (words.length === 0) return name;

    // Convert all words to title case
    const titleCaseWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    // Put quotes around the last word
    const lastWord = titleCaseWords[titleCaseWords.length - 1];
    titleCaseWords[titleCaseWords.length - 1] = `"${lastWord}"`;

    return titleCaseWords.join(' ');
  };

  // Helper function to format a unit
  const formatUnit = (rosterUnit: RosterUnit, unit: Unit, isTransported: boolean = false, blind: string = ''): string[] => {
    const unitLines: string[] = [];

    // Calculate unit points
    let unitPoints = parsePoints(unit.points);
    if (rosterUnit.selectedOptions && unit.options) {
      rosterUnit.selectedOptions.forEach(optionIndex => {
        const option = unit.options![optionIndex];
        if (option && option.points) {
          unitPoints += option.points;
        }
      });
    }

    // Format the unit name
    const rawName = rosterUnit.customName || unit.name;
    const displayName = formatUnitName(rawName);
    const pointsDisplay = unitPoints === 0 ? '0 pts (TACOM)' : `${unitPoints} pts`;

    // Format relationship tag for transported units
    let relationshipTag = '';
    if (isTransported && rosterUnit.relationship) {
      const type = rosterUnit.relationship.type;
      relationshipTag = type === 'embarked' ? '[E] ' : type === 'desanting' ? '[D] ' : '[T] ';
    }

    // Add prefix for transported units
    const prefix = isTransported ? '- ' : '';

    // Add blind identifier if provided
    const blindTag = blind ? `(${blind}) ` : '';

    unitLines.push(`${prefix}${blindTag}${relationshipTag}${displayName} - ${pointsDisplay}`);

    return unitLines;
  };

  // Helper to get units that are transported by a specific unit
  const getTransportedUnits = (transportId: string): Array<{ rosterUnit: RosterUnit; unit: Unit }> => {
    return unitsWithData.filter(({ rosterUnit }) =>
      rosterUnit.relationship?.transportUnitId === transportId
    );
  };

  // Helper to check if unit is transported (has a relationship)
  const isTransported = (rosterUnit: RosterUnit): boolean => {
    return !!rosterUnit.relationship;
  };

  // Process groups
  const processGroup = (groupName: string, groupUnits: RosterUnit[]) => {
    if (groupUnits.length === 0) return;

    lines.push(`${groupName}`);

    // Get group letter from first character of group name
    const groupLetter = groupName.charAt(0).toUpperCase();
    let unitCounter = 1;

    groupUnits.forEach(rosterUnit => {
      const unit = getUnitById(roster.factionId, rosterUnit.unitId);
      if (!unit) return;

      // Skip if this unit is transported (it will be rendered under its transport)
      if (isTransported(rosterUnit)) return;

      // Generate blind for this unit
      const blind = `${groupLetter}${unitCounter}`;
      unitCounter++;

      // Render the unit
      formatUnit(rosterUnit, unit, false, blind).forEach(line => lines.push(line));

      // Render transported units under this unit
      const transportedUnits = getTransportedUnits(rosterUnit.id);
      transportedUnits.forEach(({ rosterUnit: transportedRosterUnit, unit: transportedUnit }) => {
        const transportedBlind = `${groupLetter}${unitCounter}`;
        unitCounter++;
        formatUnit(transportedRosterUnit, transportedUnit, true, transportedBlind).forEach(line => lines.push(line));
      });
    });
  };

  // Process each group
  roster.groups.forEach(group => {
    const groupUnits = getUnitsInGroup(roster.units, group.id);
    processGroup(group.name, groupUnits);
  });

  // Process ungrouped units
  const ungroupedUnits = getUngroupedUnits(roster.units);
  if (ungroupedUnits.length > 0) {
    processGroup('Ungrouped', ungroupedUnits);
  }

  // Add legend
  lines.push('* [E] - Embarked | [D] - Desanting | [T] - Towed');

  return lines.join('\n');
}
