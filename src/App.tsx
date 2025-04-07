// PATCHED App.tsx
import { Routes, Route } from 'react-router-dom';
import { AuthProgressProvider } from './AuthProgressContext';
import HomePage from './HomePage';
import Dashboard from './Dashboard';
import NodePage from './NodePage';
import PartitionPage from './PartitionPage';
import Develop from './Develop';
import Login from './Login';
import Signup from './Signup';
import Banner from './Banner';
import ErrorBoundary from './ErrorBoundary';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

interface AppProps {
  router?: JSX.Element; // Allows MemoryRouter to be passed in tests
}

const App: React.FC<AppProps> = ({ router }) => {
  const Router = router ?? <BrowserRouter />;

  return (
    <ErrorBoundary>
      <AuthProgressProvider>
        {React.cloneElement(Router, {
          children: (
            <>
              <Banner />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/develop" element={<Develop />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/partition/:partitionKey" element={<PartitionPage />} />
                <Route path="/node/:treeId/:nodeId" element={<NodePage />} />
              </Routes>
            </>
          ),
        })}
      </AuthProgressProvider>
    </ErrorBoundary>
  );
};

export default App;