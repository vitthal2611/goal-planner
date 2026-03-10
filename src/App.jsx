import React, { useState, useEffect } from 'react';
import { BudgetProvider } from './contexts/SimpleBudgetContext.jsx';
import Dashboard from './components/Dashboard.jsx';
import { googleSheetsService } from './services/googleSheetsService.js';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await googleSheetsService.initialize();
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await googleSheetsService.getAccessToken();
      
      if (token) {
        setUser({ 
          authenticated: true, 
          token,
          email: 'Google Sheets User'
        });
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      googleSheetsService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        padding: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Loading Google Sheets integration...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Budget Planner</h1>
        <p style={{ margin: '0 0 24px 0', color: '#666', maxWidth: '400px' }}>
          Manage your budget with Google Sheets. Track income, expenses, transfers, and budget allocations seamlessly.
        </p>
        
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '16px',
            maxWidth: '400px'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <button
          onClick={login}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔐</span>
          Authorize Google Sheets
        </button>
        
        <div style={{ fontSize: '12px', color: '#666', maxWidth: '400px', marginTop: '16px' }}>
          This app uses OAuth 2.0 to securely access your Google Sheets. No data is stored locally.
        </div>
      </div>
    );
  }

  return (
    <BudgetProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            💰 Budget Planner
          </div>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
        
        {/* Main Content */}
        <Dashboard />
      </div>
    </BudgetProvider>
  );
};

export default App;