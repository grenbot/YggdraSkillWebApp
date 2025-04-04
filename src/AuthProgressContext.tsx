import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useDispatch } from 'react-redux';
import { updateAuthChecked, updateUser, updateMetadata } from './features/auth/authSlice';
import { AppUser, TreeProgress } from './types/sharedTypes';
import { loadProgress } from './loadProgress';
import { saveProgress } from './features/progress/progressSlice';

interface AuthProgressContextValue {
  authChecked: boolean;
  user: AppUser | null;
  metadata: any;
  dispatch: React.Dispatch<{ type: string; payload?: any }>;
}

export const AuthProgressContext = createContext<AuthProgressContextValue>({
  authChecked: false,
  user: null,
  metadata: null,
  dispatch: () => {}, // no-op to satisfy typing
});

interface State {
  authChecked: boolean;
  user: AppUser | null;
  metadata: any;
}

const initialState: State = {
  authChecked: false,
  user: null,
  metadata: null,
};

function reducer(state: State, action: { type: string; payload?: any }): State {
  switch (action.type) {
    case 'SET_AUTH_CHECKED':
      return { ...state, authChecked: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_METADATA':
      return { ...state, metadata: action.payload };
    default:
      return state;
  }
}

interface AuthProgressProviderProps {
  children: ReactNode;
}

export const AuthProgressProvider: React.FC<AuthProgressProviderProps> = ({ children }) => {
  const [state, localDispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await getIdTokenResult(user);
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
        };

        localDispatch({ type: 'SET_USER', payload: appUser });
        localDispatch({ type: 'SET_METADATA', payload: tokenResult.claims });
        localDispatch({ type: 'SET_AUTH_CHECKED', payload: true });

        reduxDispatch(updateUser(appUser));
        reduxDispatch(updateMetadata(tokenResult.claims));
        reduxDispatch(updateAuthChecked(true));

        // Load progress and dispatch to Redux
        try {
          const treeIds = ['math']; // TODO: dynamically fetch user’s enrolled tree IDs
          for (const treeId of treeIds) {
            const treeProgress: TreeProgress = await loadProgress(user.uid, treeId);
            Object.entries(treeProgress).forEach(([nodeId, nodeProgress]) => {
              reduxDispatch(
                saveProgress({
                  treeId,
                  nodeId,
                  subskills: nodeProgress.subskills,
                })
              );
            });
          }
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      } else {
        localDispatch({ type: 'SET_USER', payload: null });
        localDispatch({ type: 'SET_METADATA', payload: null });
        localDispatch({ type: 'SET_AUTH_CHECKED', payload: true });

        reduxDispatch(updateUser(null));
        reduxDispatch(updateMetadata(null));
        reduxDispatch(updateAuthChecked(true));
      }
    });

    return () => unsubscribe();
  }, [reduxDispatch]);

  return (
    <AuthProgressContext.Provider value={{ ...state, dispatch: localDispatch }}>
      {children}
    </AuthProgressContext.Provider>
  );
};
