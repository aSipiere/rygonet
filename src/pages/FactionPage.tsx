import { Typography, Box, Select, MenuItem, FormControl, Stack } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFactionData } from '@hooks/useFactionData';
import { Divider } from '@components/common/Divider';
import { TerminalBox } from '@components/common/TerminalBox';
import { RosterBrowser } from '@components/roster/RosterBrowser';
import { useMemo } from 'react';

export default function FactionPage() {
  const { factionId } = useParams<{ factionId?: string }>();
  const navigate = useNavigate();
  const { factions, loading } = useFactionData();

  // Find the selected faction or default to first
  const selectedFaction = useMemo(() => {
    if (factionId) {
      return factions.find(f => f.faction.id === factionId) || factions[0];
    }
    return factions[0];
  }, [factionId, factions]);

  const handleFactionChange = (newFactionId: string) => {
    navigate(`/factions/${newFactionId}`);
  };

  if (loading) {
    return (
      <Typography sx={{ color: 'secondary.main', textAlign: 'center', mt: 4 }}>
        &gt; LOADING FACTION DATABASE...
      </Typography>
    );
  }

  if (!selectedFaction) {
    return (
      <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 4 }}>
        &gt; ERROR: NO FACTION DATA AVAILABLE
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
        [FACTION ARCHIVES]
      </Typography>

      <Divider variant="bracketed" text="CLASSIFIED" />

      {/* Faction Selector */}
      <Box sx={{ mt: 4, mb: 3, display: 'flex', justifyContent: 'center' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <Select
            value={selectedFaction.faction.id}
            onChange={(e) => handleFactionChange(e.target.value)}
            sx={{
              color: 'primary.main',
              fontFamily: 'monospace',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            {factions.map((faction) => (
              <MenuItem
                key={faction.faction.id}
                value={faction.faction.id}
                sx={{ fontFamily: 'monospace' }}
              >
                {faction.faction.name.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Selected Faction Details */}
      <Stack spacing={3}>
        <TerminalBox title={selectedFaction.faction.name} variant="heavy">
          <Typography variant="body2" color="text.secondary" paragraph>
            {selectedFaction.faction.description}
          </Typography>
          <Divider variant="simple" />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              VERSION: {selectedFaction.faction.version || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
              UNITS: {selectedFaction.units.length}
            </Typography>
            {selectedFaction.faction.specialRules && selectedFaction.faction.specialRules.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                SPECIAL RULES: {selectedFaction.faction.specialRules.length}
              </Typography>
            )}
          </Box>
          {selectedFaction.faction.specialRules && selectedFaction.faction.specialRules.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                FACTION SPECIAL RULES:
              </Typography>
              {selectedFaction.faction.specialRules.map((rule, idx) => (
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
            <RosterBrowser units={selectedFaction.units} />
          </Box>
        </TerminalBox>
      </Stack>
    </Box>
  );
}
