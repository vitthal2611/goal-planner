import { useCallback } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { DataService } from '../services/dataService';
import { TransactionService } from '../features/transactions/services/transactionService';
import { EnvelopeService } from '../features/envelopes/services/envelopeService';
import { BudgetService } from '../features/budget/services/budgetService';
import { sanitizeInput, validatePaymentMethod } from '../utils/sanitize';
import { useTransactions } from './useTransactions';
import { useEnvelopes } from './useEnvelopes';

const dataService = new DataService();
const transactionService = new TransactionService(new EnvelopeService());
const budgetService = new BudgetService();

export const useBudgetActions = () => {
  const { state, dispatch } = useBudget();
  const { addTransaction } = useTransactions();

  const showNotification = useCallback((type, message) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } });
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
    }
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: { type: '', message: '' } }), 3000);
  }, [dispatch]);

  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const loadData = async (period = null) => {
    try {
      dispatch({ type: 'SET_DATA_LOADED', payload: false });
      const targetPeriod = period || getCurrentPeriod();
      
      const result = await dataService.loadData(targetPeriod);
      if (result.success) {
        const { currentPeriod, monthlyData } = result.data;
        dispatch({ type: 'SET_CURRENT_PERIOD', payload: currentPeriod });
        dispatch({ type: 'SET_MONTHLY_DATA', payload: monthlyData });
        
        const currentData = monthlyData[currentPeriod] || { income: 0, envelopes: {}, transactions: [] };
        dispatch({ type: 'SET_CURRENT_DATA', payload: currentData });
      }
      
      dispatch({ type: 'SET_DATA_LOADED', payload: true });
      return result;
    } catch (error) {
      console.error('Load data error:', error);
      showNotification('error', error.message);
      dispatch({ type: 'SET_DATA_LOADED', payload: true });
      return { success: false, error: error.message };
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const transaction = transactionService.createTransaction(
        expenseData, 
        state.monthlyData, 
        state.currentPeriod
      );
      
      const result = await dataService.saveExpense(transaction, state.currentPeriod);
      if (result.success) {
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
        
        // Update envelope spent amount
        const [category, name] = transaction.envelope.split('.');
        const updatedEnvelopes = { ...state.currentData.envelopes };
        if (updatedEnvelopes[category] && updatedEnvelopes[category][name]) {
          updatedEnvelopes[category][name].spent += transaction.amount;
        }
        dispatch({ type: 'UPDATE_ENVELOPES', payload: updatedEnvelopes });
        showNotification('success', '✓ Expense Added!');
      }
      
      return result;
    } catch (error) {
      showNotification('error', error.message);
      return { success: false, error: error.message };
    }
  };

  const addIncome = useCallback(async (incomeData) => {
    try {
      const income = transactionService.createIncomeTransaction(incomeData);
      
      const result = await dataService.saveIncome(income, state.currentPeriod);
      if (result.success) {
        dispatch({ type: 'ADD_TRANSACTION', payload: income });
        dispatch({ type: 'UPDATE_INCOME', payload: state.currentData.income + income.amount });
        showNotification('success', '✓ Income Added!');
      }
      
      return result;
    } catch (error) {
      showNotification('error', error.message);
      return { success: false, error: error.message };
    }
  }, [state.currentData, state.currentPeriod, dispatch, showNotification]);

  const addTransfer = async (transferData) => {
    try {
      const result = await dataService.saveTransfer({
        from: transferData.from,
        to: transferData.to,
        amount: transferData.amount,
        description: `Transfer from ${transferData.from} to ${transferData.to}`
      }, state.currentPeriod);
      
      if (result.success) {
        const transfers = transactionService.createTransfer(
          transferData.from, 
          transferData.to, 
          transferData.amount
        );
        
        transfers.forEach(transfer => {
          dispatch({ type: 'ADD_TRANSACTION', payload: transfer });
        });
        showNotification('success', '✓ Transfer Completed!');
      }
      
      return result;
    } catch (error) {
      showNotification('error', error.message);
      return { success: false, error: error.message };
    }
  };

  const allocateBudget = async (category, envelope, amount) => {
    try {
      const updatedEnvelopes = budgetService.allocateBudget(
        state.currentData.envelopes,
        category,
        envelope,
        amount,
        state.currentData.income
      );
      
      const result = await dataService.saveBudget({
        category,
        envelope,
        budgeted: amount,
        spent: updatedEnvelopes[category][envelope].spent || 0
      }, state.currentPeriod);
      
      if (result.success) {
        dispatch({ type: 'UPDATE_ENVELOPES', payload: updatedEnvelopes });
        showNotification('success', '✓ Budget Allocated!');
      }
      
      return result;
    } catch (error) {
      showNotification('error', error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    showNotification,
    loadData,
    addIncome,
    addExpense,
    addTransfer,
    allocateBudget,
    getCurrentPeriod,
    addTransaction: async (data) => {
      try {
        await addTransaction(data);
        showNotification('success', '✓ Added!');
      } catch (error) {
        showNotification('error', error.message);
      }
    }
  };
};

export const usePaymentMethods = () => {
  const { state, dispatch } = useBudget();

  const addCustomPaymentMethod = useCallback(async (method) => {
    try {
      if (method && !state.customPaymentMethods.includes(method) && validatePaymentMethod(method)) {
        const sanitizedMethod = sanitizeInput(method);
        const updatedMethods = [...state.customPaymentMethods, sanitizedMethod];
        
        // Save to Google Sheets if needed
        dispatch({ type: 'SET_CUSTOM_PAYMENT_METHODS', payload: updatedMethods });
      }
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  }, [state.customPaymentMethods, dispatch]);

  return {
    addCustomPaymentMethod,
    customPaymentMethods: state.customPaymentMethods
  };
};