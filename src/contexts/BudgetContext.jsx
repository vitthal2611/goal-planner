import React, { createContext, useState, useCallback, useEffect } from 'react';
import { sheetsAPI } from '../services/sheetsAPI.js';

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [txns, budg, envs, methods] = await Promise.all([
        sheetsAPI.getTransactions(currentMonth),
        sheetsAPI.getBudgets(currentMonth),
        sheetsAPI.getEnvelopes(),
        sheetsAPI.getPaymentMethods()
      ]);
      setTransactions(txns);
      setBudgets(budg);
      setEnvelopes(envs);
      setPaymentMethods(methods);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTransaction = useCallback(async (type, description, envelope, amount, paymentMethod) => {
    try {
      await sheetsAPI.addTransaction(currentMonth, type, description, envelope, amount, paymentMethod);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [currentMonth, loadData]);

  const setBudgetAmount = useCallback(async (envelope, budgeted) => {
    try {
      await sheetsAPI.setBudget(currentMonth, envelope, budgeted);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [currentMonth, loadData]);

  const addNewEnvelope = useCallback(async (name) => {
    try {
      await sheetsAPI.addEnvelope(name);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [loadData]);

  const addNewPaymentMethod = useCallback(async (name, type) => {
    try {
      await sheetsAPI.addPaymentMethod(name, type);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }, [loadData]);

  const calculateSpent = useCallback((envelope) => {
    return transactions
      .filter(t => t.envelope === envelope && t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const value = {
    currentMonth,
    setCurrentMonth,
    transactions,
    budgets,
    envelopes,
    paymentMethods,
    loading,
    error,
    addTransaction,
    setBudgetAmount,
    addNewEnvelope,
    addNewPaymentMethod,
    calculateSpent,
    refresh: loadData
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
