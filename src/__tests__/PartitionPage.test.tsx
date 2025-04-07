// __tests__/PartitionPage.test.tsx

// ✅ FIRST: Mock react-router-dom before importing the component
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ✅ Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'mocked-collection'),
  getDocs: jest.fn(() =>
    Promise.resolve({
      size: 3,
      forEach: (callback: any) => {
        const docs = [
          {
            id: 'math',
            data: () => ({ title: 'Mathematics', partition: 'mind' }),
          },
          {
            id: 'fitness',
            data: () => ({ title: 'Fitness', partition: 'body' }),
          },
          {
            id: 'philosophy',
            data: () => ({ title: 'Philosophy', partition: 'spirit' }),
          },
        ];
        docs.forEach(callback);
      },
    })
  ),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
}));

// 🧪 Imports AFTER mocks
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PartitionPage from '../PartitionPage';

describe('PartitionPage', () => {
  it('renders trees for the correct partition', async () => {
    render(
      <MemoryRouter initialEntries={['/partition/mind']}>
        <Routes>
          <Route path="/partition/:partition" element={<PartitionPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mind Trees')).toBeInTheDocument();
    });

    expect(screen.getByText('Mathematics Tree')).toBeInTheDocument();
    expect(screen.queryByText('Fitness Tree')).not.toBeInTheDocument();
    expect(screen.queryByText('Philosophy Tree')).not.toBeInTheDocument();
  });

  it('handles navigation on tree button click', async () => {
    render(
      <MemoryRouter initialEntries={['/partition/mind']}>
        <Routes>
          <Route path="/partition/:partition" element={<PartitionPage />} />
        </Routes>
      </MemoryRouter>
    );

    const button = await screen.findByText('Mathematics Tree');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/tree/math');
  });
});
