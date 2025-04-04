import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useContext } from 'react';
import { AuthProgressContext, AuthProgressProvider } from '../AuthProgressContext';
import { Provider, useSelector } from 'react-redux';
import store, { RootState } from '../store';

// ✅ Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({
      uid: 'mock-uid',
      email: 'mock@example.com',
      displayName: 'Mock User',
      photoURL: 'http://photo.url',
    });
    return () => {};
  }),
  getIdTokenResult: jest.fn(() => Promise.resolve({ claims: {} })),
  getAuth: jest.fn(),
}));

// ✅ Mock loadProgress
jest.mock('../loadProgress', () => ({
  loadProgress: jest.fn(() =>
    Promise.resolve({
      algebra: { subskills: ['fractions'], completedAt: '2023-01-01' },
    })
  ),
}));

// 👀 Test Consumer to access Context and Redux state
function TestConsumer() {
  const context = useContext(AuthProgressContext);
  const mathProgress = useSelector(
    (state: RootState) => state.progress.trees.math?.algebra?.subskills || []
  );

  if (!context) throw new Error('No context found');

  return (
    <div>
      <div data-testid="user-email">{context.user?.email || 'none'}</div>
      <div data-testid="subskills">{mathProgress.join(', ') || 'none'}</div>
    </div>
  );
}

describe('AuthProgressContext full integration', () => {
  it('loads user and progress, and makes them available via context and Redux', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <AuthProgressProvider>
          <TestConsumer />
        </AuthProgressProvider>
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId('user-email')).toHaveTextContent('mock@example.com');
      expect(getByTestId('subskills')).toHaveTextContent('fractions');
    });
  });
});
