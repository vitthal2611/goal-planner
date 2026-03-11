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
    const initAuth = async () => {
      try {
        await sheetsAPI.initialize();
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await sheetsAPI.initialize();
      setUser({ authenticated: true });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sheetsAPI.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Initializing Budget Planner...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-emoji">💰</div>
          <h1>Budget Planner</h1>
          <p>Manage your budget with Google Sheets. Track income, expenses, transfers, and budgets.</p>
          {error && <div className="error-box">{error}</div>}
          <button onClick={handleLogin} className="login-button">
            🔐 Authorize Google Sheets
          </button>
          <p className="disclaimer">
            This app uses OAuth 2.0 to securely access your Google Sheets. No data is stored locally.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BudgetProvider>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">💰 Budget Planner</div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>
        <main className="app-main">
          <Dashboard />
        </main>
      </div>
    </BudgetProvider>
  );
};

export default App;
