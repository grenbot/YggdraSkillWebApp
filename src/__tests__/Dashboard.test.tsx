import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import store from '../store';
import { AuthProgressProvider } from '../AuthProgressContext';

jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback({ uid: 'testUser123', email: 'test@example.com' });
      return () => {};
    }),
    getAuth: jest.fn(),
  }));
  
  jest.mock('firebase/firestore/lite', () => ({
    getFirestore: jest.fn(),  // <-- Clearly add this missing mock
    doc: jest.fn(),
    getDoc: jest.fn(() => Promise.resolve({
      exists: () => true,
      data: () => ({ name: 'Test User', progress: {} }),
    })),
  }));
  
  
test('Dashboard renders correctly for logged-in users', async () => { // <-- Make test async
  render(
    <Provider store={store}>
      <AuthProgressProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProgressProvider>
    </Provider>
  );

  // Wait for loading state to finish and dashboard content to appear
  await waitFor(() => expect(screen.getByText(/Welcome, /i)).toBeInTheDocument());

  // Confirm additional elements clearly if needed
  expect(screen.getByText(/Your Skill Trees/i)).toBeInTheDocument();
});
