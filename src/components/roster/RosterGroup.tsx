import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';
import { Unit } from '@/types/unit';
import { Divider } from '@components/common/Divider';
import { UnitCard } from './UnitCard';

interface RosterGroupProps {
  categoryName: string;
  units: Unit[];
}

export function RosterGroup({ categoryName, units }: RosterGroupProps) {
  if (units.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Divider variant="bracketed" text={categoryName.toUpperCase()} />
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {units.map((unit) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={unit.id}>
            <UnitCard unit={unit} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
