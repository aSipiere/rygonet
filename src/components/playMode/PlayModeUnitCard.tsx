import { Typography, Box, Stack, ToggleButton, ToggleButtonGroup, Chip } from '@mui/material';
import { RosterUnit } from '@/types';
import { useFactionDataContext } from '@/contexts/FactionDataContext';
import { useRoster } from '@/hooks/useRoster';
import { parsePoints } from '@/utils/roster';
import { BaseUnitCard } from '@/components/common/BaseUnitCard';

interface PlayModeUnitCardProps {
  rosterUnit: RosterUnit;
  factionId: string;
}

export function PlayModeUnitCard({ rosterUnit, factionId }: PlayModeUnitCardProps) {
  const { getUnitById } = useFactionDataContext();
  const { updateUnit, currentRoster } = useRoster();

  const unitDef = getUnitById(factionId, rosterUnit.unitId);
  if (!unitDef) return null;

  // Calculate points with options
  let unitPoints = parsePoints(unitDef.points);
  if (rosterUnit.selectedOptions && unitDef.options) {
    rosterUnit.selectedOptions.forEach((optionIndex) => {
      const option = unitDef.options![optionIndex];
      if (option && option.points) {
        unitPoints += option.points;
      }
    });
  }

  // Get transport name if unit is related to a transport
  let transportName = '';
  if (rosterUnit.relationship?.transportUnitId) {
    const transportRosterUnit = currentRoster?.units.find(
      (u) => u.id === rosterUnit.relationship!.transportUnitId
    );
    if (transportRosterUnit) {
      const transportDef = getUnitById(factionId, transportRosterUnit.unitId);
      if (transportDef) {
        transportName = transportDef.name;
      }
    }
  }

  // Handle relationship state change
  const handleRelationshipChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue === 'none' || newValue === null) {
      // Clear relationship
      updateUnit({
        ...rosterUnit,
        relationship: undefined,
      });
    } else {
      // Set or update relationship type
      updateUnit({
        ...rosterUnit,
        relationship: {
          type: newValue as 'embarked' | 'desanting' | 'towed',
          transportUnitId: rosterUnit.relationship?.transportUnitId || '', // Keep existing transport or empty
        },
      });
    }
  };

  // Relationship status and toggles content
  const relationshipContent = (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
          UNIT STATE:
        </Typography>
      </Box>
      {rosterUnit.relationship && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            label={`${rosterUnit.relationship.type.toUpperCase()}`}
            color="secondary"
            size="small"
            sx={{ fontFamily: 'monospace' }}
          />
          {transportName && (
            <Typography variant="caption" color="text.secondary">
              in/on {transportName}
            </Typography>
          )}
        </Stack>
      )}
      <ToggleButtonGroup
        value={rosterUnit.relationship?.type || 'none'}
        exclusive
        onChange={handleRelationshipChange}
        size="small"
        sx={{ fontFamily: 'monospace' }}
      >
        <ToggleButton value="none" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          None
        </ToggleButton>
        <ToggleButton value="embarked" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          Embarked
        </ToggleButton>
        <ToggleButton value="desanting" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          Desanting
        </ToggleButton>
        <ToggleButton value="towed" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          Towed
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  return (
    <BaseUnitCard
      unit={unitDef}
      displayPoints={unitPoints}
      selectedOptions={rosterUnit.selectedOptions}
      postWeaponsContent={relationshipContent}
    />
  );
}
