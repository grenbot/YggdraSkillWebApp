// src/utils/loadTreeMetadata.ts

import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { SkillTree } from '../types/sharedTypes';
import { FirestoreSkillNode } from '../types/firestoreTypes';
import { transformFirestoreTree } from './transformFirestoreTree';

export const loadTreeMetadata = async (treeId: string): Promise<SkillTree> => {
  // 1. Load root tree document (title, edges, etc.)
  const treeRef = doc(db, 'trees', treeId);
  const treeSnap = await getDoc(treeRef);

  if (!treeSnap.exists()) {
    throw new Error(`Tree ${treeId} does not exist.`);
  }

  const treeData = treeSnap.data();

  // 2. Load all nodes from subcollection
  const nodesRef = collection(db, 'trees', treeId, 'nodes');
  const nodesSnap = await getDocs(nodesRef);

  const nodes: FirestoreSkillNode[] = nodesSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<FirestoreSkillNode, 'id'>),
  }));

  // 3. Transform into app-facing SkillTree type
  return transformFirestoreTree(treeId, treeData, nodes);
};
