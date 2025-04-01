import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProgressState {
  error?: string | null;
  [treeId: string]: { [nodeId: string]: string[] } | string | null | undefined;
}

const initialState: ProgressState = {
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

      if (typeof state[treeId] !== 'object' || state[treeId] === null) {
        state[treeId] = {};
      }

      (state[treeId] as { [nodeId: string]: string[] })[nodeId] = subskills;
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
