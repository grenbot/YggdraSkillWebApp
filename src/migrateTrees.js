import { db } from './firebaseConfig.js'; // Use firestore for consistency
import trees from './trees.json' assert { type: 'json' };
import { collection, doc, setDoc } from 'firebase/firestore';

const migrateTreesToFirestore = async () => {
  try {
    for (const [treeId, treeData] of Object.entries(trees)) {
      console.log(`Migrating tree: ${treeId}`);

      // Reference the main tree document
      const treeDocRef = doc(db, 'trees', treeId);
      await setDoc(treeDocRef, {
        partition: treeData.partition,
        edges: treeData.edges || [], // Include edges in the tree document
      });

      // Iterate through nodes and add them as subcollection documents
      const nodes = treeData.nodes || [];
      for (const node of nodes) {
        const nodeDocRef = doc(collection(treeDocRef, 'nodes'), node.id);
        await setDoc(nodeDocRef, {
          label: node.data.label || 'Unnamed Node',
          level: node.data.level || 'Unknown',
          subskills: node.data.subskills || [],
          position: node.position || { x: 0, y: 0 },
        });

        // Add a small delay between writes to avoid overwhelming Firestore
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`Tree '${treeId}' and its nodes migrated successfully!`);
    }
    console.log('All trees have been successfully migrated.');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

migrateTreesToFirestore();
