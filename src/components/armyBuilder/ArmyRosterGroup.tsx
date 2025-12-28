import { useState } from 'react';
import { Box, Typography, IconButton, TextField, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDroppable } from '@dnd-kit/core';
import { RosterGroup, RosterUnit } from '@/types';
import { useRoster } from '@/hooks/useRoster';
import { ArmyRosterUnit } from './ArmyRosterUnit';

interface ArmyRosterGroupProps {
  group: RosterGroup | null; // null for ungrouped
  units: RosterUnit[];
}

export function ArmyRosterGroup({ group, units }: ArmyRosterGroupProps) {
  const { deleteGroup, renameGroup, toggleGroupCollapsed, isEditMode } = useRoster();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group?.name || '');

  const { setNodeRef, isOver } = useDroppable({
    id: group ? `group-${group.id}` : 'group-ungrouped',
  });

  const handleSaveName = () => {
    if (group && editName.trim()) {
      renameGroup(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditName(group?.name || '');
      setIsEditing(false);
    }
  };

  const groupHeader = group ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <IconButton
        size="small"
        onClick={() => toggleGroupCollapsed(group.id)}
        sx={{ color: 'primary.main' }}
      >
        {group.collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      </IconButton>

      {isEditing && isEditMode ? (
        <TextField
          size="small"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyPress}
          autoFocus
          sx={{
            flex: 1,
            '& input': { fontFamily: 'monospace' },
          }}
        />
      ) : (
        <Typography
          variant="h6"
          sx={{
            color: 'primary.main',
            cursor: isEditMode ? 'pointer' : 'default',
            fontFamily: 'monospace',
            flex: 1,
          }}
          onClick={() => {
            if (isEditMode) {
              setEditName(group.name);
              setIsEditing(true);
            }
          }}
        >
          [{group.name.toUpperCase()}]
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        ({units.length} {units.length === 1 ? 'unit' : 'units'})
      </Typography>

      {isEditMode && (
        <IconButton size="small" onClick={() => deleteGroup(group.id)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  ) : (
    <Typography
      variant="h6"
      sx={{ color: 'secondary.main', mb: 1, fontFamily: 'monospace' }}
    >
      [UNGROUPED UNITS]
    </Typography>
  );

  const isCollapsed = group?.collapsed || false;

  return (
    <Box
      ref={setNodeRef}
      sx={{
        mb: 2,
        p: 1,
        borderRadius: 1,
        bgcolor: isOver ? 'action.hover' : 'transparent',
        border: isOver ? '2px dashed' : '2px solid transparent',
        borderColor: isOver ? 'primary.main' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      {groupHeader}

      {!isCollapsed && (
        <Stack spacing={1} sx={{ ml: group ? 2 : 0 }}>
          {units.map((unit) => (
            <ArmyRosterUnit key={unit.id} rosterUnit={unit} />
          ))}
          {units.length === 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: 'italic', fontFamily: 'monospace' }}
            >
              {isOver ? 'Drop unit here' : 'No units in this group'}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
