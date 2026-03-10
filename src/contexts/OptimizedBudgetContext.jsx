import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { optimizedGoogleSheetsService } from '../services/optimizedGoogleSheetsService.js';

const BudgetContext = createContext();

const initialState = {
  currentPeriod: '',
  transactions: [],
  budgets: [],
  paymentMethods: [],
  dataLoaded: false,
  loading: false,
  notification: { type: '', message: '' }
};

const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_DATA':
      return {
        ...state,
        ...action.payload,
        dataLoaded: true,
        loading: false
      };
    
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    
    case 'UPDATE_BUDGETS':
      return {
        ...state,
        budgets: action.payload
      };
    
    case 'UPDATE_PAYMENT_METHODS':
      return {
        ...state,
        paymentMethods: action.payload
      };
    
    default:
      return state;
  }
};

export const OptimizedBudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  const showNotification = useCallback((type, message) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } });
    setTimeout(() => {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: '', message: '' } });
    }, 3000);
  }, []);

  const loadData = useCallback(async (period = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data = await optimizedGoogleSheetsService.loadAllData(period);
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (error) {
      showNotification('error', 'Failed to load data');
      console.error('Load data error:', error);
    }
  }, [showNotification]);

  const addTransaction = useCallback(async (transaction, type) => {
    const period = state.currentPeriod || optimizedGoogleSheetsService.getCurrentPeriod();
    
    try {
      const transactionData = { ...transaction, type };
      const savedTransaction = await optimizedGoogleSheetsService.saveTransaction(transactionData, period);
      
      dispatch({ type: 'ADD_TRANSACTION', payload: savedTransaction });
      showNotification('success', `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
      
      // Reload data to update budgets and calculations
      await loadData(period);
      return true;
    } catch (error) {
      showNotification('error', `Failed to add ${type}`);
      console.error(`Add ${type} error:`, error);
      return false;
    }
  }, [state.currentPeriod, showNotification, loadData]);

  const addIncome = useCallback(async (income) => {
    return addTransaction(income, 'income');
  }, [addTransaction]);

  const addExpense = useCallback(async (expense) => {
    return addTransaction(expense, 'expense');
  }, [addTransaction]);

  const addTransfer = useCallback(async (transfer) => {
    return addTransaction(transfer, 'transfer');
  }, [addTransaction]);

  const allocateBudget = useCallback(async (category, envelope, amount) => {
    const period = state.currentPeriod || optimizedGoogleSheetsService.getCurrentPeriod();
    
    try {
      const budget = {
        category,
        envelope,
        budgeted: amount,
        spent: 0
      };
      
      await optimizedGoogleSheetsService.saveBudget(budget, period);
      
      // Reload data to get updated budgets
      await loadData(period);
      showNotification('success', 'Budget allocated successfully');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to allocate budget');
      console.error('Allocate budget error:', error);
      return false;
    }
  }, [state.currentPeriod, showNotification, loadData]);

  const addPaymentMethod = useCallback(async (method) => {
    try {
      await optimizedGoogleSheetsService.savePaymentMethod(method);
      
      // Reload payment methods
      const paymentMethods = await optimizedGoogleSheetsService.loadPaymentMethods();
      dispatch({ type: 'UPDATE_PAYMENT_METHODS', payload: paymentMethods });
      
      showNotification('success', 'Payment method added successfully');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to add payment method');
      console.error('Add payment method error:', error);
      return false;
    }
  }, [showNotification]);

  const getSummary = useCallback(() => {
    const income = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBudget = state.budgets
      .reduce((sum, b) => sum + b.budgeted, 0);
    
    const totalSpent = state.budgets
      .reduce((sum, b) => sum + b.spent, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent
    };
  }, [state.transactions, state.budgets]);

  const value = {
    state,
    actions: {
      loadData,
      addIncome,
      addExpense,
      addTransfer,
      allocateBudget,
      addPaymentMethod,
      showNotification
    },
    getSummary
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useOptimizedBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useOptimizedBudget must be used within an OptimizedBudgetProvider');
  }
  return context;
};