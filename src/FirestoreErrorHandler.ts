export function getFirestoreErrorMessage(error: { code: string }) {
  const errorMessages: Record<string, string> = {
    'permission-denied': 'You do not have permission to access this resource.',
    'not-found': 'The requested document was not found.',
    'unavailable': 'Firestore service is currently unavailable.',
    'deadline-exceeded': 'The request took too long to complete.',
    'resource-exhausted': 'Quota exceeded or resource limit reached.',
  };

  return errorMessages[error.code] || 'An unknown Firestore error occurred.';
}
