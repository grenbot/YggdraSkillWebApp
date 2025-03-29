import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import {
  fetchSubskills,
  toggleSubskill,
} from './features/subskills/subskillsSlice';
import { saveProgress } from './features/progress/progressSlice';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite';
import { db } from './firebaseConfig';
import './NodePage.css';

// Memoized selectors
const selectSubskillsState = (state) => state.subskills;
const selectProgressState = (state) => state.progress;

const selectSubskills = createSelector(
  [selectSubskillsState, (_, nodeId) => nodeId],
  (subskillsState, nodeId) => subskillsState[nodeId] || []
);

const selectProgress = createSelector(
  [selectProgressState, (_, treeId) => treeId, (_, __, nodeId) => nodeId],
  (progressState, treeId, nodeId) => progressState[treeId]?.[nodeId] || []
);

const NodePage = () => {
  const { nodeId, treeId } = useParams();
  const dispatch = useDispatch();
  const subskills = useSelector((state) => selectSubskills(state, nodeId));
  const progress = useSelector((state) =>
    selectProgress(state, treeId, nodeId)
  );
  const [node, setNode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNodeData = async () => {
      try {
        // Fetch the tree document
        const treeDocRef = doc(db, 'trees', treeId);
        const treeSnap = await getDoc(treeDocRef);

        if (!treeSnap.exists()) {
          setError('Tree not found');
          return;
        }

        const nodesCollectionRef = collection(db, `trees/${treeId}/nodes`);
        const nodesSnap = await getDocs(nodesCollectionRef);

        const fetchedNodes = nodesSnap.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));

        const foundNode = fetchedNodes.find((n) => n.id === nodeId);

        if (foundNode) {
          setNode(foundNode);
          dispatch(fetchSubskills(treeId, nodeId));
        } else {
          setError('Node not found');
        }
      } catch (err) {
        console.error('Error fetching node data:', err);
        setError('Failed to load node data');
      }
    };

    fetchNodeData();
  }, [nodeId, treeId, dispatch]);

  const handleToggle = (subskill) => {
    const updatedSubskills = subskills.includes(subskill)
      ? subskills.filter((s) => s !== subskill)
      : [...subskills, subskill];

    dispatch(toggleSubskill({ nodeId, subskill }));
    dispatch(saveProgress(treeId, nodeId, updatedSubskills));
  };

  const handleMasterSkill = () => {
    const allSubskills = node?.data?.subskills || [];
    const updatedSubskills = [...new Set([...subskills, ...allSubskills])];

    allSubskills.forEach((subskill) => {
      if (!subskills.includes(subskill)) {
        dispatch(toggleSubskill({ nodeId, subskill }));
      }
    });

    dispatch(saveProgress(treeId, nodeId, updatedSubskills));
  };

  if (error) {
    return <div className="node-page">{error}</div>;
  }

  if (!node) {
    return <div className="node-page">Loading...</div>;
  }

  const nodeSubskills = node?.data?.subskills || [];
  const progressPercent = Math.round(
    (progress.length / (nodeSubskills.length || 1)) * 100
  );

  return (
    <div className="node-page">
      <h1>{node.data.label}</h1>
      <p>
        <strong>Level:</strong> {node.data.level}
      </p>

      <h2>Subskills</h2>
      <div className="subskills">
        {nodeSubskills.length > 0 ? (
          <ul>
            {nodeSubskills.map((subskill, index) => (
              <li key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked={subskills.includes(subskill)}
                    onChange={() => handleToggle(subskill)}
                  />
                  {subskill}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p>No subskills available for this node.</p>
        )}
      </div>

      <h2>Progress</h2>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <p>{progressPercent}% completed</p>

      <button className="master-skill" onClick={handleMasterSkill}>
        Master this Skill
      </button>

      <button className="back-to-tree" onClick={() => window.history.back()}>
        Back to Skill Tree
      </button>
    </div>
  );
};

export default NodePage;
