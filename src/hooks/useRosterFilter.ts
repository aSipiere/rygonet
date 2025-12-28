import { useMemo } from 'react';
import { Unit, UnitCategory } from '@/types/unit';

export type SortOption = 'points-asc' | 'points-desc' | 'name-asc' | 'name-desc' | 'category';

const CATEGORY_ORDER: UnitCategory[] = [
  'Infantry',
  'Vehicles',
  'Aircraft',
  'Support',
  'TACOMS',
  'Scenario',
];

export function useRosterFilter(
  units: Unit[],
  searchTerm: string,
  sortBy: SortOption
): Unit[] {
  return useMemo(() => {
    // Step 1: Filter by search term
    let filtered = units.filter((u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Step 2: Sort based on sortBy option
    switch (sortBy) {
      case 'points-asc':
        filtered.sort((a, b) => a.points - b.points);
        break;
      case 'points-desc':
        filtered.sort((a, b) => b.points - a.points);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'category':
        filtered.sort((a, b) => {
          const catDiff =
            CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
          return catDiff !== 0 ? catDiff : a.name.localeCompare(b.name);
        });
        break;
    }

    return filtered;
  }, [units, searchTerm, sortBy]);
}
