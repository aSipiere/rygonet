import { Box, Typography, LinearProgress } from '@mui/material';
import { RosterUnit } from '@/types';
import { useRoster } from '@/hooks/useRoster';

interface TransportCapacityIndicatorProps {
  transportUnit: RosterUnit;
}

export function TransportCapacityIndicator({ transportUnit }: TransportCapacityIndicatorProps) {
  const { transportValidations } = useRoster();

  const validation = transportValidations.find((v) => v.transportUnit.id === transportUnit.id);
  if (!validation) return null;

  const { capacity, currentLoad, isValid } = validation;
  const percentage = (currentLoad / capacity) * 100;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: isValid ? 'text.secondary' : 'error.main',
          fontFamily: 'monospace',
        }}
      >
        Transport Capacity: {currentLoad}/{capacity}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(percentage, 100)}
        sx={{
          height: 8,
          bgcolor: 'grey.800',
          '& .MuiLinearProgress-bar': {
            bgcolor: isValid ? 'primary.main' : 'error.main',
          },
        }}
      />
    </Box>
  );
}
