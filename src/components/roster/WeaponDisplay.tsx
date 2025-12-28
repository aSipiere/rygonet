import { Typography, Box } from '@mui/material';
import { Weapon, WeaponAccuracy, ShotType } from '@/types/weapon';

interface WeaponDisplayProps {
  weapon: Weapon;
}

function formatAccuracy(accuracy: number | WeaponAccuracy | null | undefined): string {
  if (accuracy === null || accuracy === undefined) return 'N/A';
  if (typeof accuracy === 'number') return accuracy.toString();
  return `${accuracy.stationary}/${accuracy.moving}`;
}

function ShotTypeDisplay({ shotType }: { shotType: ShotType }) {
  return (
    <Box sx={{ ml: 2, mt: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>-&gt;</Box>{' '}
        <Box component="span" sx={{ fontWeight: 600 }}>{shotType.name}</Box>
        {shotType.target && ` (${shotType.target})`}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {shotType.range !== null && shotType.range !== undefined && `Range: ${shotType.range} | `}
        {shotType.accuracy !== null && shotType.accuracy !== undefined && `Acc: ${formatAccuracy(shotType.accuracy)} | `}
        {shotType.strength !== null && shotType.strength !== undefined && `Str: ${shotType.strength} | `}
        {shotType.damage !== null && shotType.damage !== undefined && `D: ${shotType.damage}`}
      </Typography>
      {shotType.specialRules && shotType.specialRules.length > 0 && (
        <Typography variant="caption" color="text.secondary" display="block">
          Special: {shotType.specialRules.join(', ')}
        </Typography>
      )}
    </Box>
  );
}

export function WeaponDisplay({ weapon }: WeaponDisplayProps) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
        {weapon.name}
      </Typography>

      {weapon.shotTypes && weapon.shotTypes.length > 0 ? (
        // If weapon has shot types, display each one
        weapon.shotTypes.map((shotType, idx) => (
          <ShotTypeDisplay key={idx} shotType={shotType} />
        ))
      ) : (
        // Otherwise display standard weapon stats
        <>
          <Typography variant="caption" color="text.secondary" display="block">
            {weapon.range !== undefined && `Range: ${weapon.range} | `}
            {weapon.accuracy !== undefined && `Acc: ${formatAccuracy(weapon.accuracy)} | `}
            {weapon.strength !== undefined && `Str: ${weapon.strength} | `}
            {weapon.damage !== undefined && `D: ${weapon.damage}`}
            {weapon.ammo !== null && weapon.ammo !== undefined && ` | Ammo: ${weapon.ammo}`}
          </Typography>
          {weapon.specialRules && weapon.specialRules.length > 0 && (
            <Typography variant="caption" color="text.secondary" display="block">
              Special: {weapon.specialRules.join(', ')}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
