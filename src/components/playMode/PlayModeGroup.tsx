import Grid from '@mui/material/Grid';
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
        {units.flatMap((rosterUnit) => {
          // Create array of grid items for each duplicate
          const count = rosterUnit.count || 1;
          const items = [];
          for (let i = 0; i < count; i++) {
            items.push(
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${rosterUnit.id}-${i}`}>
                <PlayModeUnitCard
                  rosterUnit={{ ...rosterUnit, count: 1 }}
                  factionId={factionId}
                />
              </Grid>
            );
          }
          return items;
        })}
      </Grid>
    </TerminalBox>
  );
}
