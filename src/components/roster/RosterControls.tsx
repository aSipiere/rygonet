import { TextField, Select, MenuItem, FormControl, InputLabel, Stack, Box } from '@mui/material';
import { SortOption } from '@hooks/useRosterFilter';

interface RosterControlsProps {
  searchTerm: string;
  sortBy: SortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
}

export function RosterControls({
  searchTerm,
  sortBy,
  onSearchChange,
  onSortChange,
}: RosterControlsProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          placeholder="SEARCH UNITS..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          sx={{
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
              color: 'primary.main',
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'text.secondary',
              opacity: 0.7,
            },
          }}
        />
      </Box>
      <Box sx={{ minWidth: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: 'text.secondary' }}>SORT BY</InputLabel>
          <Select
            value={sortBy}
            label="SORT BY"
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            sx={{
              fontFamily: 'monospace',
              color: 'primary.main',
            }}
          >
            <MenuItem value="category">Category</MenuItem>
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="points-asc">Points (Low-High)</MenuItem>
            <MenuItem value="points-desc">Points (High-Low)</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
}
