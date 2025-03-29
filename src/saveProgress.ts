// saveProgress.ts (Final Clean Version)
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { getFirestoreErrorMessage } from './FirestoreErrorHandler';

export const saveProgress = async ({ treeId, nodeId, completedSubskills }) => {
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
    const message = getFirestoreErrorMessage(error);
    console.error('Firestore error:', message);
    throw new Error(message);
  }
};
