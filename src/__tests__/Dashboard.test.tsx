// __tests__/Dashboard.test.tsx

// --- Mocks ---
jest.mock('../utils/loadTreeMetadata', () => ({
  loadTreeMetadata: jest.fn((treeId) => {
    if (treeId === 'math') {
      return Promise.resolve({
        key: 'math',
        title: 'Math Tree',
        description: 'Math fundamentals',
        tags: ['logic', 'numbers'],
        nodes: [],
        edges: [],
        partition: 'Mind',
        metadata: {},
      });
    }
    if (treeId === 'creativity') {
      return Promise.resolve({
        key: 'creativity',
        title: 'Creative Thinking',
        description: 'Unlock creative flow',
        tags: ['expression'],
        nodes: [],
        edges: [],
        partition: 'Spirit',
        metadata: {},
      });
    }
    return Promise.reject(new Error(`Tree ${treeId} does not exist.`));
  }),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'testUser123', email: 'test@example.com' });
    return () => {};
  }),
  getAuth: jest.fn(),
  getIdTokenResult: jest.fn(() => Promise.resolve({ claims: {} })),
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  getDoc: jest.fn(() =>
    Promise.resolve({ exists: () => true, data: () => ({ dummy: 'progress' }) })
  ),
  getFirestore: jest.fn(),
}));

// --- Imports ---
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../Dashboard';
import store from '../store';
import { AuthProgressProvider, AuthProgressContext } from '../AuthProgressContext';
import { SkillTree } from '../types/sharedTypes';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import progressReducer from '../features/progress/progressSlice';
import subskillsReducer from '../features/subskills/subskillsSlice';
import treesReducer from '../features/trees/treeSlice';
import { combineReducers } from '@reduxjs/toolkit';
import { getDoc } from 'firebase/firestore';

// --- Setup Root Reducer for Mock Store ---
const rootReducer = combineReducers({
  auth: authReducer,
  progress: progressReducer,
  subskills: subskillsReducer,
  trees: treesReducer,
});

// --- Tests ---

test('Dashboard renders correctly for logged-in users', async () => {
  render(
    <Provider store={store}>
      <AuthProgressProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProgressProvider>
    </Provider>
  );

  await waitFor(() => {
    expect(
      screen.getByText((content) => content.includes('Welcome to your Dashboard'))
    ).toBeInTheDocument();
  });
});

test('Dashboard shows loaded trees from metadata', async () => {
  const mockTrees: Record<string, SkillTree> = {
    math: {
      key: 'math',
      title: 'Math Tree',
      description: 'Math fundamentals',
      tags: ['logic', 'numbers'],
      nodes: [],
      partition: 'Mind',
      metadata: {},
    },
    creativity: {
      key: 'creativity',
      title: 'Creative Thinking',
      description: 'Unlock creative flow',
      tags: ['expression'],
      nodes: [],
      partition: 'Spirit',
      metadata: {},
    },  
  };

  const mockStore = configureStore({
    reducer: rootReducer,
    preloadedState: {
      auth: {
        authChecked: true,
        user: { uid: '123', email: 'test@example.com' },
        metadata: mockTrees,
      },
      progress: {
        trees: {
          math: {
            algebra: { subskills: [] },
          },
          creativity: {},
        },
        error: null,
      },
    },
  });

  render(
    <Provider store={mockStore}>
      <AuthProgressContext.Provider
        value={{
          authChecked: true,
          user: { uid: '123', email: 'test@example.com' },
          metadata: mockTrees,
          dispatch: () => {},
        }}
      >
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </AuthProgressContext.Provider>
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByText('Math Tree')).toBeInTheDocument();
    expect(screen.getByText('Creative Thinking')).toBeInTheDocument();
  });
});
