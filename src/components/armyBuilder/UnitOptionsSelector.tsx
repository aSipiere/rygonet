import { Box, Typography, FormControlLabel, Checkbox, Stack } from '@mui/material';
import { RosterUnit, Unit } from '@/types';
import { useRoster } from '@/hooks/useRoster';

interface UnitOptionsSelectorProps {
  rosterUnit: RosterUnit;
  unitDef: Unit;
}

export function UnitOptionsSelector({ rosterUnit, unitDef }: UnitOptionsSelectorProps) {
  const { updateUnit } = useRoster();

  if (!unitDef.options || unitDef.options.length === 0) {
    return null;
  }

  const handleToggleOption = (optionIndex: number) => {
    const currentOptions = rosterUnit.selectedOptions || [];
    const newOptions = currentOptions.includes(optionIndex)
      ? currentOptions.filter((i) => i !== optionIndex)
      : [...currentOptions, optionIndex];

    updateUnit({
      ...rosterUnit,
      selectedOptions: newOptions,
    });
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" sx={{ color: 'secondary.main', fontFamily: 'monospace' }}>
        OPTIONS:
      </Typography>
      <Stack spacing={0.5}>
        {unitDef.options.map((option, idx) => (
          <FormControlLabel
            key={idx}
            control={
              <Checkbox
                size="small"
                checked={rosterUnit.selectedOptions?.includes(idx) || false}
                onChange={() => handleToggleOption(idx)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {option.description}
                {option.points !== undefined && ` (+${option.points} pts)`}
              </Typography>
            }
          />
        ))}
      </Stack>
    </Box>
  );
}
