import React from 'react';
import { BudgetProvider } from './contexts/BudgetContext.jsx';
import AppContent from './App';

function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  );
}

export default App;