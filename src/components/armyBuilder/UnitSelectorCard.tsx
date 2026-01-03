import { Box, Typography, Button } from '@mui/material';
import { Unit } from '@/types';
import { parseTransportCapacity } from '@/utils/transportCapacity';

interface UnitSelectorCardProps {
  unit: Unit;
  onAdd: () => void;
  disabled?: boolean;
}

export function UnitSelectorCard({ unit, onAdd, disabled = false }: UnitSelectorCardProps) {
  const transportInfo = parseTransportCapacity(unit);

  let transportLabel = '';
  if (transportInfo.type === 'pc') {
    transportLabel = ` | PC(${transportInfo.capacity}, ${transportInfo.exitPoint})`;
  } else if (transportInfo.type === 'tow') {
    transportLabel = ` | Tow(${transportInfo.maxToughness})`;
  } else if (transportInfo.type === 'both') {
    transportLabel = ` | PC(${transportInfo.capacity}, ${transportInfo.exitPoint}) + Tow(${transportInfo.maxToughness})`;
  } else if (transportInfo.type === 'capacity') {
    transportLabel = ` | Transport (${transportInfo.capacity})`;
  }

  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'primary.main',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '&:hover': { bgcolor: 'action.hover' },
        fontFamily: 'monospace',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
          {unit.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {unit.category} | {unit.points} pts{transportLabel}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="outlined"
        onClick={onAdd}
        disabled={disabled}
        sx={{ fontFamily: 'monospace', minWidth: '80px' }}
      >
        + ADD
      </Button>
    </Box>
  );
}
