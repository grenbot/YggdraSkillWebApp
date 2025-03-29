import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthProgress } from './AuthProgressContext';
import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from './firebaseConfig';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, progress, authChecked } = useAuthProgress();
  const [trees, setTrees] = useState({});
  const [recentTreeNodes, setRecentTreeNodes] = useState([]);
  const [error, setError] = useState('');

  const getSuggestedNodes = (nodes, treeProgress) => {
    return nodes
      .filter((node) => {
        const completedSubskills = treeProgress[node.id] || [];
        const isCompleted =
          completedSubskills.length === (node.data?.subskills || []).length;
        return !isCompleted && node.data?.label;
      })
      .slice(0, 3);
  };

  useEffect(() => {
    const fetchTrees = async () => {
      console.log('[Dashboard] Fetching trees from Firestore...');

      try {
        const querySnapshot = await getDocs(collection(db, 'trees'));
        const treesData = {};

        querySnapshot.forEach((doc) => {
          treesData[doc.id] = doc.data();
        });

        console.log('[Dashboard] Trees loaded:', Object.keys(treesData).length);

        setTrees(treesData);

        if (progress && progress.metadata) {
          const recentTree =
            progress.metadata.mostRecentTree || Object.keys(treesData)[0];
          if (recentTree && treesData[recentTree]) {
            const recentTreeData = treesData[recentTree];
            const suggestedNodes = getSuggestedNodes(
              recentTreeData.nodes,
              progress[recentTree] || {}
            );
            setRecentTreeNodes(suggestedNodes);
            console.log('[Dashboard] Suggested nodes:', suggestedNodes.length);
          }
        } else {
          console.warn('Progress data is null or metadata is missing.');
        }
      } catch (error) {
        console.error('Error fetching trees data from Firestore:', error);
        setError('Unable to load your skill trees. Please try again later.');
      }
    };

    if (authChecked && progress) {
      fetchTrees();
    }
  }, [progress, authChecked]);

  if (!authChecked) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please log in to view your dashboard.</p>;
  }

  const metadata = progress?.metadata || {};
  const recentTree = metadata?.mostRecentTree || '';

  const handleClimbTree = () => {
    if (recentTree) {
      navigate(`/tree/${recentTree}`);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Skill Tree Dashboard</h1>
      {error && (
        <p style={{ color: 'red', marginBottom: '20px', fontSize: '0.95rem' }}>
          {error}
        </p>
      )}
      {recentTree ? (
        <>
          <h2>Most Recent Tree: {recentTree}</h2>
          <h3>Suggested Nodes</h3>
          <ul className="suggested-nodes-list">
            {recentTreeNodes.map((node) => (
              <li key={node.id} className="suggested-node-item">
                <div
                  onClick={() => navigate(`/node/${recentTree}/${node.id}`)}
                  className="suggested-node"
                >
                  <strong className="node-label">
                    {node.data?.label || 'Unnamed Node'}
                  </strong>
                  <p className="node-level">
                    <strong>Level:</strong> {node.data?.level || 'Unknown'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={handleClimbTree} className="climb-tree-button">
            Climb the Tree
          </button>
        </>
      ) : (
        <p>No recent tree progress available.</p>
      )}
    </div>
  );
};

export default Dashboard;
