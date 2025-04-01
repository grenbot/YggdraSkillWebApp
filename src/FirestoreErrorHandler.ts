// FirestoreErrorHandler.js
export const getFirestoreErrorMessage = (error) => {
  const errorMap = {
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'Requested data was not found.',
    unavailable: 'Firestore service is currently unavailable. Try again later.',
    'deadline-exceeded': 'The request took too long. Please retry.',
    'resource-exhausted': 'Quota exceeded. Please try again later.',
  };
  return (
    errorMap[error.code] ||
    'An unexpected Firestore error occurred. Please try again later.'
  );
};
