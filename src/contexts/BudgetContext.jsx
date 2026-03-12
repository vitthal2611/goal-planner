import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as dataService from '../services/dataService';
import { validateMonthBudget, canAddTransaction } from '../services/budgetValidation';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [transactions, setTransactions] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [allEnvelopes, setAllEnvelopes] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTrans, allEnvs, methods] = await Promise.all([
        dataService.getTransactions(),
        dataService.getEnvelopes(),
        dataService.getPaymentMethods(),
      ]);
      
      setAllTransactions(allTrans);
      setAllEnvelopes(allEnvs);
      setTransactions(allTrans.filter(t => t.month === currentMonth));
      setEnvelopes(allEnvs.filter(e => e.month === currentMonth));
      setPaymentMethods(methods);
      
      const summary = await dataService.getBudgetSummary(currentMonth);
      setBudgetSummary(summary);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTransactions(allTransactions.filter(t => t.month === currentMonth));
    setEnvelopes(allEnvelopes.filter(e => e.month === currentMonth));
    dataService.getBudgetSummary(currentMonth).then(setBudgetSummary);
  }, [currentMonth, allTransactions, allEnvelopes]);

  const budgetValidation = useMemo(() => 
    validateMonthBudget(transactions, envelopes, currentMonth),
    [transactions, envelopes, currentMonth]
  );

  const addTransaction = async (transaction) => {
    if (!canAddTransaction(transactions, envelopes, currentMonth, transaction.type)) {
      throw new Error('Income and allocated budget must match before adding expenses');
    }
    
    // Optimistic update - add immediately to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticTransaction = { 
      ...transaction, 
      month: currentMonth, 
      id: tempId 
    };
    
    setTransactions(prev => [...prev, optimisticTransaction]);
    setAllTransactions(prev => [...prev, optimisticTransaction]);
    
    try {
      // Sync to Google Sheets in background
      await dataService.addTransaction({ ...transaction, month: currentMonth });
      // Reload to get real ID from sheets
      await loadData();
    } catch (error) {
      // Rollback on error
      setTransactions(prev => prev.filter(t => t.id !== tempId));
      setAllTransactions(prev => prev.filter(t => t.id !== tempId));
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    // Optimistic update - remove immediately from UI
    const deletedTransaction = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    setAllTransactions(prev => prev.filter(t => t.id !== id));
    
    try {
      await dataService.deleteTransaction(id);
      await loadData();
    } catch (error) {
      // Rollback on error
      if (deletedTransaction) {
        setTransactions(prev => [...prev, deletedTransaction]);
        setAllTransactions(prev => [...prev, deletedTransaction]);
      }
      throw error;
    }
  };

  const addEnvelope = async (envelope) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticEnvelope = { 
      ...envelope, 
      month: currentMonth, 
      id: tempId 
    };
    
    setEnvelopes(prev => [...prev, optimisticEnvelope]);
    setAllEnvelopes(prev => [...prev, optimisticEnvelope]);
    
    try {
      await dataService.addEnvelope({ ...envelope, month: currentMonth });
      await loadData();
    } catch (error) {
      setEnvelopes(prev => prev.filter(e => e.id !== tempId));
      setAllEnvelopes(prev => prev.filter(e => e.id !== tempId));
      throw error;
    }
  };

  const deleteEnvelope = async (id) => {
    await dataService.deleteEnvelope(id);
    await loadData();
  };

  const updateEnvelope = async (id, envelope) => {
    // Optimistic update
    const oldEnvelope = envelopes.find(e => e.id === id);
    setEnvelopes(prev => prev.map(e => e.id === id ? { ...e, ...envelope } : e));
    setAllEnvelopes(prev => prev.map(e => e.id === id ? { ...e, ...envelope } : e));
    
    try {
      await dataService.updateEnvelope(id, envelope);
      await loadData();
    } catch (error) {
      if (oldEnvelope) {
        setEnvelopes(prev => prev.map(e => e.id === id ? oldEnvelope : e));
        setAllEnvelopes(prev => prev.map(e => e.id === id ? oldEnvelope : e));
      }
      throw error;
    }
  };

  const addPaymentMethod = async (method) => {
    await dataService.addPaymentMethod(method);
    await loadData();
  };

  const deletePaymentMethod = async (id) => {
    await dataService.deletePaymentMethod(id);
    await loadData();
  };

  const getEnvelopeNames = () => {
    return [...new Set(envelopes.map(e => e.name))];
  };

  return (
    <BudgetContext.Provider value={{
      currentMonth,
      setCurrentMonth,
      transactions,
      envelopes,
      paymentMethods,
      budgetSummary,
      loading,
      addTransaction,
      deleteTransaction,
      addEnvelope,
      deleteEnvelope,
      updateEnvelope,
      addPaymentMethod,
      deletePaymentMethod,
      getEnvelopeNames,
      refresh: loadData,
      budgetValidation,
      allTransactions,
      allEnvelopes,
    }}>
      {children}
    </BudgetContext.Provider>
  );
};
