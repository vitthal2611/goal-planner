import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import EnvelopeBudget from './components/EnvelopeBudget';
import Auth from './components/Auth';
import MobileUIOptimized from './components/MobileUIOptimized';
import { MobileTestingTrigger } from './components/MobileTestingPanel';
import { useHapticFeedback, useNetworkStatus } from './hooks/useEnhancedMobile';
import './styles/mobile-optimized.css';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('quickadd');
  
  const { success, error } = useHapticFeedback();
  const { isOnline, isSlowConnection } = useNetworkStatus();

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
      success();
      await signOut(auth);
      showNotification('success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      error();
      showNotification('error', 'Failed to logout. Please try again.');
    }
  };

  const handleRefresh = async () => {
    // Refresh app data
    window.location.reload();
  };

  // Memoize user email display to prevent unnecessary re-renders
  const userEmailDisplay = useMemo(() => {
    return user?.email || 'User';
  }, [user?.email]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading your budget...</div>
        {!isOnline && (
          <div className="offline-indicator">
            📡 You're offline - some features may be limited
          </div>
        )}
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
      
      {/* Network status indicator */}
      {!isOnline && (
        <div className="offline-banner">
          📡 You're offline - changes will sync when reconnected
        </div>
      )}
      
      {isSlowConnection && (
        <div className="slow-connection-banner">
          🐌 Slow connection detected - optimizing for performance
        </div>
      )}
      
      <div style={headerStyles}>
        <span style={userEmailStyles}>
          Welcome, {userEmailDisplay}
        </span>
        <button 
          onClick={handleLogout} 
          style={logoutButtonStyles}
          className="btn btn-danger"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
      
      <MobileUIOptimized 
        activeView={activeView} 
        setActiveView={setActiveView}
        onRefresh={handleRefresh}
      >
        <EnvelopeBudget activeView={activeView} setActiveView={setActiveView} />
      </MobileUIOptimized>
      
      {/* Mobile Testing Panel (only in development) */}
      <MobileTestingTrigger />
      
      <style jsx>{`
        .offline-banner,
        .slow-connection-banner {
          background: #f59e0b;
          color: white;
          padding: 8px 16px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 101;
        }
        
        .offline-banner {
          background: #ef4444;
        }
        
        .loading-text {
          margin-top: 16px;
          font-size: 16px;
          color: var(--gray-600);
        }
        
        .offline-indicator {
          margin-top: 12px;
          padding: 8px 16px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default App;