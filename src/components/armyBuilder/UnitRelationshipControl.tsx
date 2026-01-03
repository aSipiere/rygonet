import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { RosterUnit, UnitRelationshipType } from '@/types';
import { useRoster } from '@/hooks/useRoster';
import { useFactionDataContext } from '@/contexts/FactionDataContext';
import { canUnitTransport } from '@/utils/roster';
import { parseTransportCapacity, getDesantingCapacity } from '@/utils/transportCapacity';
import { useHighlight } from './ArmyRoster';

interface UnitRelationshipControlProps {
  rosterUnit: RosterUnit;
}

export function UnitRelationshipControl({ rosterUnit }: UnitRelationshipControlProps) {
  const { currentRoster, setUnitRelationship, clearUnitRelationship } = useRoster();
  const { getUnitById } = useFactionDataContext();
  const { setHighlightedUnitId } = useHighlight();

  if (!currentRoster) return null;

  // Get the current unit definition to check if it's a vehicle
  const currentUnitDef = getUnitById(currentRoster.factionId, rosterUnit.unitId);
  if (!currentUnitDef) return null;

  const isVehicle = currentUnitDef.stats.unitClass.startsWith('Vec');

  // Find available transports in roster (units that can carry, tow, or have desanting capacity)
  const availableTransports = currentRoster.units.filter((u) => {
    if (u.id === rosterUnit.id) return false;
    const unitDef = getUnitById(currentRoster.factionId, u.unitId);
    return unitDef && (canUnitTransport(unitDef) || getDesantingCapacity(unitDef) > 0);
  });

  const handleChange = (value: string) => {
    if (!value) {
      clearUnitRelationship(rosterUnit.id);
    } else {
      const [type, transportId] = value.split(':');
      setUnitRelationship(rosterUnit.id, {
        type: type as UnitRelationshipType,
        transportUnitId: transportId,
      });
    }
  };

  const currentValue = rosterUnit.relationship
    ? `${rosterUnit.relationship.type}:${rosterUnit.relationship.transportUnitId}`
    : '';

  return (
    <Box sx={{ mt: 1 }}>
      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontFamily: 'monospace' }}>Relationship</InputLabel>
        <Select
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          onClose={() => setHighlightedUnitId(null)}
          label="Relationship"
          sx={{ fontFamily: 'monospace' }}
        >
          <MenuItem
            value=""
            sx={{ fontFamily: 'monospace' }}
            onMouseEnter={() => setHighlightedUnitId(null)}
          >
            None
          </MenuItem>
          {availableTransports.map((transport) => {
            const transportDef = getUnitById(currentRoster.factionId, transport.unitId);
            if (!transportDef) return null;

            const transportCapacity = parseTransportCapacity(transportDef);
            const canTow = transportCapacity.type === 'tow';
            const canCarry = transportCapacity.type === 'pc' || transportCapacity.type === 'capacity';
            const canDesant = getDesantingCapacity(transportDef) > 0;

            const options = [];

            // Show embarked if transport has PC capacity
            if (canCarry) {
              options.push(
                <MenuItem
                  key={`embarked-${transport.id}`}
                  value={`embarked:${transport.id}`}
                  sx={{ fontFamily: 'monospace' }}
                  onMouseEnter={() => setHighlightedUnitId(transport.id)}
                  onMouseLeave={() => setHighlightedUnitId(null)}
                >
                  Embarked in {transport.customName || transportDef.name}
                </MenuItem>
              );
            }

            // Show desanting if transport has desanting capacity (all Vec units)
            if (canDesant) {
              options.push(
                <MenuItem
                  key={`desanting-${transport.id}`}
                  value={`desanting:${transport.id}`}
                  sx={{ fontFamily: 'monospace' }}
                  onMouseEnter={() => setHighlightedUnitId(transport.id)}
                  onMouseLeave={() => setHighlightedUnitId(null)}
                >
                  Desanting on {transport.customName || transportDef.name}
                </MenuItem>
              );
            }

            // Only show towed if current unit is a vehicle AND transport can tow
            if (isVehicle && canTow) {
              options.push(
                <MenuItem
                  key={`towed-${transport.id}`}
                  value={`towed:${transport.id}`}
                  sx={{ fontFamily: 'monospace' }}
                  onMouseEnter={() => setHighlightedUnitId(transport.id)}
                  onMouseLeave={() => setHighlightedUnitId(null)}
                >
                  Towed by {transport.customName || transportDef.name}
                </MenuItem>
              );
            }

            return options;
          })}
        </Select>
      </FormControl>
    </Box>
  );
}
