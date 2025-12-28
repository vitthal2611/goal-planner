import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import ExpenseOverview from './components/expenses/ExpenseOverview';
import { lightTheme } from './theme/mobileTheme';

function App() {
  // Sample data for demonstration
  const [expenses, setExpenses] = useState([
    {
      id: 'txn_1',
      date: '2025-01-15',
      narration: 'Grocery Shopping',
      amount: 2500,
      envelopeId: 'env_1',
      mode: 'Card'
    },
    {
      id: 'txn_2', 
      date: '2025-01-14',
      narration: 'Fuel',
      amount: 1200,
      envelopeId: 'env_2',
      mode: 'UPI'
    },
    {
      id: 'txn_3',
      date: '2025-01-13', 
      narration: 'Restaurant',
      amount: 800,
      envelopeId: 'env_1',
      mode: 'Cash'
    }
  ]);
  
  const [envelopes, setEnvelopes] = useState([
    { id: 'env_1', name: 'Food & Dining', category: 'Food' },
    { id: 'env_2', name: 'Transportation', category: 'Transport' },
    { id: 'env_3', name: 'Entertainment', category: 'Other' }
  ]);
  
  const [monthlyBudgets, setMonthlyBudgets] = useState({
    '2025-01': {
      incomes: [
        { id: 'inc_1', description: 'Salary', amount: 50000, mode: 'Bank Transfer', date: '2025-01-01' }
      ],
      envelopes: {
        'env_1': 15000,
        'env_2': 8000, 
        'env_3': 5000
      }
    }
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const handleAddTransaction = (transaction) => {
    setExpenses(prev => [...prev, transaction]);
  };

  const handleDeleteTransaction = (transactionId) => {
    setExpenses(prev => prev.filter(e => e.id !== transactionId));
  };

  const handleAddEnvelope = (envelope) => {
    setEnvelopes(prev => [...prev, envelope]);
  };

  const handleAddIncome = (income) => {
    setMonthlyBudgets(prev => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        incomes: [...(prev[currentMonth]?.incomes || []), income]
      }
    }));
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 0, px: { xs: 1, sm: 2 } }}>
          <ExpenseOverview
            expenses={expenses}
            envelopes={envelopes}
            monthlyBudgets={monthlyBudgets}
            currentMonth={currentMonth}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddEnvelope={handleAddEnvelope}
            onAddIncome={handleAddIncome}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;