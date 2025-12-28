import { Typography, Box, Stack, ToggleButton, ToggleButtonGroup, Chip } from '@mui/material';
import { RosterUnit } from '@/types';
import { useFactionDataContext } from '@/contexts/FactionDataContext';
import { useRoster } from '@/hooks/useRoster';
import { TerminalBox } from '@/components/common/TerminalBox';
import { Divider } from '@/components/common/Divider';
import { StatsDisplay } from '@/components/roster/StatsDisplay';
import { WeaponDisplay } from '@/components/roster/WeaponDisplay';

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
  let unitPoints = unitDef.points;
  if (rosterUnit.selectedOptions && unitDef.options) {
    rosterUnit.selectedOptions.forEach((optionIndex) => {
      const option = unitDef.options![optionIndex];
      if (option && option.points) {
        unitPoints += option.points;
      }
    });
  }
  const totalPoints = unitPoints * rosterUnit.count;

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

  return (
    <Box sx={{ height: '100%' }}>
      <TerminalBox title={unitDef.name} variant="single">
        {/* Header with count and points */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            CATEGORY: <Box component="span" sx={{ color: 'primary.main' }}>{unitDef.category}</Box>
            {unitDef.subcategory && ` (${unitDef.subcategory})`}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
            x{rosterUnit.count} | {totalPoints} pts
          </Typography>
        </Box>
      </Box>

      {/* Relationship status and toggles */}
      <Box sx={{ mb: 2 }}>
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

      {/* Selected Options */}
      {rosterUnit.selectedOptions && rosterUnit.selectedOptions.length > 0 && unitDef.options && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
            EQUIPPED:
          </Typography>
          {rosterUnit.selectedOptions.map((optionIndex) => {
            const option = unitDef.options![optionIndex];
            if (!option) return null;
            return (
              <Typography key={optionIndex} variant="caption" display="block" color="text.secondary">
                &gt; {option.description}
                {option.points !== undefined && ` (+${option.points} pts)`}
              </Typography>
            );
          })}
        </Box>
      )}

      <Divider variant="simple" />

      {/* Stats Section */}
      <Box sx={{ my: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
          STATS
        </Typography>
        <StatsDisplay stats={unitDef.stats} />
      </Box>

      {/* Weapons Section */}
      {unitDef.weapons && unitDef.weapons.length > 0 && (
        <>
          <Divider variant="simple" />
          <Box sx={{ my: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
              WEAPONS
            </Typography>
            {unitDef.weapons.map((weapon, idx) => (
              <WeaponDisplay key={idx} weapon={weapon} />
            ))}
          </Box>
        </>
      )}

      {/* Special Rules Section */}
      {unitDef.specialRules && unitDef.specialRules.length > 0 && (
        <>
          <Divider variant="simple" />
          <Box sx={{ my: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
              SPECIAL RULES
            </Typography>
            {unitDef.specialRules.map((rule, idx) => (
              <Typography key={idx} variant="caption" display="block" color="text.secondary">
                &gt; {rule.name.toUpperCase()}
              </Typography>
            ))}
          </Box>
        </>
      )}
      </TerminalBox>
    </Box>
  );
}
