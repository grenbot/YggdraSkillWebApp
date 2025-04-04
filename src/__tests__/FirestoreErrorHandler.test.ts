// File: src/__tests__/FirestoreErrorHandler.test.ts

import { getFirestoreErrorMessage } from '../FirestoreErrorHandler';

describe('getFirestoreErrorMessage', () => {
  it('should return a string error message when given a Firestore error object', () => {
    const mockError = { code: 'permission-denied' };
    const result = getFirestoreErrorMessage(mockError);
    expect(typeof result).toBe('string');
  });
});
