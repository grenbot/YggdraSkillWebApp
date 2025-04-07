import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './PartitionPage.css';

interface TreeData {
  key: string;
  title: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

const PartitionPage = () => {
  const { partition } = useParams();
  const navigate = useNavigate();
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrees = async () => {
      console.log('[PartitionPage] Fetching trees for partition:', partition);

      try {
        const querySnapshot = await getDocs(collection(db, 'trees'));
        console.log('[PartitionPage] Total trees fetched:', querySnapshot.size);

        const filteredTrees: TreeData[] = [];

        querySnapshot.forEach((doc) => {
          const treeData = doc.data();
          if (treeData.partition === partition) {
            filteredTrees.push({
              key: doc.id,
              title: treeData.title || doc.id,
              ...treeData,
            });            
          }
        });

        console.log(
          '[PartitionPage] Trees matching partition:',
          filteredTrees.length
        );

        setTrees(filteredTrees);
      } catch (error) {
        console.error('Error fetching trees from Firestore:', error);
        setError('Unable to load trees. Please try again later.');
      }
    };

    fetchTrees();
  }, [partition]);

  return (
    <div className="partition-page">
      <h1>
        {partition
          ? partition.charAt(0).toUpperCase() + partition.slice(1)
          : ''}{' '}
        Trees
      </h1>
      {error && (
        <p style={{ color: 'red', marginBottom: '15px', fontSize: '0.95rem' }}>
          {error}
        </p>
      )}
      <div className="tree-list">
        {trees.map((tree) => (
          <button
            key={tree.key}
            onClick={() => navigate(`/tree/${tree.key}`)}
            className="tree-button"
          >
            {tree.title || tree.key.charAt(0).toUpperCase() + tree.key.slice(1)} Tree
          </button>
        ))}
      </div>
    </div>
  );
};

export default PartitionPage;
