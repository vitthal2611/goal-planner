import React from 'react';
import { OptimizedBudgetProvider } from './contexts/OptimizedBudgetContext.jsx';
import OptimizedDashboard from './components/OptimizedDashboard.jsx';
import './App.css';

const OptimizedApp = () => {
  return (
    <OptimizedBudgetProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
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
        </div>
        <OptimizedDashboard />
      </div>
    </OptimizedBudgetProvider>
  );
};

export default OptimizedApp;