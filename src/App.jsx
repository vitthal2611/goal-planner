import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider } from './core/context/AppContext';
import { DataService } from './services/dataService';
import { BudgetService } from './features/budget/services/budgetService';
import { EnvelopeService } from './features/envelopes/services/envelopeService';
import { TransactionService } from './features/transactions/services/transactionService';
import { PaymentMethodService } from './features/payments/services/paymentMethodService';
import { useGoogleOAuth } from './hooks/useGoogleOAuth';
import './App.css';

const EnvelopeBudget = lazy(() => import('./components/EnvelopeBudget'));

// Initialize services
const dataService = new DataService();
const budgetService = new BudgetService();
const envelopeService = new EnvelopeService();
const transactionService = new TransactionService(envelopeService);
const paymentMethodService = new PaymentMethodService();

const services = {
  dataService,
  budgetService,
  envelopeService,
  transactionService,
  paymentMethodService
};

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

export default function AppContent() {
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const { oauthReady, error: oauthError, user, logout, login } = useGoogleOAuth();

  useEffect(() => {
    if (oauthReady !== null) {
      setLoading(false);
    }
  }, [oauthReady]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('success', 'Logged out successfully');
    } catch (error) {
      showNotification('error', 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!user || !oauthReady) {
    return (
      <div className="loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">
          {!user ? 'Ready for Google Sheets authorization' : 'Initializing Google Sheets access...'}
        </div>
        {!user && oauthReady && (
          <button 
            onClick={async () => {
              const success = await login();
              if (!success) {
                showNotification('error', 'Authorization failed. Please try again.');
              }
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Authorize Google Sheets
          </button>
        )}
        {oauthError && <div style={{ color: '#dc3545' }}>⚠️ {oauthError}</div>}
      </div>
    );
  }

  return (
    <AppProvider services={services}>
      <div className="app-container">
        {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}
        
        <div style={headerStyles}>
          <span style={userEmailStyles}>Budget Planner - Google Sheets</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => window.dispatchEvent(new CustomEvent('openDataViewer'))} style={{ ...logoutButtonStyles, backgroundColor: '#f59e0b' }}>🔍 Data</button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('openBackup'))} style={{ ...logoutButtonStyles, backgroundColor: '#28a745' }}>🛡️ Backup</button>
            <button onClick={handleLogout} style={logoutButtonStyles}>Logout</button>
          </div>
        </div>

        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner"></div></div>}>
          <EnvelopeBudget />
        </Suspense>
      </div>
    </AppProvider>
  );
}


