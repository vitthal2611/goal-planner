import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { DataService } from '../services/dataService.js';

const BudgetContext = createContext();
const dataService = new DataService();

const initialState = {
  currentPeriod: '',
  monthlyData: {},
  paymentMethods: ['HDFC', 'SBI Credit Card'],
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
        currentPeriod: action.payload.currentPeriod,
        monthlyData: action.payload.monthlyData,
        paymentMethods: action.payload.paymentMethods || state.paymentMethods,
        dataLoaded: true,
        loading: false
      };
    
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    
    case 'ADD_TRANSACTION':
      const { transaction, period } = action.payload;
      const currentData = state.monthlyData[period] || { income: 0, envelopes: {}, transactions: [] };
      
      return {
        ...state,
        monthlyData: {
          ...state.monthlyData,
          [period]: {
            ...currentData,
            transactions: [...currentData.transactions, transaction],
            income: transaction.type === 'income' 
              ? currentData.income + transaction.amount 
              : currentData.income
          }
        }
      };
    
    case 'UPDATE_BUDGET':
      const { budget, period: budgetPeriod } = action.payload;
      const periodData = state.monthlyData[budgetPeriod] || { income: 0, envelopes: {}, transactions: [] };
      
      return {
        ...state,
        monthlyData: {
          ...state.monthlyData,
          [budgetPeriod]: {
            ...periodData,
            envelopes: {
              ...periodData.envelopes,
              [budget.category]: {
                ...periodData.envelopes[budget.category],
                [budget.envelope]: {
                  budgeted: budget.budgeted,
                  spent: budget.spent
                }
              }
            }
          }
        }
      };
    
    default:
      return state;
  }
};

export const BudgetProvider = ({ children }) => {
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
      const result = await dataService.loadData(period);
      
      if (result.success) {
        dispatch({ type: 'SET_DATA', payload: result.data });
      } else {
        showNotification('error', result.error || 'Failed to load data');
      }
    } catch (error) {
      showNotification('error', 'Failed to load data');
    }
  }, [showNotification]);

  const addTransaction = useCallback(async (transaction, type = 'expense') => {
    const period = state.currentPeriod || dataService.getCurrentPeriod();
    
    try {
      const transactionData = { ...transaction, type };
      const result = await dataService.addTransaction(transactionData, period);
      
      if (result.success) {
        dispatch({ 
          type: 'ADD_TRANSACTION', 
          payload: { transaction: result.data, period } 
        });
        showNotification('success', `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
        return true;
      } else {
        showNotification('error', result.error || `Failed to add ${type}`);
        return false;
      }
    } catch (error) {
      showNotification('error', `Failed to add ${type}`);
      return false;
    }
  }, [state.currentPeriod, showNotification]);

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
    const period = state.currentPeriod || dataService.getCurrentPeriod();
    
    try {
      const budget = {
        category,
        envelope,
        budgeted: amount,
        spent: 0
      };
      
      const result = await dataService.saveBudget(budget, period);
      
      if (result.success) {
        dispatch({ 
          type: 'UPDATE_BUDGET', 
          payload: { budget, period } 
        });
        showNotification('success', 'Budget allocated successfully');
        return true;
      } else {
        showNotification('error', result.error || 'Failed to allocate budget');
        return false;
      }
    } catch (error) {
      showNotification('error', 'Failed to allocate budget');
      return false;
    }
  }, [state.currentPeriod, showNotification]);

  const getCurrentData = useCallback(() => {
    const period = state.currentPeriod || dataService.getCurrentPeriod();
    return state.monthlyData[period] || { income: 0, envelopes: {}, transactions: [] };
  }, [state.currentPeriod, state.monthlyData]);

  const value = {
    state,
    actions: {
      loadData,
      addIncome,
      addExpense,
      addTransfer,
      allocateBudget,
      showNotification
    },
    getCurrentData
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};