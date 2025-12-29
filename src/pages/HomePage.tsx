import { Typography, Button, Box, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useRoster } from '@hooks/useRoster';
import { useFactionData } from '@hooks/useFactionData';
import { Divider } from '@components/common/Divider';
import { TerminalBox } from '@components/common/TerminalBox';
import { Roster } from '@/types';

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
          <Typography
            variant="body2"
            sx={{
              color: 'warning.main',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            29/12/1985 0100 GMT (Grotehaven Mean Time) - System Administrator's Notice:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              fontFamily: 'monospace',
              lineHeight: 1.6,
            }}
          >
            The new STANDARD RECOGNITION AND UNIT I.D. DATABASE is now live. For now, the prototype
            is operational with BLUEFOR effectiveness statistics compiled and verified. Over the
            coming days, profiles for neer peer adversaries will be compiled and uploaded to the system.
            <br />
            <br />
            We've also improved the ability to model embarked, desanting and towed units when you
            have multiple carriers, when you hover over a unit in the drop down it will highlight
            which vehicle that selection pertains to.
            <br />
            <br />
            If you notice any inaccuracies or peculiarities of the system, please notify a FEDINT
            Liaison officer (@ahlakes on discord).
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
