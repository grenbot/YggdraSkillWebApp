// File: src/features/subskills/__tests__/subskillsSlice.test.ts

import subskillsReducer from '../subskillsSlice';

describe('subskills slice', () => {
  it('should return the initial state', () => {
    const initialState = subskillsReducer(undefined, { type: 'TEST_ACTION' });
    expect(initialState).toBeDefined();
  });
});
