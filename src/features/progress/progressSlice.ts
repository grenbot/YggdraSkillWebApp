import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ForestProgress, NodeProgress } from '../../types/sharedTypes';

// ✅ Type-safe state with internal `trees` object and `error`
export interface ProgressState {
  trees: ForestProgress;
  error?: string | null;
}

// ✅ Properly typed initial state
const initialState: ProgressState = {
  trees: {},
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    saveProgress: (
      state,
      action: PayloadAction<{
        treeId: string;
        nodeId: string;
        subskills: string[];
      }>
    ) => {
      const { treeId, nodeId, subskills } = action.payload;

      if (!state.trees[treeId]) {
        state.trees[treeId] = {};
      }

      state.trees[treeId]![nodeId] = {
        subskills,
        completedAt: new Date().toISOString(),
      } as NodeProgress;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { saveProgress, setError, clearError } = progressSlice.actions;
export default progressSlice.reducer;
