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

  const { pcCapacity, embarkedLoad, desantingCapacity, desantingLoad, towCapacity, towedLoad } = validation;

  const embarkedPercentage = pcCapacity > 0 ? (embarkedLoad / pcCapacity) * 100 : 0;
  const desantingPercentage = desantingCapacity > 0 ? (desantingLoad / desantingCapacity) * 100 : 0;
  const towedPercentage = towCapacity > 0 ? (towedLoad / towCapacity) * 100 : 0;

  const embarkedValid = embarkedLoad <= pcCapacity;
  const desantingValid = desantingLoad <= desantingCapacity;
  const towedValid = towedLoad <= towCapacity;

  return (
    <Box sx={{ mt: 1 }}>
      {/* PC (Embarked) Capacity */}
      {pcCapacity > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: embarkedValid ? 'text.secondary' : 'error.main',
              fontFamily: 'monospace',
            }}
          >
            PC (Embarked): {embarkedLoad}/{pcCapacity}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(embarkedPercentage, 100)}
            sx={{
              height: 6,
              bgcolor: 'grey.800',
              '& .MuiLinearProgress-bar': {
                bgcolor: embarkedValid ? 'primary.main' : 'error.main',
              },
            }}
          />
        </Box>
      )}

      {/* Desanting Capacity */}
      {desantingCapacity > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: desantingValid ? 'text.secondary' : 'error.main',
              fontFamily: 'monospace',
            }}
          >
            Desanting: {desantingLoad}/{desantingCapacity}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(desantingPercentage, 100)}
            sx={{
              height: 6,
              bgcolor: 'grey.800',
              '& .MuiLinearProgress-bar': {
                bgcolor: desantingValid ? 'primary.main' : 'error.main',
              },
            }}
          />
        </Box>
      )}

      {/* Tow Capacity */}
      {towCapacity > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: towedValid ? 'text.secondary' : 'error.main',
              fontFamily: 'monospace',
            }}
          >
            Tow (max T{towCapacity}): {towedLoad}/{towCapacity} toughness
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(towedPercentage, 100)}
            sx={{
              height: 6,
              bgcolor: 'grey.800',
              '& .MuiLinearProgress-bar': {
                bgcolor: towedValid ? 'primary.main' : 'error.main',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
