import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from './firebaseConfig';
import { useDispatch } from 'react-redux';
import {
  updateAuthChecked,
  updateUser,
  updateMetadata,
} from './features/progress/progressSlice';
import { getAuthErrorMessage } from './authErrorHandler';

// Create the context
const AuthProgressContext = createContext(null);

// Provider Component
export const AuthProgressProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const serializableUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          };

          dispatch(updateUser(serializableUser));

          const docRef = doc(db, 'progress', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            dispatch(updateMetadata(docSnap.data().metadata));
          }
        } else {
          dispatch(updateUser(null));
        }
      } catch (error) {
        console.error('Authentication error:', getAuthErrorMessage(error));
      }

      dispatch(updateAuthChecked(true));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <AuthProgressContext.Provider value={{}}>
      {children}
    </AuthProgressContext.Provider>
  );
};

// Custom hook for using the context
export const useAuthProgress = () => {
  const context = useContext(AuthProgressContext);
  if (!context) {
    throw new Error(
      'useAuthProgress must be used within an AuthProgressProvider'
    );
  }
  return context;
};
