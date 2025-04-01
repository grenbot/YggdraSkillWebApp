import { useEffect, useState } from 'react';
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
import type { RootState, AppDispatch } from './store';
import './NodePage.css';

interface NodeData {
  id: string;
  data: {
    label: string;
    level: number;
    subskills: string[];
  };
}

interface ProgressState {
  [treeId: string]: {
    [nodeId: string]: string[];
  };
}

interface SubskillsState {
  [nodeId: string]: string[];
}

const selectSubskillsState = (state: RootState) => state.subskills as SubskillsState;
const selectProgressState = (state: RootState) => state.progress as ProgressState;

const selectSubskills = createSelector(
  [selectSubskillsState, (_: RootState, nodeId: string) => nodeId],
  (subskillsState, nodeId) => subskillsState[nodeId] || []
);

const selectProgress = createSelector(
  [selectProgressState, (_: RootState, treeId: string) => treeId, (_: RootState, __: string, nodeId: string) => nodeId],
  (progressState, treeId, nodeId) => progressState[treeId]?.[nodeId] || []
);

const NodePage = () => {
  const { nodeId, treeId } = useParams<{ nodeId?: string; treeId?: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const safeNodeId = nodeId ?? '';
  const safeTreeId = treeId ?? '';

  const subskills = useSelector((state: RootState) => selectSubskills(state, safeNodeId));
  const progress = useSelector((state: RootState) => selectProgress(state, safeTreeId, safeNodeId));

  const [node, setNode] = useState<NodeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodeData = async () => {
      if (!treeId || !nodeId) {
        setError('Missing treeId or nodeId');
        return;
      }

      try {
        const treeDocRef = doc(db, 'trees', treeId);
        const treeSnap = await getDoc(treeDocRef);

        if (!treeSnap.exists()) {
          setError('Tree not found');
          return;
        }

        const nodesCollectionRef = collection(db, `trees/${treeId}/nodes`);
        const nodesSnap = await getDocs(nodesCollectionRef);

        const fetchedNodes: NodeData[] = nodesSnap.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as NodeData['data'],
        }));

        const foundNode = fetchedNodes.find((n) => n.id === nodeId);

        if (foundNode) {
          setNode(foundNode);
          dispatch(fetchSubskills({ treeId, nodeId }));
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

  const handleToggle = (subskill: string) => {
    const updatedSubskills = subskills.includes(subskill)
      ? subskills.filter((s: string) => s !== subskill)
      : [...subskills, subskill];

    dispatch(toggleSubskill({ nodeId: safeNodeId, subskill }));
    dispatch(saveProgress({ treeId: safeTreeId, nodeId: safeNodeId, subskills: updatedSubskills }));
  };

  const handleMasterSkill = () => {
    const allSubskills: string[] = node?.data?.subskills || [];
    const updatedSubskills = [...new Set([...subskills, ...allSubskills])];

    allSubskills.forEach((subskill: string) => {
      if (!subskills.includes(subskill)) {
        dispatch(toggleSubskill({ nodeId: safeNodeId, subskill }));
      }
    });

    dispatch(saveProgress({ treeId: safeTreeId, nodeId: safeNodeId, subskills: updatedSubskills }));
  };

  if (error) {
    return <div className="node-page">{error}</div>;
  }

  if (!node) {
    return <div className="node-page">Loading...</div>;
  }

  const nodeSubskills = node.data.subskills;
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
            {nodeSubskills.map((subskill: string, index: number) => (
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