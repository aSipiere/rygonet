import { Box, Grid } from '@mui/material';
import { RosterGroup, RosterUnit } from '@/types';
import { TerminalBox } from '@/components/common/TerminalBox';
import { PlayModeUnitCard } from './PlayModeUnitCard';

interface PlayModeGroupProps {
  group: RosterGroup | null;
  units: RosterUnit[];
  factionId: string;
}

export function PlayModeGroup({ group, units, factionId }: PlayModeGroupProps) {
  if (units.length === 0) return null;

  const title = group ? group.name.toUpperCase() : 'UNGROUPED UNITS';

  return (
    <TerminalBox title={title} variant="heavy">
      <Grid container spacing={2}>
        {units.map((rosterUnit) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={rosterUnit.id}>
            <PlayModeUnitCard
              rosterUnit={rosterUnit}
              factionId={factionId}
            />
          </Grid>
        ))}
      </Grid>
    </TerminalBox>
  );
}
