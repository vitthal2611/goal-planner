import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import Auth from './components/Auth';

const EnvelopeBudget = lazy(() => import('./components/EnvelopeBudget'));

let cachedAuthState = null;
const getCachedAuthState = () => {
  if (cachedAuthState !== null) return cachedAuthState;
  try {
    const cached = localStorage.getItem('authState');
    cachedAuthState = cached ? JSON.parse(cached) : null;
    return cachedAuthState;
  } catch {
    cachedAuthState = null;
    return null;
  }
};

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
  maxWidth: '200px',
  flex: '1 1 auto'
};

const logoutButtonStyles = {
  minHeight: '44px',
  minWidth: '44px',
  padding: '10px 16px', 
  backgroundColor: '#dc3545', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  touchAction: 'manipulation',
  transition: 'all 0.2s ease',
  flex: '0 0 auto'
};

function App() {
  const [user, setUser] = useState(getCachedAuthState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Cache auth state
      if (user) {
        localStorage.setItem('authState', JSON.stringify({ uid: user.uid, email: user.email }));
      } else {
        localStorage.removeItem('authState');
      }
    }, (error) => {
      console.error('Auth error:', error);
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
      <div className="loading" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: '20px'
      }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div style={headerStyles}>
        <span style={userEmailStyles}>
          Welcome, {userEmailDisplay}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openProfile'))}
            style={{
              ...logoutButtonStyles,
              backgroundColor: '#667eea',
              minWidth: '44px',
              padding: '10px 16px'
            }}
            aria-label="Profile"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            👤 Profile
          </button>
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
      </div>
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="loading-spinner"></div>
        </div>
      }>
        <EnvelopeBudget />
      </Suspense>
    </div>
  );
}

export default App;