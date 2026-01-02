import { Typography, Button, Box, Stack, Collapse, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useRoster } from '@hooks/useRoster';
import { useFactionData } from '@hooks/useFactionData';
import { Divider } from '@components/common/Divider';
import { TerminalBox } from '@components/common/TerminalBox';
import { Roster } from '@/types';

export default function HomePage() {
  const { savedRosters, loadRoster, currentRoster, isSharedRoster } = useRoster();
  const { factions, loading } = useFactionData();
  const navigate = useNavigate();
  const [noticeExpanded, setNoticeExpanded] = useState(true);

  // If a shared roster was loaded from URL, redirect to builder
  useEffect(() => {
    if (currentRoster && isSharedRoster) {
      navigate('/builder');
    }
  }, [currentRoster, isSharedRoster, navigate]);

  const handleRosterClick = (roster: Roster) => {
    loadRoster(roster);
    navigate('/builder');
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
        <Typography
          component="pre"
          sx={{
            color: 'primary.main',
            fontFamily: 'monospace',
            fontSize: { xs: '0.4rem', sm: '0.5rem', md: '0.6rem', lg: '0.7rem' },
            lineHeight: 1.2,
            mb: 2,
            overflow: 'auto',
          }}
        >
{`

      :::::::::  :::   :::  ::::::::   ::::::::  ::::    ::: :::::::::: :::::::::::
     :+:    :+: :+:   :+: :+:    :+: :+:    :+: :+:+:   :+: :+:            :+:     
    +:+    +:+  +:+ +:+  +:+        +:+    +:+ :+:+:+  +:+ +:+            +:+      
   +#++:++#:    +#++:   :#:        +#+    +:+ +#+ +:+ +#+ +#++:++#       +#+       
  +#+    +#+    +#+    +#+   +#+# +#+    +#+ +#+  +#+#+# +#+            +#+        
 #+#    #+#    #+#    #+#    #+# #+#    #+# #+#   #+#+# #+#            #+#         
###    ###    ###     ########   ########  ###    #### ##########     ###          

`}
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 1 }}>
          FIRELOCK 198X LIST MANAGMENT SYSTEM
        </Typography>
      </Box>

      <Divider variant="bracketed" text="SYSTEM ACCESS" />

      {/* System Administrator's Notice */}
      <Box sx={{ my: 4 }}>
        <TerminalBox title="NOTICE BOARD" variant="heavy">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'warning.main',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                flex: 1,
              }}
            >
              02/01/1986 1600 GMT (Grotehaven Mean Time) - System Administrator's Notice:
            </Typography>
            <IconButton
              size="small"
              onClick={() => setNoticeExpanded(!noticeExpanded)}
              sx={{ color: 'primary.main' }}
            >
              {noticeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={noticeExpanded}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontFamily: 'monospace',
                lineHeight: 1.6,
              }}
            >
              All near peer adversaries have been added in addition to BLUEFOR, we should have a good
              first draft of everything now (particular thanks to nullAurelian and oktopusgrabbermouth).
              <br />
              <br />

              <br />
              <br />
              - SYSADMIN

            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'warning.main',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              <br />
              P.S.
              Reports of innacurate unit or weaponry statistics will not be considered
              until all near peer forces are added.
              <br />
              <br />
              Thank you for your patience in this matter.
            </Typography>
          </Collapse>
        </TerminalBox>
      </Box>

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
                    onClick={() => navigate(`/factions/${factionData.faction.id}`)}
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
