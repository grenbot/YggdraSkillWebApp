import React, { useState, useEffect } from 'react';
import ReactFlow, { Controls, Background, Handle } from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore/lite';
import { db } from './firebaseConfig';
import './SkillTree.css';

const CustomNode = ({ data }) => {
  return (
    <div className={`custom-node ${data.className}`}>
      <Handle type="target" position="top" />
      <strong>{data.label}</strong>
      <Handle type="source" position="bottom" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const layoutNodesRadial = (nodes) => {
  const levels = {};
  nodes.forEach((node) => {
    const levelMatch = node.data.level && node.data.level.match(/\d+/);
    const levelNum = levelMatch ? parseInt(levelMatch[0], 10) : 1;
    if (!levels[levelNum]) levels[levelNum] = [];
    levels[levelNum].push(node);
  });

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const radialSpacing = 150;

  Object.keys(levels).forEach((levelKey) => {
    const level = parseInt(levelKey, 10);
    const nodesAtLevel = levels[level];
    const angleIncrement = (2 * Math.PI) / nodesAtLevel.length;

    nodesAtLevel.forEach((node, index) => {
      const angle = index * angleIncrement;
      const radius = level * radialSpacing;
      node.position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  });

  return nodes;
};

const SkillTree = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState(null);

  const layoutNodes = (nodes, edges) => {
    const nodeWidth = 150;
    const nodeHeight = 50;
    const horizontalSpacing = 200;
    const verticalSpacing = 200;

    const levels = {};
    nodes.forEach((node) => {
      const level = node.data.level || 'Unknown';
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    });

    const orderedLevels = Object.keys(levels).sort((a, b) => {
      const order = [
        'Pre-K',
        'Elementary',
        'Middle School',
        'High School',
        'Lower Level Undergrad',
        'Upper Level Undergrad',
        "Master's",
        'PhD',
        'Level 1',
        'Level 2',
        'Level 3',
        'Level 4',
        'Level 5',
      ];
      return order.indexOf(a) - order.indexOf(b);
    });

    let globalXOffset = 0;
    orderedLevels.forEach((level) => {
      const levelNodes = levels[level];
      const dependencyMap = {};

      levelNodes.forEach((node) => {
        dependencyMap[node.id] = edges
          .filter(
            (edge) =>
              edge.target === node.id &&
              levelNodes.some((n) => n.id === edge.source)
          )
          .map((edge) => edge.source);
      });

      const visited = new Set();
      const positionMap = {};

      const assignPosition = (nodeId) => {
        if (visited.has(nodeId)) return positionMap[nodeId];
        visited.add(nodeId);
        const dependencies = dependencyMap[nodeId] || [];
        const maxDependencyX = Math.max(
          0,
          ...dependencies.map((depId) => assignPosition(depId))
        );
        positionMap[nodeId] = maxDependencyX + 1;
        return positionMap[nodeId];
      };

      levelNodes.forEach((node) => assignPosition(node.id));
      const columnOffsets = {};
      levelNodes.forEach((node) => {
        const column = positionMap[node.id];
        if (!columnOffsets[column]) columnOffsets[column] = 0;
        node.position = {
          x: globalXOffset + column * (nodeWidth + horizontalSpacing),
          y: columnOffsets[column],
        };
        columnOffsets[column] += nodeHeight + verticalSpacing;
      });

      const maxXForLevel =
        Math.max(...Object.values(positionMap)) *
        (nodeWidth + horizontalSpacing);
      globalXOffset += maxXForLevel + horizontalSpacing;
    });

    const levelStyles = {
      'Pre-K': 'node-prek',
      'Level 1': 'node-prek',
      Elementary: 'node-elementary',
      'Level 2': 'node-elementary',
      'Middle School': 'node-middle-school',
      'Level 3': 'node-middle-school',
      'High School': 'node-high-school',
      'Level 4': 'node-high-school',
      'Lower Level Undergrad': 'node-lower-undergrad',
      'Level 5': 'node-lower-undergrad',
      'Upper Level Undergrad': 'node-upper-undergrad',
      "Master's": 'node-masters',
      PhD: 'node-phd',
      Unknown: 'node-unknown',
    };

    return nodes.map((node) => ({
      ...node,
      type: 'custom',
      data: {
        ...node.data,
        className: levelStyles[node.data.level || 'Unknown'],
      },
    }));
  };

  useEffect(() => {
    const fetchTreeData = async () => {
      console.log('[SkillTree] Fetching tree and node data for:', treeId);

      try {
        const docRef = doc(db, 'trees', treeId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Tree not found');
          return;
        }

        const treeData = docSnap.data();
        console.log('[SkillTree] Tree document found:', treeData.partition);

        const nodesRef = collection(db, 'trees', treeId, 'nodes');
        const nodesSnap = await getDocs(nodesRef);

        const fetchedNodes = nodesSnap.docs.map((doc) => ({
          id: doc.id,
          data: { label: doc.data().label, level: doc.data().level },
        }));
        console.log('[SkillTree] Nodes fetched:', fetchedNodes.length);

        let laidOutNodes;
        if (treeData.partition === 'Practical') {
          laidOutNodes = layoutNodesRadial(fetchedNodes);
        } else {
          laidOutNodes = layoutNodes(fetchedNodes, treeData.edges);
        }

        setNodes(laidOutNodes);
        console.log('[SkillTree] Node layout complete.');

        const fetchedEdges = treeData.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'straight',
        }));
        setEdges(fetchedEdges);
        console.log('[SkillTree] Edges processed:', fetchedEdges.length);
      } catch (err) {
        console.error('Error fetching tree data:', err);
        setError('Failed to load tree data');
      }
    };

    fetchTreeData();
  }, [treeId]);

  const handleNodeClick = (event, node) => {
    navigate(`/node/${treeId}/${node.id}`);
  };

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Error Loading Skill Tree</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default SkillTree;
