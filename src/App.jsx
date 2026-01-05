import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import EnvelopeBudget from './components/EnvelopeBudget';
import Auth from './components/Auth';

// Memoized styles to prevent recreation on each render
const headerStyles = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  padding: '12px 16px', 
  background: 'white',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  flexWrap: 'wrap',
  gap: '8px'
};

const userEmailStyles = {
  fontSize: '14px', 
  color: '#666',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px'
};

const logoutButtonStyles = {
  minHeight: '44px',
  minWidth: '44px',
  padding: '8px 16px', 
  backgroundColor: '#dc3545', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  touchAction: 'manipulation',
  transition: 'all 0.2s ease'
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [notification, setNotification] = useState({ type: '', message: '' });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification('success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('error', 'Failed to logout. Please try again.');
    }
  };

  // Memoize user email display to prevent unnecessary re-renders
  const userEmailDisplay = useMemo(() => {
    return user?.email || 'User';
  }, [user?.email]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading your budget...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      {/* Enhanced notification system */}
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div style={headerStyles}>
        <span style={userEmailStyles}>
          Welcome, {userEmailDisplay}
        </span>
        <button 
          onClick={handleLogout} 
          style={logoutButtonStyles}
          aria-label="Logout"
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
        >
          Logout
        </button>
      </div>
      <EnvelopeBudget />
    </div>
  );
}

export default App;