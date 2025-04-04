import { useContext } from 'react';
import { AuthProgressContext } from './AuthProgressContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import SkillTree from './SkillTree';
import NodePage from './NodePage';
import Banner from './Banner';
import Login from './Login';
import Signup from './Signup';
import Develop from './Develop';
import PartitionPage from './PartitionPage';
import HomePage from './HomePage';
import ErrorBoundary from './ErrorBoundary';

const App = () => {
  const context = useContext(AuthProgressContext);
  if (!context) return null; // safety fallback

  return (
    <BrowserRouter>
      <Banner />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tree/:treeId" element={<SkillTree />} />
          <Route path="/node/:treeId/:nodeId" element={<NodePage />} />
          <Route path="/develop" element={<Develop />} />
          <Route path="/develop/:partition" element={<PartitionPage />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
