import { Typography, Box } from '@mui/material';
import { Weapon, WeaponAccuracy, WeaponStrength, ShotType } from '@/types/weapon';

interface WeaponDisplayProps {
  weapon: Weapon;
}

function formatAccuracy(accuracy: number | string | WeaponAccuracy | null | undefined): string {
  if (accuracy === null || accuracy === undefined) return 'N/A';
  if (typeof accuracy === 'number') return `${accuracy}+`;
  if (typeof accuracy === 'string') return accuracy;
  // WeaponAccuracy object: {stationary, moving}
  return `${accuracy.stationary}+/${accuracy.moving}+`;
}

function formatStrength(strength: string | WeaponStrength | null | undefined): string {
  if (strength === null || strength === undefined) return 'N/A';
  if (typeof strength === 'string') return strength;
  // WeaponStrength object: {normal, halfRange}
  return `${strength.normal}/${strength.halfRange}+`;
}

function ShotTypeDisplay({ shotType }: { shotType: ShotType }) {
  // Build stats line matching PDF format: Target, Range, Accuracy, Strength, Dice
  const parts: string[] = [];

  if (shotType.target) parts.push(shotType.target);
  if (shotType.range !== null && shotType.range !== undefined) parts.push(`R${shotType.range}"`);
  if (shotType.accuracy !== null && shotType.accuracy !== undefined) parts.push(`A${formatAccuracy(shotType.accuracy)}`);
  if (shotType.strength !== null && shotType.strength !== undefined) parts.push(`S${formatStrength(shotType.strength)}`);
  if (shotType.dice !== null && shotType.dice !== undefined) parts.push(`D${shotType.dice}`);

  return (
    <Box sx={{ ml: 2, mt: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>-&gt;</Box>{' '}
        <Box component="span" sx={{ fontWeight: 600 }}>{shotType.name}</Box>
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2 }}>
        {parts.join(', ')}
      </Typography>
      {shotType.specialRules && shotType.specialRules.length > 0 && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2, fontStyle: 'italic' }}>
          {shotType.specialRules.join(', ')}
        </Typography>
      )}
    </Box>
  );
}

export function WeaponDisplay({ weapon }: WeaponDisplayProps) {
  // Build stats line matching PDF format: Target, Range, Accuracy, Strength, Dice, Ammo
  const parts: string[] = [];

  if (weapon.target) parts.push(weapon.target);
  if (weapon.range !== undefined) parts.push(`R${weapon.range}"`);
  if (weapon.accuracy !== undefined) parts.push(`A${formatAccuracy(weapon.accuracy)}`);
  if (weapon.strength !== undefined) parts.push(`S${formatStrength(weapon.strength)}`);
  if (weapon.dice !== undefined) parts.push(`D${weapon.dice}`);
  if (weapon.ammo !== null && weapon.ammo !== undefined) parts.push(`Ammo ${weapon.ammo}`);

  return (
    <Box sx={{ mb: 1 }}>
      {/* Weapon name */}
      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
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
          {/* Weapon stats line - indented like PDF */}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2 }}>
            {parts.join(', ')}
          </Typography>

          {/* Special rules - indented, italic, comma-separated like PDF */}
          {weapon.specialRules && weapon.specialRules.length > 0 && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2, fontStyle: 'italic' }}>
              {weapon.specialRules.join(', ')}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
