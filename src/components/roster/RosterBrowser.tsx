import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Unit, UnitCategory } from '@/types/unit';
import { useRosterFilter, SortOption } from '@hooks/useRosterFilter';
import { Divider } from '@components/common/Divider';
import { RosterControls } from './RosterControls';
import { RosterGroup } from './RosterGroup';

interface RosterBrowserProps {
  units: Unit[];
}

const CATEGORY_ORDER: UnitCategory[] = [
  'Infantry',
  'Vehicles',
  'Aircraft',
  'Support',
  'TACOMS',
  'Scenario',
];

export function RosterBrowser({ units }: RosterBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('category');

  const filteredUnits = useRosterFilter(units, searchTerm, sortBy);

  // Group units by category
  const groupedUnits = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = filteredUnits.filter((unit) => unit.category === category);
    return acc;
  }, {} as Record<UnitCategory, Unit[]>);

  return (
    <Box>
      <RosterControls
        searchTerm={searchTerm}
        sortBy={sortBy}
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
      />

      <Divider variant="heavy" />

      {filteredUnits.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: 'secondary.main', textAlign: 'center', mt: 4 }}
        >
          &gt; NO UNITS MATCHING CRITERIA
        </Typography>
      ) : (
        CATEGORY_ORDER.map((category) => (
          <RosterGroup
            key={category}
            categoryName={category}
            units={groupedUnits[category]}
          />
        ))
      )}
    </Box>
  );
}
