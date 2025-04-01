import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from './firebaseConfig';
import { AppUser, SkillTree } from './types/sharedTypes';

const Banner = ({ user, setUser }: { user: AppUser | null; setUser: React.Dispatch<React.SetStateAction<AppUser | null>> }) => {
  const [trees, setTrees] = useState<SkillTree[]>([]);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'trees'));
        const treeData: SkillTree[] = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as SkillTree),
          key: doc.id,
        }));        
        setTrees(treeData);
      } catch (error) {
        console.error('Error fetching trees:', error);
      }
    };

    fetchTrees();
  }, []);

  return (
    <div className="banner">
      <h1>Welcome {user?.displayName || user?.email || 'Guest'}!</h1>
      <p>You have access to {trees.length} trees.</p>
    </div>
  );
};

export default Banner;
