import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  authChecked: boolean;
  user: any;         // Replace with proper user model if known
  metadata: any;     // Replace with proper metadata type
}

const initialState: AuthState = {
  authChecked: false,
  user: null,
  metadata: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuthChecked(state, action: PayloadAction<boolean>) {
      state.authChecked = action.payload;
    },
    updateUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
    },
    updateMetadata(state, action: PayloadAction<any>) {
      state.metadata = action.payload;
    },
  },
});

export const { updateAuthChecked, updateUser, updateMetadata } = authSlice.actions;
export default authSlice.reducer;
