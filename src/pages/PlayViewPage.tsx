import { Typography, Box, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRoster } from '@/hooks/useRoster';
import { getUnitsInGroup, getUngroupedUnits } from '@/utils/roster';
import { Divider } from '@/components/common/Divider';
import { PlayModeGroup } from '@/components/playMode/PlayModeGroup';

export default function PlayViewPage() {
  const { currentRoster } = useRoster();
  const navigate = useNavigate();

  // Redirect to home if no roster is loaded
  useEffect(() => {
    if (!currentRoster) {
      navigate('/');
    }
  }, [currentRoster, navigate]);

  if (!currentRoster) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/builder')}
          sx={{ fontFamily: 'monospace' }}
        >
          BACK TO BUILDER
        </Button>

        <Typography variant="h4" sx={{ color: 'primary.main', fontFamily: 'monospace', textAlign: 'center', flex: 1 }}>
          [TACTICAL DEPLOYMENT VIEW]
        </Typography>

        <Box sx={{ width: '150px' }} /> {/* Spacer for centering */}
      </Box>

      <Divider variant="bracketed" text={currentRoster.name.toUpperCase()} />

      <Stack spacing={3} sx={{ mt: 3 }}>
        {/* Display groups */}
        {currentRoster.groups.map((group) => (
          <PlayModeGroup
            key={group.id}
            group={group}
            units={getUnitsInGroup(currentRoster.units, group.id)}
            factionId={currentRoster.factionId}
          />
        ))}

        {/* Ungrouped units */}
        {getUngroupedUnits(currentRoster.units).length > 0 && (
          <PlayModeGroup
            group={null}
            units={getUngroupedUnits(currentRoster.units)}
            factionId={currentRoster.factionId}
          />
        )}
      </Stack>
    </Box>
  );
}
