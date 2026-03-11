import React, { useState, useEffect } from 'react';
import { BudgetProvider } from './contexts/BudgetContext.jsx';
import { sheetsAPI } from './services/sheetsAPI.js';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await sheetsAPI.initialize();
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);

      await sheetsAPI.getAccessToken();
      await sheetsAPI.findOrCreateSpreadsheet();

      setUser({ authenticated: true });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      sheetsAPI.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div>Initializing Budget Planner...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.emoji}>💰</div>
          <h1 style={styles.title}>Budget Planner</h1>
          <p style={styles.subtitle}>
            Manage your budget with Google Sheets. Track income, expenses, transfers, and budget allocations.
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button onClick={login} style={styles.loginButton}>
            <span>🔐</span> Authorize Google Sheets
          </button>

          <div style={styles.disclaimer}>
            This app uses OAuth 2.0 to securely access your Google Sheets. No data is stored locally.
          </div>
        </div>
      </div>
    );
  }

  return (
    <BudgetProvider>
      <div style={styles.appContainer}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logo}>💰 Budget Planner</div>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </header>
        <main style={styles.main}>
          <Dashboard />
        </main>
      </div>
    </BudgetProvider>
  );
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f8f9fa',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  emoji: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    border: '1px solid #fcc',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  loginButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
    transition: 'background-color 0.2s',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#999',
    marginTop: '16px',
  },
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  logo: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '16px',
  },
};

export default App;
