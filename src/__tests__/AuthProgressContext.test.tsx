import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useContext } from 'react';
import { AuthProgressContext, AuthProgressProvider } from '../AuthProgressContext';
import { AppUser } from '../types/sharedTypes';
import { Provider } from 'react-redux';
import store from '../store';

// 🔧 Full mock for Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({
      uid: 'mock-uid',
      email: 'mock@example.com',
      displayName: 'Mock User',
      photoURL: 'http://photo.url',
    });
    return () => {}; // unsubscribe
  }),
  getIdTokenResult: jest.fn(() => Promise.resolve({ claims: {} })),
  getAuth: jest.fn(),
}));

function TestConsumer() {
  const context = useContext(AuthProgressContext);
  if (!context) throw new Error('No context found');
  return <div data-testid="user-email">{context.user?.email || 'none'}</div>;
}

test('initializes context and sets user on auth change', async () => {
  const { getByTestId } = render(
    <Provider store={store}>
      <AuthProgressProvider>
        <TestConsumer />
      </AuthProgressProvider>
    </Provider>
  );

  await waitFor(() => {
    expect(getByTestId('user-email')).toHaveTextContent('mock@example.com');
  });
});
