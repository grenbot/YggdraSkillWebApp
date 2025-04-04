import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Banner from '../Banner';
import { AuthProgressContext } from '../AuthProgressContext';
import { SkillTree, AppUser } from '../types/sharedTypes';

jest.mock('../firebaseConfig', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/firestore/lite', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: 'math',
          data: () => ({
            title: 'Mathematics',
            nodes: [{ id: '1', label: 'Algebra' }],
          }),
        },
      ],
    })
  ),
}));

const mockUser: AppUser = {
  uid: '123',
  email: 'banner@example.com',
  displayName: 'BannerBot',
  photoURL: undefined,
};

const renderWithUser = async (user: AppUser | null = mockUser) => {
  await act(async () => {
    render(
      <AuthProgressContext.Provider value={{
        user,
        metadata: null,
        authChecked: true,
        dispatch: jest.fn(),
      }}>
        <MemoryRouter>
          <Banner />
        </MemoryRouter>
      </AuthProgressContext.Provider>
    );
  });
};

test('displays search results based on tree key or label', async () => {
  await renderWithUser();

  const searchInput = screen.getByPlaceholderText('Search trees...');
  fireEvent.change(searchInput, { target: { value: 'math' } });

  await waitFor(() => {
    expect(screen.getByText('Math')).toBeInTheDocument(); // ✅
  });
  
});
