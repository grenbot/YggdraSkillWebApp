import { createSlice } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from '../../firebaseConfig';
import { getFirestoreErrorMessage } from '../../FirestoreErrorHandler';

const subskillsSlice = createSlice({
  name: 'subskills',
  initialState: { error: null },
  reducers: {
    initializeSubskills: (state, action) => {
      const { nodeId, subskills } = action.payload;
      state[nodeId] = subskills;
    },
    toggleSubskill: (state, action) => {
      const { nodeId, subskill } = action.payload;
      const currentSubskills = state[nodeId] || [];
      state[nodeId] = currentSubskills.includes(subskill)
        ? currentSubskills.filter((s) => s !== subskill)
        : [...currentSubskills, subskill];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { initializeSubskills, toggleSubskill, setError, clearError } =
  subskillsSlice.actions;

export const fetchSubskills = async (treeId, nodeId) => async (dispatch) => {
  console.log('[fetchSubskills] Fetching subskills for:', { treeId, nodeId });

  try {
    const nodesCollectionRef = collection(db, `trees/${treeId}/nodes`);
    const nodesSnap = await getDocs(nodesCollectionRef);
    console.log('[fetchSubskills] Nodes fetched:', nodesSnap.docs.length);

    const foundNode = nodesSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .find((n) => n.id === nodeId);

    if (!foundNode) {
      throw new Error(`Node with ID ${nodeId} not found in tree ${treeId}`);
    }

    console.log(
      '[fetchSubskills] Subskills initialized for node:',
      nodeId,
      foundNode.subskills || []
    );
    dispatch(
      initializeSubskills({ nodeId, subskills: foundNode.subskills || [] })
    );
    dispatch(clearError());
  } catch (error) {
    const errorMessage = getFirestoreErrorMessage(error);
    console.error('Firestore error:', errorMessage);
    dispatch(setError(errorMessage));
  }
};

export default subskillsSlice.reducer;
