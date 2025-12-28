import { useState } from 'react';
import { Stack, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Roster, RosterUnit } from '@/types';
import { useRoster } from '@/hooks/useRoster';
import { getUnitsInGroup, getUngroupedUnits } from '@/utils/roster';
import { TerminalBox } from '@/components/common/TerminalBox';
import { Divider } from '@/components/common/Divider';
import { ArmyRosterHeader } from './ArmyRosterHeader';
import { ArmyRosterGroup } from './ArmyRosterGroup';
import { ArmyRosterUnit } from './ArmyRosterUnit';

interface ArmyRosterProps {
  roster: Roster;
}

export function ArmyRoster({ roster }: ArmyRosterProps) {
  const { totalPoints, createGroup, moveUnitToGroup, isEditMode } = useRoster();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const unitId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a group
    if (overId.startsWith('group-')) {
      const groupId = overId.replace('group-', '');
      moveUnitToGroup(unitId, groupId === 'ungrouped' ? null : groupId);
    }
  };

  const activeUnit = activeId ? roster.units.find((u) => u.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TerminalBox title="FORCE COMPOSITION" variant="heavy">
        {/* Header with stats */}
        <ArmyRosterHeader roster={roster} totalPoints={totalPoints} />

        <Divider variant="heavy" />

        {/* Groups */}
        <Stack spacing={2} sx={{ mt: 2, mb: 2 }}>
          {roster.groups.map((group) => (
            <ArmyRosterGroup
              key={group.id}
              group={group}
              units={getUnitsInGroup(roster.units, group.id)}
            />
          ))}

          {/* Ungrouped units */}
          <ArmyRosterGroup group={null} units={getUngroupedUnits(roster.units)} />
        </Stack>

        {/* Add group button - only visible in edit mode */}
        {isEditMode && (
          <Button
            onClick={() => createGroup()}
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{ fontFamily: 'monospace' }}
          >
            NEW GROUP
          </Button>
        )}
      </TerminalBox>

      <DragOverlay>
        {activeUnit ? <ArmyRosterUnit rosterUnit={activeUnit} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
