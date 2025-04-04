// File: src/features/auth/__tests__/authSlice.test.ts

import authReducer from '../authSlice';

describe('auth slice', () => {
  it('should return the initial state', () => {
    const initialState = authReducer(undefined, { type: 'TEST_ACTION' });
    expect(initialState).toBeDefined();
  });
});
