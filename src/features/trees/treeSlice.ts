import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, query, limit, startAfter, getFirestore, QueryDocumentSnapshot } from 'firebase/firestore';
import { SkillTree } from '../../types/sharedTypes';
import { getFirestoreErrorMessage } from '../../FirestoreErrorHandler';

interface TreeState {
  trees: SkillTree[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastVisible: QueryDocumentSnapshot | null;
}

const initialState: TreeState = {
  trees: [],
  status: 'idle',
  error: null,
  lastVisible: null,
};

export const fetchTrees = createAsyncThunk<
  { trees: SkillTree[]; lastVisible: QueryDocumentSnapshot | null },
  { pageSize: number; startAfterDoc?: QueryDocumentSnapshot | null },
  { rejectValue: string }
>('trees/fetchTrees', async ({ pageSize, startAfterDoc }, { rejectWithValue }) => {
  const db = getFirestore();
  try {
    let q = query(collection(db, 'trees'), limit(pageSize));
    if (startAfterDoc) {
      q = query(collection(db, 'trees'), startAfter(startAfterDoc), limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    const fetchedTrees: SkillTree[] = [];

    querySnapshot.forEach((doc) => {
      fetchedTrees.push({ key: doc.id, ...doc.data() } as SkillTree);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { trees: fetchedTrees, lastVisible };
  } catch (error) {
    const message = getFirestoreErrorMessage(error as { code: string });
    return rejectWithValue(message);
  }
});

const treeSlice = createSlice({
  name: 'trees',
  initialState,
  reducers: {
    setFilteredTrees: (state, action: PayloadAction<SkillTree[]>) => {
      state.trees = action.payload;
    },
    clearTrees: (state) => {
      state.trees = [];
      state.status = 'idle';
      state.error = null;
      state.lastVisible = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTrees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trees = [...state.trees, ...action.payload.trees];
        state.lastVisible = action.payload.lastVisible;
      })
      .addCase(fetchTrees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load trees';
      });
  },
});

export const { setFilteredTrees, clearTrees } = treeSlice.actions;
export default treeSlice.reducer;
