import React, { useState, useEffect, lazy, Suspense } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { AppProvider } from './core/context/AppContext';
import { FirebaseRepository } from './core/repositories/firebaseRepository';
import { LocalStorageRepository } from './core/repositories/localStorageRepository';
import { BudgetRepository } from './core/repositories/budgetRepository';
import { BudgetService } from './features/budget/services/budgetService';
import { EnvelopeService } from './features/envelopes/services/envelopeService';
import { TransactionService } from './features/transactions/services/transactionService';
import { PaymentMethodService } from './features/payments/services/paymentMethodService';
import Auth from './components/Auth';
import { BackupManager } from './components/BackupManager';
import { FirebaseDataViewer } from './components/FirebaseDataViewer';
import './App.css';

const EnvelopeBudget = lazy(() => import('./components/EnvelopeBudget'));

// Initialize repositories
const firebaseRepo = new FirebaseRepository();
const localStorageRepo = new LocalStorageRepository();
const budgetRepo = new BudgetRepository(firebaseRepo, localStorageRepo);

// Initialize services
const budgetService = new BudgetService(budgetRepo);
const envelopeService = new EnvelopeService();
const transactionService = new TransactionService(envelopeService);
const paymentMethodService = new PaymentMethodService(budgetRepo);

const services = {
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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
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

  if (!user) {
    return <Auth />;
  }

  return (
    <AppProvider services={services}>
      <div className="app-container">
        {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}
        
        <div style={headerStyles}>
          <span style={userEmailStyles}>Welcome, {user.email}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => window.dispatchEvent(new CustomEvent('openDataViewer'))} style={{ ...logoutButtonStyles, backgroundColor: '#f59e0b' }}>🔍 Data</button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('openBackup'))} style={{ ...logoutButtonStyles, backgroundColor: '#28a745' }}>🛡️ Backup</button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('openProfile'))} style={{ ...logoutButtonStyles, backgroundColor: '#667eea' }}>👤 Profile</button>
            <button onClick={handleLogout} style={logoutButtonStyles}>Logout</button>
          </div>
        </div>

        <BackupManager userId={user.uid} repository={budgetRepo} />
        <FirebaseDataViewer />

        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner"></div></div>}>
          <EnvelopeBudget />
        </Suspense>
      </div>
    </AppProvider>
  );
}

export default App;
