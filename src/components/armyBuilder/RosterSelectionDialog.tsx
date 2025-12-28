import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Roster } from '@/types';
import { useFactionDataContext } from '@/contexts/FactionDataContext';
import { DEFAULT_POINTS_LIMIT } from '@/utils/constants';
import { TerminalBox } from '@/components/common/TerminalBox';
import { Divider } from '@/components/common/Divider';

interface RosterSelectionDialogProps {
  savedRosters: Roster[];
  onCreateNew: (name: string, factionId: string, pointsLimit: number) => void;
  onLoadExisting: (roster: Roster) => void;
}

export function RosterSelectionDialog({
  savedRosters,
  onCreateNew,
  onLoadExisting,
}: RosterSelectionDialogProps) {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [name, setName] = useState('');
  const [factionId, setFactionId] = useState('fsa');
  const [pointsLimit, setPointsLimit] = useState(DEFAULT_POINTS_LIMIT);

  const { factions } = useFactionDataContext();

  const handleCreate = () => {
    if (name.trim()) {
      onCreateNew(name.trim(), factionId, pointsLimit);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: '600px', width: '100%' }}>
        <TerminalBox title="ROSTER SELECTION" variant="heavy">
          {mode === 'select' ? (
            <>
              <Typography
                variant="h6"
                sx={{ color: 'primary.main', mb: 2, fontFamily: 'monospace' }}
              >
                EXISTING ROSTERS
              </Typography>

              {savedRosters.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, fontFamily: 'monospace' }}
                >
                  &gt; NO SAVED ROSTERS FOUND
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {savedRosters.map((roster) => (
                    <Button
                      key={roster.id}
                      variant="outlined"
                      onClick={() => onLoadExisting(roster)}
                      sx={{
                        justifyContent: 'flex-start',
                        fontFamily: 'monospace',
                        textTransform: 'none',
                      }}
                    >
                      {roster.name} - {roster.pointsLimit}pts ({roster.units.length} units)
                    </Button>
                  ))}
                </Stack>
              )}

              <Divider variant="simple" />

              <Button
                variant="contained"
                onClick={() => setMode('create')}
                sx={{ mt: 2, fontFamily: 'monospace' }}
                fullWidth
              >
                CREATE NEW ROSTER
              </Button>
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{ color: 'primary.main', mb: 2, fontFamily: 'monospace' }}
              >
                NEW ROSTER
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Roster Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  sx={{ '& input': { fontFamily: 'monospace' } }}
                />

                <FormControl fullWidth>
                  <InputLabel>Faction</InputLabel>
                  <Select
                    value={factionId}
                    onChange={(e) => setFactionId(e.target.value)}
                    label="Faction"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {factions.map((f) => (
                      <MenuItem
                        key={f.faction.id}
                        value={f.faction.id}
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {f.faction.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Points Limit"
                  type="number"
                  value={pointsLimit}
                  onChange={(e) => setPointsLimit(Number(e.target.value))}
                  fullWidth
                  sx={{ '& input': { fontFamily: 'monospace' } }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    onClick={() => setMode('select')}
                    sx={{ fontFamily: 'monospace' }}
                    fullWidth
                  >
                    CANCEL
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    sx={{ fontFamily: 'monospace' }}
                    fullWidth
                  >
                    CREATE
                  </Button>
                </Box>
              </Stack>
            </>
          )}
        </TerminalBox>
      </Box>
    </Box>
  );
}
