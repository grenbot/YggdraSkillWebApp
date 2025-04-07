// src/utils/transformFirestoreTree.ts

import {
    SkillTree,
    SkillNode,
    SkillEdge,
  } from '../types/sharedTypes';
  import {
    FirestoreSkillTree,
    FirestoreSkillNode,
    FirestoreSkillEdge,
  } from '../types/firestoreTypes';
  
  export const transformFirestoreTree = (
    treeId: string,
    firestoreTree: {
      title?: string;
      description?: string;
      tags?: string[];
      partition?: string;
      metadata?: Record<string, any>;
      edges?: FirestoreSkillEdge[];
    },
    firestoreNodes: FirestoreSkillNode[]
  ): SkillTree => {
    const nodes: SkillNode[] = firestoreNodes.map((node) => ({
      id: node.id,
      label: node.label,
      description: node.description,
      subskills: node.subskills,
      prerequisites: node.prerequisites,
      position: node.position,
      metadata: node.metadata,
    }));
  
    const edges: SkillEdge[] = firestoreTree.edges || [];
  
    return {
      key: treeId,
      title: firestoreTree.title || treeId,
      description: firestoreTree.description || '',
      tags: firestoreTree.tags || [],
      partition: firestoreTree.partition || '',
      nodes,
      metadata: {
        ...firestoreTree.metadata,
        edges,
      },
    };
  };
  