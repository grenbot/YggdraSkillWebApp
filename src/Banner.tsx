import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { SkillTree } from './types/sharedTypes';
import './Banner.css';
import { AuthProgressContext } from './AuthProgressContext';

const Banner = () => {
  const { user, dispatch } = useContext(AuthProgressContext);
  const [trees, setTrees] = useState<SkillTree[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SkillTree[]>([]);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();

  // Load all trees from Firestore
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'SET_USER', payload: null });
      alert('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    const filtered = trees.filter(
      (tree) =>
        tree.key.toLowerCase().includes(query.toLowerCase()) ||
        tree.nodes.some((node) =>
          node.label?.toLowerCase().includes(query.toLowerCase())
        )
    );

    setSearchResults(filtered);
    setSearchError(filtered.length === 0 ? 'No matching trees found.' : '');
  };

  return (
    <div className="banner">
      <Link to="/" className="logo">Skill Trees</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user ? (
          <>
            <span className="user-info">Welcome, {user.displayName || user.email}</span>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/develop">Develop</Link>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search trees..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  <ul>
                    {searchResults.map((tree) => (
                      <li
                        key={tree.key}
                        onClick={() => navigate(`/tree/${tree.key}`)}
                      >
                        {tree.key.charAt(0).toUpperCase() + tree.key.slice(1)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {searchError && (
                <div style={{ color: 'red', marginTop: '5px', fontSize: '0.9rem' }}>
                  {searchError}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Banner;
