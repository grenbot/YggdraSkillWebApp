import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useDispatch } from 'react-redux';
import { updateAuthChecked, updateUser, updateMetadata } from './features/auth/authSlice';
import { AppUser, TreeProgress, SkillTree } from './types/sharedTypes';
import { loadProgress } from './loadProgress';
import { saveProgress } from './features/progress/progressSlice';
import { loadTreeMetadata } from './utils/loadTreeMetadata';

interface AuthProgressContextValue {
  authChecked: boolean;
  user: AppUser | null;
  metadata: Record<string, SkillTree> | null;
  dispatch: React.Dispatch<{ type: string; payload?: any }>;
}

export const AuthProgressContext = createContext<AuthProgressContextValue>({
  authChecked: false,
  user: null,
  metadata: null,
  dispatch: () => {},
});

interface State {
  authChecked: boolean;
  user: AppUser | null;
  metadata: Record<string, SkillTree> | null;
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
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.payload,
        },
      };
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
        reduxDispatch(updateUser(appUser));
        reduxDispatch(updateMetadata(tokenResult.claims));
        localDispatch({ type: 'SET_AUTH_CHECKED', payload: true });
        reduxDispatch(updateAuthChecked(true));

        // Load progress + metadata for known tree IDs
        try {
          const treeIds = ['math']; // TODO: dynamically detect user’s enrolled trees

          for (const treeId of treeIds) {
            // Load progress
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

            // Load metadata
            const treeMetadata = await loadTreeMetadata(treeId);
            localDispatch({
              type: 'SET_METADATA',
              payload: { [treeId]: treeMetadata },
            });
          }
        } catch (error) {
          console.error('Error loading progress or metadata:', error);
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

export default AuthProgressProvider;

/**
 * NOTES:
 *
 * - This provider handles Firebase Authentication + Firestore integration for progress and tree metadata.
 * - Wrap your app in <AuthProgressProvider> to ensure user state and progress are globally accessible.
 *
 * Dependencies:
 * - Redux store with: updateUser, updateMetadata, updateAuthChecked, saveProgress
 * - Firestore utils: loadProgress(treeId), loadTreeMetadata(treeId)
 * - Firebase auth instance (from firebaseConfig.ts)
 * - App types: SkillTree, AppUser (from sharedTypes.ts)
 *
 * Consumption:
 * - Use `useContext(AuthProgressContext)` in components to access:
 *   { authChecked, user, metadata, dispatch }
 *
 * Scaling Notes:
 * - Dynamically expand `treeIds[]` to support full forest loading
 * - Consider background loading of new trees as user engages them
 */
