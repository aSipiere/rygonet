import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { RosterUnit, UnitRelationshipType } from '@/types';
import { useRoster } from '@/hooks/useRoster';
import { useFactionDataContext } from '@/contexts/FactionDataContext';
import { canUnitTransport } from '@/utils/roster';

interface UnitRelationshipControlProps {
  rosterUnit: RosterUnit;
}

export function UnitRelationshipControl({ rosterUnit }: UnitRelationshipControlProps) {
  const { currentRoster, setUnitRelationship, clearUnitRelationship } = useRoster();
  const { getUnitById } = useFactionDataContext();

  if (!currentRoster) return null;

  // Find available transports in roster
  const availableTransports = currentRoster.units.filter((u) => {
    if (u.id === rosterUnit.id) return false;
    const unitDef = getUnitById(currentRoster.factionId, u.unitId);
    return unitDef && canUnitTransport(unitDef);
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
          label="Relationship"
          sx={{ fontFamily: 'monospace' }}
        >
          <MenuItem value="" sx={{ fontFamily: 'monospace' }}>
            None
          </MenuItem>
          {availableTransports.map((transport) => {
            const transportDef = getUnitById(currentRoster.factionId, transport.unitId);
            if (!transportDef) return null;

            return [
              <MenuItem
                key={`embarked-${transport.id}`}
                value={`embarked:${transport.id}`}
                sx={{ fontFamily: 'monospace' }}
              >
                Embarked in {transportDef.name}
              </MenuItem>,
              <MenuItem
                key={`desanting-${transport.id}`}
                value={`desanting:${transport.id}`}
                sx={{ fontFamily: 'monospace' }}
              >
                Desanting on {transportDef.name}
              </MenuItem>,
              <MenuItem
                key={`towed-${transport.id}`}
                value={`towed:${transport.id}`}
                sx={{ fontFamily: 'monospace' }}
              >
                Towed by {transportDef.name}
              </MenuItem>,
            ];
          })}
        </Select>
      </FormControl>
    </Box>
  );
}
