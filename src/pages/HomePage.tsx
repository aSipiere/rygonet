import { Typography, Button, Box, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useRoster } from '@hooks/useRoster';
import { useFactionData } from '@hooks/useFactionData';
import { Divider } from '@components/common/Divider';
import { TerminalBox } from '@components/common/TerminalBox';

export default function HomePage() {
  const { savedRosters, loadRoster, currentRoster, isSharedRoster } = useRoster();
  const { factions, loading } = useFactionData();
  const navigate = useNavigate();

  // If a shared roster was loaded from URL, redirect to builder
  useEffect(() => {
    if (currentRoster && isSharedRoster) {
      navigate('/builder');
    }
  }, [currentRoster, isSharedRoster, navigate]);

  const handleRosterClick = (roster: any) => {
    loadRoster(roster);
    navigate('/builder');
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'primary.main',
            letterSpacing: '0.2em',
            mb: 2,
          }}
        >
          ╔═══════════════════════════════════════════════════════════╗
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          FIRELOCK: RENEGADE
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 1 }}>
          ARMY ROSTER MANAGEMENT SYSTEM
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'primary.main',
            letterSpacing: '0.2em',
          }}
        >
          ╚═══════════════════════════════════════════════════════════╝
        </Typography>
      </Box>

      <Divider variant="bracketed" text="SYSTEM ACCESS" />

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/builder"
          sx={{ px: 4, py: 1.5 }}
        >
          [INITIATE NEW ROSTER]
        </Button>
      </Box>

      <Divider variant="simple" />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <TerminalBox title="SAVED ROSTERS" variant="double">
            {savedRosters.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                &gt; NO ROSTERS IN DATABASE
              </Typography>
            ) : (
              <Box>
                {savedRosters.map((roster) => (
                  <Box
                    key={roster.id}
                    onClick={() => handleRosterClick(roster)}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid #333',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 0, 0.05)',
                      },
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'primary.main' }}>
                      &gt; {roster.name.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      POINTS: {roster.pointsLimit} | UNITS: {roster.units.length}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </TerminalBox>
        </Box>

        <Box sx={{ flex: 1 }}>
          <TerminalBox title="AVAILABLE FACTIONS" variant="double">
            {loading ? (
              <Typography sx={{ color: 'secondary.main' }}>&gt; LOADING FACTION DATA...</Typography>
            ) : (
              <Box>
                {factions.map((factionData) => (
                  <Box
                    key={factionData.faction.id}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid #333',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 0, 0.05)',
                      },
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'primary.main' }}>
                      &gt; {factionData.faction.name.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      UNITS: {factionData.units.length} | VERSION: {factionData.faction.version}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </TerminalBox>
        </Box>
      </Stack>
    </Box>
  );
}
