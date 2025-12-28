import { Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Divider } from '@components/common/Divider';
import { useRoster } from '@/hooks/useRoster';
import { UnitSelector } from '@/components/armyBuilder/UnitSelector';
import { ArmyRoster } from '@/components/armyBuilder/ArmyRoster';
import { RosterSelectionDialog } from '@/components/armyBuilder/RosterSelectionDialog';

export default function RosterBuilderPage() {
  const { currentRoster, createRoster, loadRoster, addUnit, savedRosters, isEditMode } = useRoster();

  // If no roster selected, show selection dialog
  if (!currentRoster) {
    return (
      <RosterSelectionDialog
        savedRosters={savedRosters}
        onCreateNew={(name, factionId, pointsLimit) => {
          createRoster(name, factionId, pointsLimit);
        }}
        onLoadExisting={(roster) => {
          loadRoster(roster);
        }}
      />
    );
  }

  return (
    <Box>
      <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', textAlign: 'center', fontFamily: 'monospace' }}>
        [ROSTER CONSTRUCTION INTERFACE]
      </Typography>

      <Divider variant="bracketed" text="ARMY BUILDER" />

      {/* Two-column layout */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Left: Unit Selector */}
        <Grid size={{ xs: 12, md: 5 }}>
          <UnitSelector factionId={currentRoster.factionId} onAddUnit={addUnit} isEditMode={isEditMode} />
        </Grid>

        {/* Right: Current Roster */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ArmyRoster roster={currentRoster} />
        </Grid>
      </Grid>
    </Box>
  );
}
