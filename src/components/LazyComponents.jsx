import React, { Suspense, lazy } from 'react';

// Lazy load components
export const LazyTransactionsList = lazy(() => import('./TransactionsList'));
export const LazyBudgetSummary = lazy(() => import('./BudgetSummary'));
export const LazyEnvelopeManager = lazy(() => import('./EnvelopeManager'));
export const LazyDashboard = lazy(() => import('./Dashboard'));

// Loading fallback component
const LoadingFallback = ({ message = 'Loading...' }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '20px',
    color: 'var(--gray-600)'
  }}>
    <div>
      <div style={{ marginBottom: '10px' }}>⏳</div>
      <div>{message}</div>
    </div>
  </div>
);

// Wrapper component for lazy loading
export const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <LoadingFallback />}>
    {children}
  </Suspense>
);