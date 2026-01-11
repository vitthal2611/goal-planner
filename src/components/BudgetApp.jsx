import React from 'react';
import { BudgetProvider } from '../contexts/BudgetContext';
import ErrorBoundary from './ErrorBoundary';
import EnvelopeBudget from './EnvelopeBudget';

const BudgetApp = () => {
  return (
    <ErrorBoundary>
      <BudgetProvider>
        <EnvelopeBudget />
      </BudgetProvider>
    </ErrorBoundary>
  );
};

export default BudgetApp;