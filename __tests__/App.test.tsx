import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

test('renders App component with expected text', () => {
  render(<App />);
  expect(screen.getByText(/Welcome to Skill Trees/i)).toBeInTheDocument();
});
