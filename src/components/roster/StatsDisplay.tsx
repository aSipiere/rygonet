import { Typography } from '@mui/material';
import { UnitStats, UnitType } from '@/types/unit';

interface StatsDisplayProps {
  stats: UnitStats;
  unitClass: UnitType;
}

export function StatsDisplay({ stats, unitClass }: StatsDisplayProps) {
  // Build statline parts
  const parts: string[] = [unitClass];

  if (stats.height !== undefined) {
    parts.push(`H${stats.height}`);
  }

  if (stats.spottingDistance !== undefined) {
    parts.push(`S${stats.spottingDistance}"`);
  }

  parts.push(`M${stats.movement}"`);
  parts.push(`Q${stats.quality}+`);

  if (stats.toughness) {
    // Format toughness - handle both string and object forms
    if (typeof stats.toughness === 'string') {
      parts.push(`T${stats.toughness}`);
    } else {
      // Object form: {front, side, rear} -> "6/4/4"
      parts.push(`T${stats.toughness.front}/${stats.toughness.side}/${stats.toughness.rear}`);
    }
  }

  if (stats.evasion !== undefined) {
    parts.push(`E${stats.evasion}+`);
  }

  if (stats.command !== undefined) {
    parts.push(`C${stats.command}`);
  }

  if (stats.capacity !== undefined) {
    parts.push(`Transport (${stats.capacity})`);
  }

  return (
    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
      {parts.join(', ')}
    </Typography>
  );
}
