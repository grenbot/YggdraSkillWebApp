import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import NodePage from '../NodePage';
import type { RootState } from '../store';

import subskillsReducer from '../features/subskills/subskillsSlice';
import progressReducer from '../features/progress/progressSlice';
import authReducer from '../features/auth/authSlice';
import treesReducer from '../features/trees/treeSlice';

// Combine reducers exactly as in your store.ts
const rootReducer = combineReducers({
  subskills: subskillsReducer,
  progress: progressReducer,
  auth: authReducer,
  trees: treesReducer,
});

// Persist configuration (same as in store.ts)
const persistConfig = {
  key: 'root',
  storage,
};

// Create the persisted reducer to include the _persist key in the state shape
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 🔧 Only mock action creators, not the whole module
jest.mock('../features/subskills/subskillsSlice', () => {
  const actual = jest.requireActual('../features/subskills/subskillsSlice');
  return {
    __esModule: true,
    ...actual,
    // Ensure the action type matches the namespaced type from createSlice.
    fetchSubskills: jest.fn(() => ({ type: 'subskills/fetchSubskills' })),
    toggleSubskill: jest.fn(({ nodeId, subskill }) => ({
      type: 'subskills/toggleSubskill',
      payload: { nodeId, subskill },
    })),
  };
});

jest.mock('../features/progress/progressSlice', () => {
  const actual = jest.requireActual('../features/progress/progressSlice');
  return {
    __esModule: true,
    ...actual,
    // Update this to return the proper namespaced type if your slice name is "progress".
    saveProgress: jest.fn(({ treeId, nodeId, subskills }) => ({
      type: 'progress/saveProgress',
      payload: { treeId, nodeId, subskills },
    })),
  };
});

// 🔧 Firestore Mocks
jest.mock('firebase/firestore/lite', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(() => ({
    exists: () => true,
    data: () => ({ title: 'Mock Tree' }),
  })),
  collection: jest.fn(() => ({})),
  getDocs: jest.fn(() => ({
    docs: [
      {
        id: 'algebra',
        data: () => ({
          label: 'Algebra',
          level: 2,
          subskills: ['fractions', 'equations'],
        }),
      },
    ],
  })),
}));

describe('NodePage integration', () => {
  it('renders node, toggles subskill, and updates progress UI', async () => {
    const initialState: Partial<RootState> = {
      subskills: {
        algebra: ['fractions'],
      },
      progress: {
        trees: {
          math: {
            algebra: {
              subskills: ['fractions'],
              completedAt: '2023-01-01',
            },
          },
        },
        error: null,
      },
      auth: {
        authChecked: true,
        user: {
          uid: 'test-user',
          email: 'test@example.com',
          displayName: 'Tester',
        },
        metadata: {},
      },
      trees: {
        trees: [],
        status: 'idle',
        error: null,
        lastVisible: null,
      },
      _persist: {
        version: 0,
        rehydrated: true,
      },
    };

    const store = configureStore({
      reducer: persistedReducer,
      preloadedState: initialState as RootState,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/tree/math/node/algebra']}>
          <Routes>
            <Route path="/tree/:treeId/node/:nodeId" element={<NodePage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Algebra')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('fractions') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox.checked).toBe(false);
    });

    const progressText = screen.getByText(/% completed/i);
    expect(progressText).toHaveTextContent('0% completed');
  });
});
