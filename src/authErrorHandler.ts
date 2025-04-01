// authErrorHandler.js

export const getAuthErrorMessage = (error) => {
  const errorMap = {
    'auth/email-already-in-use':
      'This email is already in use. Try logging in.',
    'auth/invalid-email': 'Invalid email format. Please check and try again.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/wrong-password': 'Incorrect password. Try again.',
    'auth/too-many-requests':
      'Too many failed attempts. Please wait before retrying.',
  };

  return (
    errorMap[error.code] ||
    'An unexpected error occurred. Please try again later.'
  );
};
