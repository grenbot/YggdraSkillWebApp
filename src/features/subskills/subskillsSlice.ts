import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from '../../firebaseConfig';
import { getFirestoreErrorMessage } from '../../FirestoreErrorHandler';

export interface SubskillsState {
  error?: string | null;
  [nodeId: string]: string[] | string | null | undefined;
}

const initialState: SubskillsState = {
  error: null,
};

const subskillsSlice = createSlice({
  name: 'subskills',
  initialState,
  reducers: {
    initializeSubskills: (
      state,
      action: PayloadAction<{ nodeId: string; subskills: string[] }>
    ) => {
      const { nodeId, subskills } = action.payload;
      state[nodeId] = subskills;
    },
    toggleSubskill: (
      state,
      action: PayloadAction<{ nodeId: string; subskill: string }>
    ) => {
      const { nodeId, subskill } = action.payload;
      const currentSubskills = (state[nodeId] as string[]) || [];
      state[nodeId] = currentSubskills.includes(subskill)
        ? currentSubskills.filter((s) => s !== subskill)
        : [...currentSubskills, subskill];
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  initializeSubskills,
  toggleSubskill,
  setError,
  clearError,
} = subskillsSlice.actions;

export const fetchSubskills =
  ({ treeId, nodeId }: { treeId: string; nodeId: string }) =>
  async (dispatch: any) => {
    try {
      const nodesCollectionRef = collection(db, `trees/${treeId}/nodes`);
      const nodesSnap = await getDocs(nodesCollectionRef);

      const foundNode = nodesSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as { subskills?: string[] }),
        }))
        .find((n) => n.id === nodeId);

      if (!foundNode || !foundNode.subskills) {
        throw new Error(`Node with ID ${nodeId} not found or has no subskills`);
      }

      dispatch(
        initializeSubskills({
          nodeId,
          subskills: foundNode.subskills,
        })
      );
      dispatch(clearError());
    } catch (error) {
      const errorMessage = getFirestoreErrorMessage(error);
      console.error('Firestore error:', errorMessage);
      dispatch(setError(errorMessage));
    }
  };

export default subskillsSlice.reducer;
