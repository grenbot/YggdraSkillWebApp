import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './Banner.css';

const Banner = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    console.log('[handleSearch] Searching for:', query);

    if (query.trim()) {
      try {
        const response = await fetch('/trees.json');
        const data = await response.json();
        const results = Object.entries(data)
          .filter(
            ([key, value]) =>
              key.toLowerCase().includes(query.toLowerCase()) ||
              value.nodes.some((node) =>
                node.data?.label?.toLowerCase().includes(query.toLowerCase())
              )
          )
          .map(([key, value]) => ({ key, ...value }));

        console.log('[handleSearch] Matches found:', results.length);
        if (results.length === 0) {
          console.log('[handleSearch] No matching trees found.');
        }

        setSearchResults(results);
        setSearchError('');
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchError('Unable to search right now. Please try again later.');
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="banner">
      <Link to="/" className="logo">
        Skill Trees
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user ? (
          <>
            <span className="user-info">Welcome, {user.email}</span>
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
                <div
                  style={{ color: 'red', marginTop: '5px', fontSize: '0.9rem' }}
                >
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
