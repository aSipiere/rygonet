import { Box, Typography, Stack, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Roster } from '@/types';
import { useRoster } from '@/hooks/useRoster';
import { useState } from 'react';

interface ArmyRosterHeaderProps {
  roster: Roster;
  totalPoints: number;
}

export function ArmyRosterHeader({ roster, totalPoints }: ArmyRosterHeaderProps) {
  const { validationErrors, rosterUnitsWithData, isSharedRoster, isEditMode, shareRoster, cloneSharedRoster, saveRoster, enterEditMode } = useRoster();
  const [shareStatus, setShareStatus] = useState<string>('');
  const navigate = useNavigate();

  const pointsUsed = totalPoints;
  const pointsLimit = roster.pointsLimit;
  const pointsRemaining = pointsLimit - pointsUsed;

  const requiredTACOMS = Math.ceil(pointsUsed / 100);
  const currentTACOMS = rosterUnitsWithData
    .filter(({ unit }) => unit.category === 'TACOMS')
    .reduce((sum, { rosterUnit }) => sum + rosterUnit.count, 0);

  const handleShareRoster = async () => {
    const success = await shareRoster();
    if (success) {
      setShareStatus('Link copied to clipboard!');
      setTimeout(() => setShareStatus(''), 3000);
    } else {
      setShareStatus('Failed to copy link');
      setTimeout(() => setShareStatus(''), 3000);
    }
  };

  const handleCloneRoster = () => {
    cloneSharedRoster();
  };

  const handleSaveRoster = () => {
    saveRoster();
    setShareStatus('Roster saved!');
    setTimeout(() => setShareStatus(''), 2000);
  };

  const handleEditRoster = () => {
    enterEditMode();
  };

  return (
    <Box>
      {/* Shared roster banner */}
      {isSharedRoster && (
        <Alert severity="info" sx={{ mb: 2, fontFamily: 'monospace' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">
              Viewing shared roster (read-only)
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={handleCloneRoster}
              sx={{ fontFamily: 'monospace' }}
            >
              Clone to My Rosters
            </Button>
          </Stack>
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ color: 'primary.main', fontFamily: 'monospace' }}>
            {roster.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {roster.units.length} units
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {!isSharedRoster && isEditMode && (
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveRoster}
                sx={{ fontFamily: 'monospace' }}
              >
                Save
              </Button>
            )}
            {!isSharedRoster && !isEditMode && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => navigate('/play')}
                  sx={{ fontFamily: 'monospace' }}
                >
                  Play
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleEditRoster}
                  sx={{ fontFamily: 'monospace' }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleShareRoster}
                  sx={{ fontFamily: 'monospace' }}
                >
                  Share
                </Button>
              </>
            )}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: pointsRemaining < 0 ? 'error.main' : 'primary.main',
                  fontFamily: 'monospace',
                }}
              >
                {pointsUsed} / {pointsLimit} pts
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {pointsRemaining >= 0 ? `${pointsRemaining} remaining` : `${-pointsRemaining} over`}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      {/* Share status message */}
      {shareStatus && (
        <Alert severity="success" sx={{ mb: 2, fontFamily: 'monospace' }}>
          {shareStatus}
        </Alert>
      )}

      {/* TACOMS indicator */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: currentTACOMS >= requiredTACOMS ? 'primary.main' : 'error.main',
            fontFamily: 'monospace',
          }}
        >
          TACOMS: {currentTACOMS} / {requiredTACOMS} required
        </Typography>
      </Box>

      {/* Validation errors/warnings */}
      {validationErrors.length > 0 && (
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          {validationErrors.map((error, idx) => (
            <Alert
              key={idx}
              severity={error.type === 'error' ? 'error' : 'warning'}
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            >
              {error.message}
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}
