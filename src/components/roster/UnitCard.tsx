import { Typography, Box } from '@mui/material';
import { Unit } from '@/types/unit';
import { TerminalBox } from '@components/common/TerminalBox';
import { Divider } from '@components/common/Divider';
import { StatsDisplay } from './StatsDisplay';
import { WeaponDisplay } from './WeaponDisplay';

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  return (
    <Box sx={{ height: '100%' }}>
      <TerminalBox title={unit.name} variant="single">
      {/* Category and Points */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          CATEGORY: <Box component="span" sx={{ color: 'primary.main' }}>{unit.category}</Box>
          {unit.subcategory && ` (${unit.subcategory})`}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
          POINTS: <Box component="span" sx={{ color: 'primary.main' }}>{unit.points}</Box>
        </Typography>
      </Box>

      {/* Stats Section */}
      <Divider variant="simple" />
      <Box sx={{ my: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
          STATS
        </Typography>
        <StatsDisplay stats={unit.stats} unitClass={unit.unitClass} />
      </Box>

      {/* Weapons Section */}
      {unit.weapons && unit.weapons.length > 0 && (
        <>
          <Divider variant="simple" />
          <Box sx={{ my: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
              WEAPONS
            </Typography>
            {unit.weapons.map((weapon, idx) => (
              <WeaponDisplay key={idx} weapon={weapon} />
            ))}
          </Box>
        </>
      )}

      {/* Description Section */}
      {unit.description && (
        <>
          <Divider variant="simple" />
          <Box sx={{ my: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
              ABILITY
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {unit.description}
            </Typography>
          </Box>
        </>
      )}

      {/* Special Rules Section - Names Only */}
      {unit.specialRules && unit.specialRules.length > 0 && (
        <>
          <Divider variant="simple" />
          <Box sx={{ my: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
              SPECIAL RULES
            </Typography>
            {unit.specialRules.map((rule, idx) => (
              <Typography key={idx} variant="caption" display="block" color="text.secondary">
                &gt; {rule.name.toUpperCase()}
              </Typography>
            ))}
          </Box>
        </>
      )}

      {/* Options Section */}
      {unit.options && unit.options.length > 0 && (
        <>
          <Divider variant="simple" />
          <Box sx={{ my: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
              OPTIONS
            </Typography>
            {unit.options.map((option, idx) => (
              <Typography key={idx} variant="caption" display="block" color="text.secondary">
                &gt; {option.description}
                {option.points !== undefined && ` (+${option.points} pts)`}
              </Typography>
            ))}
          </Box>
        </>
      )}
      </TerminalBox>
    </Box>
  );
}
