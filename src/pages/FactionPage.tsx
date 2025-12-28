import { Typography, Box, Stack } from '@mui/material';
import { useFactionData } from '@hooks/useFactionData';
import { Divider } from '@components/common/Divider';
import { TerminalBox } from '@components/common/TerminalBox';
import { RosterBrowser } from '@components/roster/RosterBrowser';

export default function FactionPage() {
  const { factions, loading } = useFactionData();

  if (loading) {
    return (
      <Typography sx={{ color: 'secondary.main', textAlign: 'center', mt: 4 }}>
        &gt; LOADING FACTION DATABASE...
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
        [FACTION ARCHIVES]
      </Typography>

      <Divider variant="bracketed" text="CLASSIFIED" />

      <Stack spacing={3} sx={{ mt: 4 }}>
        {factions.map((factionData) => (
          <TerminalBox key={factionData.faction.id} title={factionData.faction.name} variant="heavy">
            <Typography variant="body2" color="text.secondary" paragraph>
              {factionData.faction.description}
            </Typography>
            <Divider variant="simple" />
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                VERSION: {factionData.faction.version || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                UNITS: {factionData.units.length}
              </Typography>
              {factionData.faction.specialRules && factionData.faction.specialRules.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                  SPECIAL RULES: {factionData.faction.specialRules.length}
                </Typography>
              )}
            </Box>
            {factionData.faction.specialRules && factionData.faction.specialRules.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  FACTION SPECIAL RULES:
                </Typography>
                {factionData.faction.specialRules.map((rule, idx) => (
                  <Typography key={idx} variant="caption" display="block" sx={{ mt: 1 }}>
                    &gt; {rule.name.toUpperCase()}: {rule.description}
                  </Typography>
                ))}
              </Box>
            )}

            {/* Roster Browser */}
            <Box sx={{ mt: 4 }}>
              <Divider variant="heavy" />
              <Typography variant="h5" sx={{ color: 'primary.main', mt: 3, mb: 2 }}>
                AVAILABLE UNITS
              </Typography>
              <RosterBrowser units={factionData.units} />
            </Box>
          </TerminalBox>
        ))}
      </Stack>
    </Box>
  );
}
