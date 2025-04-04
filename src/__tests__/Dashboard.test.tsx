import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import store from '../store';
import { AuthProgressProvider } from '../AuthProgressContext';

// ✅ Full mock for firebase/auth including getIdTokenResult
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'testUser123', email: 'test@example.com' });
    return () => {};
  }),
  getAuth: jest.fn(),
  getIdTokenResult: jest.fn(() => Promise.resolve({ claims: {} })),
  signOut: jest.fn(() => Promise.resolve()),
}));

// ✅ Mock Firestore methods
jest.mock('firebase/firestore/lite', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ name: 'Test User', progress: {} }),
    })
  ),
}));

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

  // ✅ Wait for greeting to appear (assuming it's rendered inside Dashboard somewhere)
  await waitFor(() => {
    expect(screen.getByText((content) => content.includes('Welcome to your Dashboard'))).toBeInTheDocument();
  });
  
});
