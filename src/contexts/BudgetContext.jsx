import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { sheetsAPI } from '../services/sheetsAPI.js';
import { dataService } from '../services/dataService.js';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(dataService.getCurrentMonth());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  }, []);

  const loadDashboard = useCallback(async (month = currentMonth) => {
    setLoading(true);
    try {
      const data = await dataService.getDashboardData(month);
      setDashboardData(data);
      setCurrentMonth(month);
    } catch (error) {
      showNotification('error', 'Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, showNotification]);

  const addIncome = useCallback(async (amount, description, paymentMethod) => {
    try {
      await dataService.addTransaction('Income', description, '', amount, paymentMethod, currentMonth);
      await loadDashboard();
      showNotification('success', 'Income added');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to add income');
      return false;
    }
  }, [currentMonth, loadDashboard, showNotification]);

  const addExpense = useCallback(async (amount, description, envelope, paymentMethod) => {
    try {
      await dataService.addTransaction('Expense', description, envelope, amount, paymentMethod, currentMonth);
      await dataService.updateBudgetSpent(envelope, currentMonth);
      await loadDashboard();
      showNotification('success', 'Expense added');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to add expense');
      return false;
    }
  }, [currentMonth, loadDashboard, showNotification]);

  const addTransfer = useCallback(async (from, to, amount, description) => {
    try {
      const desc = description || `Transfer from ${from} to ${to}`;
      await dataService.addTransaction('Transfer-Out', desc, '', amount, from, currentMonth);
      await dataService.addTransaction('Transfer-In', desc, '', amount, to, currentMonth);
      await loadDashboard();
      showNotification('success', 'Transfer completed');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to transfer');
      return false;
    }
  }, [currentMonth, loadDashboard, showNotification]);

  const allocateBudget = useCallback(async (envelope, amount) => {
    try {
      await dataService.allocateBudget(envelope, amount, currentMonth);
      await loadDashboard();
      showNotification('success', 'Budget allocated');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to allocate budget');
      return false;
    }
  }, [currentMonth, loadDashboard, showNotification]);

  const addPaymentMethod = useCallback(async (name, type) => {
    try {
      await dataService.addPaymentMethod(name, type);
      await loadDashboard();
      showNotification('success', 'Payment method added');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to add payment method');
      return false;
    }
  }, [loadDashboard, showNotification]);

  const removePaymentMethod = useCallback(async (name) => {
    try {
      await dataService.removePaymentMethod(name);
      await loadDashboard();
      showNotification('success', 'Payment method removed');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to remove payment method');
      return false;
    }
  }, [loadDashboard, showNotification]);

  const value = {
    currentMonth,
    setCurrentMonth,
    dashboardData,
    loading,
    notification,
    loadDashboard,
    addIncome,
    addExpense,
    addTransfer,
    allocateBudget,
    addPaymentMethod,
    removePaymentMethod,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget must be used within BudgetProvider');
  return context;
};
