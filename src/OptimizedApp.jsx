import React, { useState, useEffect } from 'react';
import { OptimizedBudgetProvider } from './contexts/OptimizedBudgetContext.jsx';
import OptimizedDashboard from './components/OptimizedDashboard.jsx';
import { optimizedGoogleSheetsService } from './services/optimizedGoogleSheetsService.js';
import './App.css';

const OptimizedApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await optimizedGoogleSheetsService.initialize();
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
      
      const token = await optimizedGoogleSheetsService.getAccessToken();
      
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
      optimizedGoogleSheetsService.logout();
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
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading Google Sheets integration...</div>
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
        textAlign: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💰</div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
          Budget Planner
        </h1>
        <p style={{ 
          margin: '0 0 32px 0', 
          color: '#666', 
          maxWidth: '400px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Manage your budget with Google Sheets. Track income, expenses, transfers, and budget allocations seamlessly across all devices.
        </p>
        
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '16px',
            maxWidth: '400px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <button
          onClick={login}
          style={{
            padding: '16px 32px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#3367d6';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#4285f4';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '20px' }}>🔐</span>
          Authorize Google Sheets
        </button>
        
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          maxWidth: '400px', 
          marginTop: '24px',
          lineHeight: '1.4'
        }}>
          <div style={{ marginBottom: '8px' }}>
            ✅ Secure OAuth 2.0 authentication
          </div>
          <div style={{ marginBottom: '8px' }}>
            ☁️ Data stored in your Google Sheets
          </div>
          <div>
            📱 Works on all devices
          </div>
        </div>
      </div>
    );
  }

  return (
    <OptimizedBudgetProvider>
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
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>💰</span>
            <span>Budget Planner</span>
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
        
        {/* Main Content */}
        <OptimizedDashboard />
      </div>
    </OptimizedBudgetProvider>
  );
};

export default OptimizedApp;