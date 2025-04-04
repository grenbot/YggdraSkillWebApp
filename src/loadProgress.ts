import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { TreeProgress } from './types/sharedTypes';

export async function loadProgress(userId: string, treeId: string): Promise<TreeProgress> {
  try {
    const docRef = doc(db, 'users', userId, 'progress', treeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as TreeProgress;
    } else {
      console.warn(`[loadProgress] No progress found for tree: ${treeId}`);
      return {}; // ✅ Return empty object instead of null
    }
  } catch (error) {
    console.error('[loadProgress] Error reading progress:', error);
    throw new Error('Failed to load progress'); // ✅ Throw on error
  }
}
