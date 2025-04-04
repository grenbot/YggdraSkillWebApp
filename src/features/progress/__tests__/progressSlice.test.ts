// File: src/features/progress/__tests__/progressSlice.test.ts

import progressReducer from '../progressSlice';

describe('progress slice', () => {
  it('should return the initial state', () => {
    const initialState = progressReducer(undefined, { type: 'TEST_ACTION' });
    expect(initialState).toBeDefined();
  });
});
