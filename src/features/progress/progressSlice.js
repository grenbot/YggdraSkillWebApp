import { createSlice } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { db, auth } from '../../firebaseConfig';
import { getFirestoreErrorMessage } from '../../FirestoreErrorHandler';

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    metadata: {
      authChecked: false,
      user: null,
      mostRecentTree: '',
      overallProgress: 0,
    },
    error: null, // Track Firestore errors
  },
  reducers: {
    updateAuthChecked: (state, action) => {
      state.metadata.authChecked = action.payload;
    },
    updateUser: (state, action) => {
      state.metadata.user = action.payload;
    },
    updateMetadata: (state, action) => {
      const { mostRecentTree, overallProgress } = action.payload;
      state.metadata = {
        ...state.metadata,
        mostRecentTree,
        overallProgress,
      };
    },
    setProgress: (state, action) => {
      const { treeId, nodeId, completedSubskills } = action.payload;
      if (!state[treeId]) {
        state[treeId] = {};
      }
      state[treeId][nodeId] = completedSubskills;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updateAuthChecked,
  updateUser,
  updateMetadata,
  setProgress,
  setError,
  clearError,
} = progressSlice.actions;

// Enhanced Thunk with Error Handling
export const saveProgress =
  (treeId, nodeId, completedSubskills) => async (dispatch, getState) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not logged in!');
      dispatch(setError('User is not authenticated.'));
      return;
    }

    try {
      const state = getState();
      const docRef = doc(db, 'progress', user.uid);
      const currentTreeProgress = state.progress[treeId] || {};
      const updatedTreeProgress = {
        ...currentTreeProgress,
        [nodeId]: completedSubskills,
      };

      const totalCompletedSubskills =
        Object.values(updatedTreeProgress).flat().length;
      const totalNodes = Object.keys(updatedTreeProgress).length || 1;
      const overallProgress = Math.round(
        (totalCompletedSubskills / totalNodes) * 100
      );

      const updatedProgress = {
        ...state.progress,
        [treeId]: updatedTreeProgress,
        metadata: {
          mostRecentTree: treeId,
          overallProgress,
        },
      };

      await setDoc(docRef, updatedProgress, { merge: true });
      dispatch(setProgress({ treeId, nodeId, completedSubskills }));
      dispatch(updateMetadata({ mostRecentTree: treeId, overallProgress }));
      dispatch(clearError()); // Clear error on success
    } catch (error) {
      const errorMessage = getFirestoreErrorMessage(error);
      console.error('Firestore error:', errorMessage);
      dispatch(setError(errorMessage));
    }
  };

export default progressSlice.reducer;
