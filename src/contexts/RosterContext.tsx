import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Roster, RosterUnit, UnitRelationship } from '../types';
import { produce } from 'immer';
import { createGroup } from '../utils/roster';
import { migrateAllRosters } from '../utils/migration';
import { getShareCodeFromURL, decodeRosterFromShare, clearShareCodeFromURL } from '../utils/rosterShare';

interface RosterState {
  currentRoster: Roster | null;
  savedRosters: Roster[];
  isSharedRoster: boolean; // True if current roster is from a share link (read-only)
  isEditMode: boolean; // True when actively editing a roster
}

type RosterAction =
  | { type: 'CREATE_ROSTER'; payload: Roster }
  | { type: 'LOAD_ROSTER'; payload: Roster }
  | { type: 'UPDATE_ROSTER'; payload: Partial<Roster> }
  | { type: 'DELETE_ROSTER'; payload: string }
  | { type: 'ADD_UNIT'; payload: RosterUnit }
  | { type: 'REMOVE_UNIT'; payload: string }
  | { type: 'UPDATE_UNIT'; payload: RosterUnit }
  | { type: 'REORDER_UNITS'; payload: RosterUnit[] }
  | { type: 'LOAD_SAVED_ROSTERS'; payload: Roster[] }
  | { type: 'CLEAR_CURRENT_ROSTER' }
  | { type: 'CREATE_GROUP'; payload: { name?: string } }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'RENAME_GROUP'; payload: { groupId: string; name: string } }
  | { type: 'MOVE_UNIT_TO_GROUP'; payload: { unitId: string; groupId: string | null } }
  | { type: 'TOGGLE_GROUP_COLLAPSED'; payload: string }
  | { type: 'SET_UNIT_RELATIONSHIP'; payload: { unitId: string; relationship: UnitRelationship | null } }
  | { type: 'CLEAR_UNIT_RELATIONSHIP'; payload: string }
  | { type: 'LOAD_SHARED_ROSTER'; payload: Roster }
  | { type: 'CLONE_SHARED_ROSTER' }
  | { type: 'SAVE_ROSTER' }
  | { type: 'ENTER_EDIT_MODE' };

const STORAGE_KEY = 'firelock_rosters';

function rosterReducer(state: RosterState, action: RosterAction): RosterState {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'CREATE_ROSTER':
        draft.currentRoster = action.payload;
        draft.isEditMode = true; // New rosters start in edit mode
        draft.isSharedRoster = false;
        break;

      case 'LOAD_ROSTER':
        draft.currentRoster = action.payload;
        draft.isEditMode = false; // Loaded rosters start in read-only mode
        draft.isSharedRoster = false;
        break;

      case 'UPDATE_ROSTER':
        if (draft.currentRoster) {
          Object.assign(draft.currentRoster, action.payload);
          draft.currentRoster.updatedAt = new Date().toISOString();
        }
        break;

      case 'DELETE_ROSTER':
        draft.savedRosters = draft.savedRosters.filter(
          (r) => r.id !== action.payload
        );
        if (draft.currentRoster?.id === action.payload) {
          draft.currentRoster = null;
        }
        break;

      case 'ADD_UNIT':
        if (draft.currentRoster && draft.isEditMode) {
          draft.currentRoster.units.push(action.payload);
          draft.currentRoster.updatedAt = new Date().toISOString();
        }
        break;

      case 'REMOVE_UNIT':
        if (draft.currentRoster && draft.isEditMode) {
          draft.currentRoster.units = draft.currentRoster.units.filter(
            (u) => u.id !== action.payload
          );
          draft.currentRoster.updatedAt = new Date().toISOString();
        }
        break;

      case 'UPDATE_UNIT':
        if (draft.currentRoster) {
          const index = draft.currentRoster.units.findIndex(
            (u) => u.id === action.payload.id
          );
          if (index !== -1) {
            // Allow relationship changes even when not in edit mode (for play mode)
            const oldUnit = draft.currentRoster.units[index];
            const onlyRelationshipChanged =
              oldUnit.unitId === action.payload.unitId &&
              oldUnit.count === action.payload.count &&
              oldUnit.customName === action.payload.customName &&
              JSON.stringify(oldUnit.selectedOptions) === JSON.stringify(action.payload.selectedOptions) &&
              oldUnit.groupId === action.payload.groupId;

            if (draft.isEditMode || onlyRelationshipChanged) {
              draft.currentRoster.units[index] = action.payload;
              draft.currentRoster.updatedAt = new Date().toISOString();
            }
          }
        }
        break;

      case 'REORDER_UNITS':
        if (draft.currentRoster && draft.isEditMode) {
          draft.currentRoster.units = action.payload;
          draft.currentRoster.updatedAt = new Date().toISOString();
        }
        break;

      case 'LOAD_SAVED_ROSTERS':
        draft.savedRosters = action.payload;
        break;

      case 'CLEAR_CURRENT_ROSTER':
        draft.currentRoster = null;
        break;

      case 'CREATE_GROUP':
        if (draft.currentRoster && draft.isEditMode) {
          const newGroup = createGroup(action.payload.name);
          draft.currentRoster.groups.push(newGroup);
          draft.currentRoster.updatedAt = new Date().toISOString();
        }
        break;

      case 'DELETE_GROUP':
        if (draft.currentRoster && draft.isEditMode) {
          // Remove group
          draft.currentRoster.groups = draft.currentRoster.groups.filter(
            (g) => g.id !== action.payload
          );
          // Ungroup all units in this group
          draft.currentRoster.units.forEach((unit) => {
            if (unit.groupId === action.payload) {
              unit.groupId = undefined;
            }
          });
          draft.currentRoster.updatedAt = new Date().toISOString();
        }
        break;

      case 'RENAME_GROUP':
        if (draft.currentRoster && draft.isEditMode) {
          const group = draft.currentRoster.groups.find(
            (g) => g.id === action.payload.groupId
          );
          if (group) {
            group.name = action.payload.name;
            draft.currentRoster.updatedAt = new Date().toISOString();
          }
        }
        break;

      case 'MOVE_UNIT_TO_GROUP':
        if (draft.currentRoster && draft.isEditMode) {
          const unit = draft.currentRoster.units.find(
            (u) => u.id === action.payload.unitId
          );
          if (unit) {
            unit.groupId = action.payload.groupId ?? undefined;
            draft.currentRoster.updatedAt = new Date().toISOString();
          }
        }
        break;

      case 'TOGGLE_GROUP_COLLAPSED':
        // Allow collapsing even in read-only mode (doesn't change roster data)
        if (draft.currentRoster) {
          const group = draft.currentRoster.groups.find((g) => g.id === action.payload);
          if (group) {
            group.collapsed = !group.collapsed;
          }
        }
        break;

      case 'SET_UNIT_RELATIONSHIP':
        if (draft.currentRoster && draft.isEditMode) {
          const unit = draft.currentRoster.units.find(
            (u) => u.id === action.payload.unitId
          );
          if (unit) {
            unit.relationship = action.payload.relationship ?? undefined;
            draft.currentRoster.updatedAt = new Date().toISOString();
          }
        }
        break;

      case 'CLEAR_UNIT_RELATIONSHIP':
        if (draft.currentRoster && draft.isEditMode) {
          const unit = draft.currentRoster.units.find((u) => u.id === action.payload);
          if (unit) {
            unit.relationship = undefined;
            draft.currentRoster.updatedAt = new Date().toISOString();
          }
        }
        break;

      case 'LOAD_SHARED_ROSTER':
        draft.currentRoster = action.payload;
        draft.isSharedRoster = true;
        draft.isEditMode = false;
        break;

      case 'CLONE_SHARED_ROSTER':
        if (draft.currentRoster && draft.isSharedRoster) {
          // Create a new roster with a new ID and timestamp
          const clonedRoster: Roster = {
            ...draft.currentRoster,
            id: crypto.randomUUID(),
            name: `${draft.currentRoster.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          draft.currentRoster = clonedRoster;
          draft.savedRosters.push(clonedRoster);
          draft.isSharedRoster = false;
          draft.isEditMode = false;
        }
        break;

      case 'SAVE_ROSTER':
        if (draft.currentRoster && draft.isEditMode) {
          draft.currentRoster.updatedAt = new Date().toISOString();

          // Update or add to saved rosters
          const index = draft.savedRosters.findIndex(
            (r) => r.id === draft.currentRoster!.id
          );
          if (index !== -1) {
            draft.savedRosters[index] = draft.currentRoster;
          } else {
            draft.savedRosters.push(draft.currentRoster);
          }

          draft.isEditMode = false;
        }
        break;

      case 'ENTER_EDIT_MODE':
        if (draft.currentRoster && !draft.isSharedRoster) {
          draft.isEditMode = true;
        }
        break;
    }
  });
}

const initialState: RosterState = {
  currentRoster: null,
  savedRosters: [],
  isSharedRoster: false,
  isEditMode: false,
};

const RosterContext = createContext<{
  state: RosterState;
  dispatch: React.Dispatch<RosterAction>;
} | null>(null);

export function RosterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rosterReducer, initialState);

  // Check for shared roster in URL on mount
  useEffect(() => {
    const shareCode = getShareCodeFromURL();
    if (shareCode) {
      const sharedRoster = decodeRosterFromShare(shareCode);
      if (sharedRoster) {
        dispatch({ type: 'LOAD_SHARED_ROSTER', payload: sharedRoster });
        // Clear share code from URL after loading
        clearShareCodeFromURL();
        // Still load saved rosters in background
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const rosters = JSON.parse(saved);
            const migratedRosters = migrateAllRosters(rosters);
            dispatch({ type: 'LOAD_SAVED_ROSTERS', payload: migratedRosters });
          }
        } catch (err) {
          console.error('Failed to load rosters from localStorage:', err);
        }
        return;
      }
    }

    // Load rosters from localStorage if no shared roster
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const rosters = JSON.parse(saved);
        const migratedRosters = migrateAllRosters(rosters);
        dispatch({ type: 'LOAD_SAVED_ROSTERS', payload: migratedRosters });
      }
    } catch (err) {
      console.error('Failed to load rosters from localStorage:', err);
    }
  }, []);

  // Save rosters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedRosters));
    } catch (err) {
      console.error('Failed to save rosters to localStorage:', err);
    }
  }, [state.savedRosters]);

  return (
    <RosterContext.Provider value={{ state, dispatch }}>
      {children}
    </RosterContext.Provider>
  );
}

export function useRosterContext() {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRosterContext must be used within RosterProvider');
  }
  return context;
}
