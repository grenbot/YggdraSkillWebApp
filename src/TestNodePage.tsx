import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NodePage from './NodePage';

const TestNodePage = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Simulate a dynamic route for node pages */}
        <Route path="/node/:nodeId" element={<NodePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default TestNodePage;
