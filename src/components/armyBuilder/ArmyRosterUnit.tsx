import { Box, Typography, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { RosterUnit } from '@/types';
import { useRoster } from '@/hooks/useRoster';
import { useFactionDataContext } from '@/contexts/FactionDataContext';
import { canUnitBeTransported, canUnitTransport, parsePoints } from '@/utils/roster';
import { UnitOptionsSelector } from './UnitOptionsSelector';
import { UnitRelationshipControl } from './UnitRelationshipControl';
import { TransportCapacityIndicator } from './TransportCapacityIndicator';
import { useHighlight } from './ArmyRoster';

interface ArmyRosterUnitProps {
  rosterUnit: RosterUnit;
}

export function ArmyRosterUnit({ rosterUnit }: ArmyRosterUnitProps) {
  const { currentRoster, removeUnit, updateUnit, isEditMode } = useRoster();
  const { getUnitById } = useFactionDataContext();
  const { highlightedUnitId } = useHighlight();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: rosterUnit.id,
  });

  if (!currentRoster) return null;

  const unitDef = getUnitById(currentRoster.factionId, rosterUnit.unitId);
  if (!unitDef) return null;

  // Check if unit is transported/towed
  const isRelated = !!rosterUnit.relationship;
  const indentLevel = isRelated ? 1 : 0;

  // Calculate unit points
  let unitPoints = parsePoints(unitDef.points);
  if (rosterUnit.selectedOptions && unitDef.options) {
    rosterUnit.selectedOptions.forEach((optionIndex) => {
      const option = unitDef.options![optionIndex];
      if (option && option.points) {
        unitPoints += option.points;
      }
    });
  }
  const totalUnitPoints = unitPoints * rosterUnit.count;

  const handleUpdateCount = (delta: number) => {
    const newCount = Math.max(1, rosterUnit.count + delta);
    updateUnit({
      ...rosterUnit,
      count: newCount,
    });
  };

  const isHighlighted = highlightedUnitId === rosterUnit.id;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        ml: indentLevel * 4,
        border: isHighlighted ? '2px solid' : '1px solid',
        borderColor: isHighlighted
          ? 'warning.main'
          : isRelated
            ? 'secondary.main'
            : 'primary.main',
        p: 1.5,
        bgcolor: isHighlighted ? 'warning.dark' : 'background.paper',
        fontFamily: 'monospace',
        transition: 'all 0.2s ease-in-out',
        boxShadow: isHighlighted ? 3 : 0,
      }}
    >
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {/* Drag handle - only visible in edit mode */}
        {isEditMode && (
          <Box {...listeners} {...attributes} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
            <DragIndicatorIcon fontSize="small" />
          </Box>
        )}

        {/* Unit name */}
        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
          {rosterUnit.customName || unitDef.name}
          {rosterUnit.relationship && (
            <Chip
              size="small"
              label={rosterUnit.relationship.type.toUpperCase()}
              sx={{ ml: 1, fontFamily: 'monospace' }}
            />
          )}
        </Typography>

        {/* Count controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isEditMode && (
            <IconButton size="small" onClick={() => handleUpdateCount(-1)}>
              <RemoveIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'center' }}>
            x{rosterUnit.count}
          </Typography>
          {isEditMode && (
            <IconButton size="small" onClick={() => handleUpdateCount(1)}>
              <AddIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Points display */}
        <Typography variant="body2" sx={{ minWidth: '60px', textAlign: 'right' }}>
          {totalUnitPoints} pts
        </Typography>

        {/* Remove button - only visible in edit mode */}
        {isEditMode && (
          <IconButton size="small" onClick={() => removeUnit(rosterUnit.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Category and subcategory */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {unitDef.category}
        {unitDef.subcategory && ` - ${unitDef.subcategory}`}
      </Typography>

      {/* Options selector - only visible in edit mode */}
      {isEditMode && <UnitOptionsSelector rosterUnit={rosterUnit} unitDef={unitDef} />}

      {/* Relationship controls (if unit can be transported) - only visible in edit mode */}
      {isEditMode && canUnitBeTransported(unitDef) && (
        <UnitRelationshipControl rosterUnit={rosterUnit} />
      )}

      {/* Transport capacity indicator (if unit is a transport) - always visible */}
      {canUnitTransport(unitDef) && <TransportCapacityIndicator transportUnit={rosterUnit} />}
    </Box>
  );
}
