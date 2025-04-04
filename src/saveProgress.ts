import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { getFirestoreErrorMessage } from './FirestoreErrorHandler';

interface SaveProgressArgs {
  treeId: string;
  nodeId: string;
  completedSubskills: string[];
}

export const saveProgress = async ({ treeId, nodeId, completedSubskills }: SaveProgressArgs) => {
  const user = auth.currentUser;
  if (!user) {
    console.error('User not logged in!');
    return;
  }

  console.log('[saveProgress] Saving progress for:', { treeId, nodeId });

  try {
    const docRef = doc(db, 'progress', user.uid);
    const docSnap = await getDoc(docRef);
    const existingProgress = docSnap.exists() ? docSnap.data() : {};

    const updatedTreeProgress = {
      ...existingProgress[treeId],
      [nodeId]: completedSubskills,
    };

    const totalCompletedNodes =
      Object.values(updatedTreeProgress).flat().length;
    const totalNodes = Object.keys(updatedTreeProgress).length || 1;
    const overallTreeProgress = Math.round(
      (totalCompletedNodes / totalNodes) * 100
    );

    const updatedProgress = {
      ...existingProgress,
      [treeId]: updatedTreeProgress,
      metadata: {
        mostRecentTree: treeId,
        overallProgress: overallTreeProgress,
      },
    };

    console.log('[saveProgress] Writing to Firestore:', updatedProgress);

    await setDoc(docRef, updatedProgress, { merge: true });
    console.log('[saveProgress] Progress successfully saved.');
    return updatedProgress;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const message = getFirestoreErrorMessage(error as { code: string });
      console.error('Firestore error:', message);
      throw new Error(message);
    } else {
      console.error('Unknown error while saving progress');
      throw new Error('An unexpected error occurred while saving progress.');
    }
  }
};
