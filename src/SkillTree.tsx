import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore/lite';
import { db } from './firebaseConfig';

const levelColors: Record<string, string> = {
  'Pre-K': '#FFEBEE',
  'Level 1': '#FFCDD2',
  'Elementary': '#EF9A9A',
  'Level 2': '#E57373',
  'Middle School': '#EF5350',
  'Level 3': '#F44336',
  'High School': '#E53935',
  'Level 4': '#D32F2F',
  'Lower Level Undergrad': '#C62828',
  'Level 5': '#B71C1C',
  'Upper Level Undergrad': '#880E4F',
  "Master's": '#AD1457',
  'PhD': '#6A1B9A',
  'Unknown': '#9E9E9E',
};

const SkillTree = () => {
  const { treeId } = useParams<{ treeId: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!treeId) return;

      try {
        const treeRef = doc(db, 'trees', treeId);
        const treeSnap = await getDoc(treeRef);

        if (!treeSnap.exists()) {
          setError('Tree not found');
          return;
        }

        const nodesCollection = collection(db, `trees/${treeId}/nodes`);
        const edgesCollection = collection(db, `trees/${treeId}/edges`);

        const [nodesSnap, edgesSnap] = await Promise.all([
          getDocs(nodesCollection),
          getDocs(edgesCollection),
        ]);

        const fetchedNodes = nodesSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            position: data.position || { x: 0, y: 0 },
            data: { label: data.label || doc.id },
            style: {
              backgroundColor: levelColors[data.level] || '#FFF',
              borderRadius: '6px',
              padding: '10px',
              border: '1px solid #ccc',
            },
          };
        });

        const fetchedEdges = edgesSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            source: data.source,
            target: data.target,
            animated: true,
            style: { stroke: '#888' },
          };
        });

        setNodes(fetchedNodes);
        setEdges(fetchedEdges);
      } catch (err) {
        console.error('Error fetching tree data:', err);
        setError('Failed to load tree data');
      }
    };

    fetchData();
  }, [treeId]);

  const onConnect = useCallback((connection: Connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return;

    setEdges((eds) => [
      ...eds,
      {
        id: `${source}-${target}`,
        source,
        target,
        sourceHandle: sourceHandle ?? undefined,
        targetHandle: targetHandle ?? undefined,
        animated: true,
        style: { stroke: '#888' },
      },
    ]);
  }, [setEdges]);

  if (error) return <div className="skill-tree-error">{error}</div>;

  return (
    <div style={{ height: '90vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default SkillTree;
