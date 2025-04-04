import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';

test('renders homepage with welcome message and CTA buttons', () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

  // Welcome header
  expect(screen.getByText(/Welcome to Skill Trees/i)).toBeInTheDocument();

  // CTA buttons
  expect(screen.getByText('Browse Trees')).toBeInTheDocument();
  expect(screen.getByText('Get Started')).toBeInTheDocument();

  // Footer links
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getAllByText('Signup').length).toBeGreaterThan(0);
});
