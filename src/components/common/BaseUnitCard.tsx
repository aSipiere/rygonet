import { Typography, Box } from '@mui/material';
import { ReactNode } from 'react';
import { Unit } from '@/types/unit';
import { TerminalBox } from '@components/common/TerminalBox';
import { Divider } from '@components/common/Divider';
import { StatsDisplay } from '@components/roster/StatsDisplay';
import { WeaponDisplay } from '@components/roster/WeaponDisplay';

interface BaseUnitCardProps {
  unit: Unit;
  /** Optional header content to show before category/points */
  headerContent?: ReactNode;
  /** Optional content to show after header but before stats */
  preStatsContent?: ReactNode;
  /** Optional content to show after weapons section */
  postWeaponsContent?: ReactNode;
  /** Points to display (can be different from unit.points for roster units with options) */
  displayPoints?: number | string;
  /** Optional count display (for roster units) */
  count?: number;
  /** Selected options to display */
  selectedOptions?: number[];
  /** Show all options section */
  showAllOptions?: boolean;
}

export function BaseUnitCard({
  unit,
  headerContent,
  preStatsContent,
  postWeaponsContent,
  displayPoints,
  count,
  selectedOptions,
  showAllOptions = false,
}: BaseUnitCardProps) {
  const points = displayPoints ?? unit.points;
  const totalPoints = count ? (typeof points === 'number' ? points : 0) * count : points;

  return (
    <Box sx={{ height: '100%' }}>
      <TerminalBox title={`${unit.name} - ${totalPoints} pts`} variant="single">
        {/* Header Content (e.g., relationship toggles) */}
        {headerContent}

        {/* Descriptive Category */}
        {unit.descriptiveCategory && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {unit.descriptiveCategory}
            </Typography>
          </Box>
        )}

        {/* Count display for roster units */}
        {count !== undefined && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
              QUANTITY: x{count}
            </Typography>
          </Box>
        )}

        {/* Stats Section - matches PDF format: comes right after unit name */}
        <Box sx={{ mb: 1.5 }}>
          <StatsDisplay stats={unit.stats} unitClass={unit.stats.unitClass} />
        </Box>

        {/* Special Rules Section - in PDF, these come before weapons */}
        {unit.specialRules && unit.specialRules.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {unit.specialRules.join(', ')}
            </Typography>
          </Box>
        )}

        {/* Separator after special rules */}
        {unit.specialRules && unit.specialRules.length > 0 && (
          <Divider variant="simple" />
        )}

        {/* Unit Ability Section - comes after special rules in PDF */}
        {unit.unitAbility && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-line', fontStyle: 'italic' }}>
              {unit.unitAbility}
            </Typography>
          </Box>
        )}

        {/* Separator after unit ability if present */}
        {unit.unitAbility && (
          <Divider variant="simple" />
        )}

        {/* Pre-Stats Content (e.g., relationship state for play mode) */}
        {preStatsContent}

        {/* Selected Options */}
        {selectedOptions && selectedOptions.length > 0 && unit.options && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
              EQUIPPED:
            </Typography>
            {selectedOptions.map((optionIndex) => {
              const option = unit.options![optionIndex];
              if (!option) return null;
              return (
                <Typography key={optionIndex} variant="caption" display="block" color="text.secondary">
                  &gt; {option.description}
                  {option.points !== undefined && ` (+${option.points} pts)`}
                </Typography>
              );
            })}
          </Box>
        )}

        {/* Weapons Section */}
        {unit.weapons && unit.weapons.length > 0 && (
          <Box sx={{ my: 1.5 }}>
            {unit.weapons.map((weapon, idx) => (
              <WeaponDisplay key={idx} weapon={weapon} />
            ))}
          </Box>
        )}

        {/* Separator before post-weapons content */}
        {postWeaponsContent && (
          <Divider variant="simple" />
        )}

        {/* Post-Weapons Content (e.g., relationship controls for play mode) */}
        {postWeaponsContent}

        {/* All Options Section (for army builder) */}
        {showAllOptions && unit.options && unit.options.length > 0 && (
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
