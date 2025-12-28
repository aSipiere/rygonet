import { useState, useEffect } from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { Divider } from '@components/common/Divider';
import { useRoster } from '@/hooks/useRoster';
import { UnitSelector } from '@/components/armyBuilder/UnitSelector';
import { ArmyRoster } from '@/components/armyBuilder/ArmyRoster';
import { RosterSelectionDialog } from '@/components/armyBuilder/RosterSelectionDialog';

export default function RosterBuilderPage() {
  const { currentRoster, createRoster, loadRoster, addUnit, savedRosters, isEditMode, isSharedRoster } = useRoster();
  const [showRosterDialog, setShowRosterDialog] = useState(false);

  // Update dialog visibility based on roster state
  useEffect(() => {
    // Don't show dialog if we have a current roster (including shared rosters)
    if (currentRoster) {
      setShowRosterDialog(false);
    } else {
      // Only show dialog if we don't have a roster and it's not being loaded
      setShowRosterDialog(true);
    }
  }, [currentRoster]);

  // If no roster selected, show selection dialog
  if (!currentRoster) {
    if (showRosterDialog) {
      return (
        <RosterSelectionDialog
          savedRosters={savedRosters}
          onCreateNew={(name, factionId, pointsLimit) => {
            createRoster(name, factionId, pointsLimit);
            setShowRosterDialog(false);
          }}
          onLoadExisting={(roster) => {
            loadRoster(roster);
            setShowRosterDialog(false);
          }}
        />
      );
    }
    // Loading state while waiting for shared roster
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="primary.main">
          Loading roster...
        </Typography>
      </Box>
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
        <Grid xs={12} md={5}>
          <UnitSelector factionId={currentRoster.factionId} onAddUnit={addUnit} isEditMode={isEditMode} />
        </Grid>

        {/* Right: Current Roster */}
        <Grid xs={12} md={7}>
          <ArmyRoster roster={currentRoster} />
        </Grid>
      </Grid>
    </Box>
  );
}
