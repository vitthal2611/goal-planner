import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Date state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12, or 0 for "All"
  
  // Data state
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [habits, setHabits] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('quick-track');
  const [loading, setLoading] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = {
          transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
          paymentMethods: JSON.parse(localStorage.getItem('paymentMethods') || '[]'),
          envelopes: JSON.parse(localStorage.getItem('envelopes') || '[]'),
          budgets: JSON.parse(localStorage.getItem('budgets') || '{}'),
          habits: JSON.parse(localStorage.getItem('habits') || '[]'),
        };
        
        // Initialize with default data if empty
        if (stored.paymentMethods.length === 0) {
          stored.paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI'];
        }
        
        if (stored.envelopes.length === 0) {
          stored.envelopes = [
            { name: 'Food', icon: '🍔', type: 'need' },
            { name: 'Transport', icon: '🚗', type: 'need' },
            { name: 'Shopping', icon: '🛍️', type: 'want' },
            { name: 'Entertainment', icon: '🎬', type: 'want' },
            { name: 'Bills', icon: '📄', type: 'need' },
            { name: 'Savings', icon: '💰', type: 'save' },
          ];
        }
        
        setTransactions(stored.transactions);
        setPaymentMethods(stored.paymentMethods);
        setEnvelopes(stored.envelopes);
        setBudgets(stored.budgets);
        setHabits(stored.habits);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
      localStorage.setItem('envelopes', JSON.stringify(envelopes));
      localStorage.setItem('budgets', JSON.stringify(budgets));
      localStorage.setItem('habits', JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [transactions, paymentMethods, envelopes, budgets, habits]);
  
  // Date navigation
  const navigateMonth = (delta) => {
    if (selectedMonth === 0) {
      // "All Months" mode - step year
      setSelectedYear(prev => prev + delta);
    } else {
      let newMonth = selectedMonth + delta;
      let newYear = selectedYear;
      
      if (newMonth < 1) {
        newYear--;
        newMonth = 12;
      } else if (newMonth > 12) {
        newYear++;
        newMonth = 1;
      }
      
      setSelectedMonth(newMonth);
      setSelectedYear(newYear);
    }
  };
  
  const toggleAllMonths = () => {
    setSelectedMonth(prev => prev === 0 ? new Date().getMonth() + 1 : 0);
  };
  
  // Transaction helpers
  const addTransaction = (transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };
  
  const updateTransaction = (id, updates) => {
    setTransactions(prev => {
      // If the update includes a new ID (type conversion), handle it specially
      if (updates.id && updates.id !== id) {
        return prev.map(t => {
          if (t.id === id) {
            // Replace old transaction with new ID
            return { ...t, ...updates };
          }
          return t;
        });
      }
      // Normal update
      return prev.map(t => t.id === id ? { ...t, ...updates } : t);
    });
  };
  
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  // Payment method helpers
  const addPaymentMethod = (method) => {
    if (!paymentMethods.includes(method)) {
      setPaymentMethods(prev => [...prev, method]);
    }
  };
  
  const removePaymentMethod = (method) => {
    setPaymentMethods(prev => prev.filter(m => m !== method));
  };
  
  // Envelope helpers
  const addEnvelope = (envelope) => {
    setEnvelopes(prev => [...prev, envelope]);
  };
  
  const updateEnvelope = (name, updates) => {
    setEnvelopes(prev => 
      prev.map(e => e.name === name ? { ...e, ...updates } : e)
    );
  };
  
  const removeEnvelope = (name) => {
    setEnvelopes(prev => prev.filter(e => e.name !== name));
  };
  
  const value = {
    // Date state
    currentDate,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    navigateMonth,
    toggleAllMonths,
    
    // Data state
    transactions,
    paymentMethods,
    envelopes,
    budgets,
    habits,
    
    // Data setters
    setTransactions,
    setPaymentMethods,
    setEnvelopes,
    setBudgets,
    setHabits,
    
    // Helpers
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addPaymentMethod,
    removePaymentMethod,
    addEnvelope,
    updateEnvelope,
    removeEnvelope,
    
    // UI state
    activeTab,
    setActiveTab,
    loading,
    setLoading,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
