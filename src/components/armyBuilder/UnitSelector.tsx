import { useState } from 'react';
import { Box, Stack, Chip } from '@mui/material';
import { useFactionDataContext } from '@/contexts/FactionDataContext';
import { UnitCategory } from '@/types';
import { UNIT_CATEGORIES } from '@/utils/constants';
import { useRosterFilter, SortOption } from '@/hooks/useRosterFilter';
import { RosterControls } from '@/components/roster/RosterControls';
import { TerminalBox } from '@/components/common/TerminalBox';
import { UnitSelectorCard } from './UnitSelectorCard';

interface UnitSelectorProps {
  factionId: string;
  onAddUnit: (unitId: string) => void;
  isEditMode: boolean;
}

export function UnitSelector({ factionId, onAddUnit, isEditMode }: UnitSelectorProps) {
  const { getFactionById } = useFactionDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('category');
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory | 'all'>('all');

  const factionData = getFactionById(factionId);

  // Always call hooks in the same order - use empty array if no faction data
  const units = factionData?.units || [];
  const filteredUnits = useRosterFilter(units, searchTerm, sortBy).filter(
    (unit) => selectedCategory === 'all' || unit.category === selectedCategory
  );

  if (!factionData) return null;

  return (
    <TerminalBox title="UNIT DATABASE" variant="heavy">
      {/* Category filter tabs */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="ALL"
            onClick={() => setSelectedCategory('all')}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            size="small"
            sx={{ fontFamily: 'monospace' }}
          />
          {UNIT_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              color={selectedCategory === cat ? 'primary' : 'default'}
              size="small"
              sx={{ fontFamily: 'monospace' }}
            />
          ))}
        </Stack>
      </Box>

      {/* Search and sort */}
      <RosterControls
        searchTerm={searchTerm}
        sortBy={sortBy}
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
      />

      {/* Unit list */}
      <Stack spacing={1} sx={{ maxHeight: '600px', overflow: 'auto', mt: 2 }}>
        {filteredUnits.map((unit) => (
          <UnitSelectorCard
            key={unit.id}
            unit={unit}
            onAdd={() => onAddUnit(unit.id)}
            disabled={!isEditMode}
          />
        ))}
      </Stack>
    </TerminalBox>
  );
}
