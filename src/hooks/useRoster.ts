import { useCallback, useMemo } from 'react';
import { useRosterContext } from '@contexts/RosterContext';
import { useFactionDataContext } from '@contexts/FactionDataContext';
import { Roster, RosterUnit, Unit, UnitRelationship } from '../types';
import { calculateTotalPoints } from '@utils/roster';
import { validateRoster, validateTransportCapacity } from '@utils/validation';
import { generateShareURL, copyToClipboard } from '@utils/rosterShare';

export function useRoster() {
  const { state, dispatch } = useRosterContext();
  const { getUnitById } = useFactionDataContext();

  const createRoster = useCallback((name: string, factionId: string, pointsLimit: number) => {
    const newRoster: Roster = {
      id: crypto.randomUUID(),
      name,
      factionId,
      pointsLimit,
      units: [],
      groups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_ROSTER', payload: newRoster });
    return newRoster;
  }, [dispatch]);

  const loadRoster = useCallback((roster: Roster) => {
    dispatch({ type: 'LOAD_ROSTER', payload: roster });
  }, [dispatch]);

  const updateRoster = useCallback((updates: Partial<Roster>) => {
    dispatch({ type: 'UPDATE_ROSTER', payload: updates });
  }, [dispatch]);

  const deleteRoster = useCallback((rosterId: string) => {
    dispatch({ type: 'DELETE_ROSTER', payload: rosterId });
  }, [dispatch]);

  const addUnit = useCallback((unitId: string) => {
    if (!state.currentRoster) return;

    const rosterUnit: RosterUnit = {
      id: crypto.randomUUID(),
      unitId,
      count: 1,
    };
    dispatch({ type: 'ADD_UNIT', payload: rosterUnit });
  }, [state.currentRoster, dispatch]);

  const removeUnit = useCallback((rosterUnitId: string) => {
    dispatch({ type: 'REMOVE_UNIT', payload: rosterUnitId });
  }, [dispatch]);

  const updateUnit = useCallback((rosterUnit: RosterUnit) => {
    dispatch({ type: 'UPDATE_UNIT', payload: rosterUnit });
  }, [dispatch]);

  const reorderUnits = useCallback((units: RosterUnit[]) => {
    dispatch({ type: 'REORDER_UNITS', payload: units });
  }, [dispatch]);

  const clearCurrentRoster = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_ROSTER' });
  }, [dispatch]);

  // Group management
  const createGroup = useCallback((name?: string) => {
    dispatch({ type: 'CREATE_GROUP', payload: { name } });
  }, [dispatch]);

  const deleteGroup = useCallback((groupId: string) => {
    dispatch({ type: 'DELETE_GROUP', payload: groupId });
  }, [dispatch]);

  const renameGroup = useCallback((groupId: string, name: string) => {
    dispatch({ type: 'RENAME_GROUP', payload: { groupId, name } });
  }, [dispatch]);

  const moveUnitToGroup = useCallback((unitId: string, groupId: string | null) => {
    dispatch({ type: 'MOVE_UNIT_TO_GROUP', payload: { unitId, groupId } });
  }, [dispatch]);

  const toggleGroupCollapsed = useCallback((groupId: string) => {
    dispatch({ type: 'TOGGLE_GROUP_COLLAPSED', payload: groupId });
  }, [dispatch]);

  // Relationship management
  const setUnitRelationship = useCallback((unitId: string, relationship: UnitRelationship | null) => {
    dispatch({ type: 'SET_UNIT_RELATIONSHIP', payload: { unitId, relationship } });
  }, [dispatch]);

  const clearUnitRelationship = useCallback((unitId: string) => {
    dispatch({ type: 'CLEAR_UNIT_RELATIONSHIP', payload: unitId });
  }, [dispatch]);

  // Get units with full data
  const rosterUnitsWithData = useMemo(() => {
    if (!state.currentRoster) return [];

    return state.currentRoster.units
      .map((rosterUnit) => {
        const unit = getUnitById(state.currentRoster!.factionId, rosterUnit.unitId);
        if (!unit) return null;
        return { rosterUnit, unit };
      })
      .filter((item): item is { rosterUnit: RosterUnit; unit: Unit } => item !== null);
  }, [state.currentRoster, getUnitById]);

  // Calculate total points
  const totalPoints = useMemo(() => {
    if (!state.currentRoster) return 0;
    return calculateTotalPoints(rosterUnitsWithData);
  }, [state.currentRoster, rosterUnitsWithData]);

  // Validation
  const validationErrors = useMemo(() => {
    if (!state.currentRoster) return [];
    return validateRoster(state.currentRoster, rosterUnitsWithData, totalPoints);
  }, [state.currentRoster, rosterUnitsWithData, totalPoints]);

  const transportValidations = useMemo(() => {
    if (!state.currentRoster) return [];
    return validateTransportCapacity(rosterUnitsWithData);
  }, [rosterUnitsWithData]);

  // Share functions
  const generateShareLink = useCallback(async (): Promise<string | null> => {
    if (!state.currentRoster) return null;
    try {
      return generateShareURL(state.currentRoster);
    } catch (error) {
      console.error('Failed to generate share link:', error);
      return null;
    }
  }, [state.currentRoster]);

  const shareRoster = useCallback(async (): Promise<boolean> => {
    const shareLink = await generateShareLink();
    if (!shareLink) return false;
    return await copyToClipboard(shareLink);
  }, [generateShareLink]);

  const cloneSharedRoster = useCallback(() => {
    dispatch({ type: 'CLONE_SHARED_ROSTER' });
  }, [dispatch]);

  const saveRoster = useCallback(() => {
    dispatch({ type: 'SAVE_ROSTER' });
  }, [dispatch]);

  const enterEditMode = useCallback(() => {
    dispatch({ type: 'ENTER_EDIT_MODE' });
  }, [dispatch]);

  return {
    currentRoster: state.currentRoster,
    savedRosters: state.savedRosters,
    isSharedRoster: state.isSharedRoster,
    isEditMode: state.isEditMode,
    rosterUnitsWithData,
    totalPoints,
    createRoster,
    loadRoster,
    updateRoster,
    deleteRoster,
    addUnit,
    removeUnit,
    updateUnit,
    reorderUnits,
    clearCurrentRoster,
    // Group functions
    createGroup,
    deleteGroup,
    renameGroup,
    moveUnitToGroup,
    toggleGroupCollapsed,
    // Relationship functions
    setUnitRelationship,
    clearUnitRelationship,
    // Validation
    validationErrors,
    transportValidations,
    // Share functions
    generateShareLink,
    shareRoster,
    cloneSharedRoster,
    // Edit mode functions
    saveRoster,
    enterEditMode,
  };
}
