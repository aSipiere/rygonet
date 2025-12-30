import { Unit } from '@/types/unit';
import { BaseUnitCard } from '@components/common/BaseUnitCard';

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  return <BaseUnitCard unit={unit} showAllOptions />;
}
