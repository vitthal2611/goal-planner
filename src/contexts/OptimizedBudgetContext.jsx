import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../config/queryClient';

// Separate contexts to prevent unnecessary re-renders
const BudgetStateContext = createContext();
const BudgetActionsContext = createContext();

const initialState = {
  currentPeriod: '',
  monthlyData: {},
  currentData: { income: 0, envelopes: {}, transactions: [], blockedTransactions: [] },
  customPaymentMethods: [],
  dataLoaded: false,
  notification: { type: '', message: '' },
  ui: {
    activeView: 'daily',
    loading: false,
    filters: {},
    sortConfig: { key: null, direction: 'asc' }
  }
};

const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_PERIOD':
      return { ...state, currentPeriod: action.payload };
    
    case 'SET_MONTHLY_DATA':
      return { ...state, monthlyData: action.payload };
    
    case 'UPDATE_PERIOD_DATA':
      const updatedMonthlyData = {
        ...state.monthlyData,
        [state.currentPeriod]: {
          ...state.monthlyData[state.currentPeriod],
          ...action.payload
        }
      };
      return {
        ...state,
        monthlyData: updatedMonthlyData,
        currentData: {
          ...state.currentData,
          ...action.payload
        }
      };
    
    case 'SET_CURRENT_DATA':
      return { ...state, currentData: action.payload };
    
    case 'SET_CUSTOM_PAYMENT_METHODS':
      return { ...state, customPaymentMethods: action.payload };
    
    case 'SET_DATA_LOADED':
      return { ...state, dataLoaded: action.payload };
    
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: { type: '', message: '' } };
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        currentData: {
          ...state.currentData,
          transactions: [...state.currentData.transactions, action.payload]
        }
      };
    
    case 'UPDATE_ENVELOPES':
      return {
        ...state,
        currentData: {
          ...state.currentData,
          envelopes: action.payload
        }
      };
    
    case 'UPDATE_INCOME':
      return {
        ...state,
        currentData: {
          ...state.currentData,
          income: action.payload
        }
      };
    
    case 'SET_UI_STATE':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };
    
    default:
      return state;
  }
};

const OptimizedBudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  
  // Memoize actions to prevent recreation on every render
  const actions = useMemo(() => ({
    setCurrentPeriod: (period) => dispatch({ type: 'SET_CURRENT_PERIOD', payload: period }),
    
    setMonthlyData: (data) => dispatch({ type: 'SET_MONTHLY_DATA', payload: data }),
    
    updatePeriodData: (data) => dispatch({ type: 'UPDATE_PERIOD_DATA', payload: data }),
    
    setCurrentData: (data) => dispatch({ type: 'SET_CURRENT_DATA', payload: data }),
    
    setCustomPaymentMethods: (methods) => dispatch({ type: 'SET_CUSTOM_PAYMENT_METHODS', payload: methods }),
    
    setDataLoaded: (loaded) => dispatch({ type: 'SET_DATA_LOADED', payload: loaded }),
    
    showNotification: (type, message) => {
      dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } });
      setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3000);
    },
    
    clearNotification: () => dispatch({ type: 'CLEAR_NOTIFICATION' }),
    
    addTransaction: (transaction) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction }),
    
    updateEnvelopes: (envelopes) => dispatch({ type: 'UPDATE_ENVELOPES', payload: envelopes }),
    
    updateIncome: (income) => dispatch({ type: 'UPDATE_INCOME', payload: income }),
    
    setUIState: (uiState) => dispatch({ type: 'SET_UI_STATE', payload: uiState }),
    
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading })
  }), []);
  
  // Memoize state selectors to prevent unnecessary re-renders
  const stateSelectors = useMemo(() => ({
    // Basic state
    currentPeriod: state.currentPeriod,
    monthlyData: state.monthlyData,
    currentData: state.currentData,
    customPaymentMethods: state.customPaymentMethods,
    dataLoaded: state.dataLoaded,
    notification: state.notification,
    ui: state.ui,
    
    // Computed values
    totalBudgeted: Object.values(state.currentData.envelopes).reduce((sum, category) =>
      sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0),
    
    totalSpent: Object.values(state.currentData.envelopes).reduce((sum, category) =>
      sum + Object.values(category).reduce((catSum, env) => catSum + env.spent, 0), 0),
    
    availableToAllocate: state.currentData.income - Object.values(state.currentData.envelopes).reduce((sum, category) =>
      sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0),
    
    // Payment method balances
    paymentMethodBalances: state.currentData.transactions.reduce((balances, transaction) => {
      const method = transaction.paymentMethod || 'Unknown';
      if (!balances[method]) balances[method] = 0;
      
      if (transaction.type === 'income' || transaction.type === 'transfer-in') {
        balances[method] += transaction.amount;
      } else if (transaction.type === 'transfer-out') {
        balances[method] -= transaction.amount;
      } else {
        balances[method] -= transaction.amount;
      }
      return balances;
    }, {})
  }), [state]);
  
  return (
    <BudgetStateContext.Provider value={stateSelectors}>
      <BudgetActionsContext.Provider value={actions}>
        {children}
      </BudgetActionsContext.Provider>
    </BudgetStateContext.Provider>
  );
};

export const BudgetProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <OptimizedBudgetProvider>
        {children}
      </OptimizedBudgetProvider>
    </QueryClientProvider>
  );
};

// Optimized hooks for specific state slices
export const useBudgetState = () => {
  const context = useContext(BudgetStateContext);
  if (!context) {
    throw new Error('useBudgetState must be used within a BudgetProvider');
  }
  return context;
};

export const useBudgetActions = () => {
  const context = useContext(BudgetActionsContext);
  if (!context) {
    throw new Error('useBudgetActions must be used within a BudgetProvider');
  }
  return context;
};

// Selector hooks to prevent unnecessary re-renders
export const useCurrentData = () => {
  const state = useBudgetState();
  return useMemo(() => ({
    income: state.currentData.income,
    envelopes: state.currentData.envelopes,
    transactions: state.currentData.transactions,
    blockedTransactions: state.currentData.blockedTransactions
  }), [state.currentData]);
};

export const useBudgetSummary = () => {
  const state = useBudgetState();
  return useMemo(() => ({
    totalBudgeted: state.totalBudgeted,
    totalSpent: state.totalSpent,
    availableToAllocate: state.availableToAllocate,
    paymentMethodBalances: state.paymentMethodBalances
  }), [state.totalBudgeted, state.totalSpent, state.availableToAllocate, state.paymentMethodBalances]);
};

export const useNotification = () => {
  const state = useBudgetState();
  const actions = useBudgetActions();
  
  return useMemo(() => ({
    notification: state.notification,
    showNotification: actions.showNotification,
    clearNotification: actions.clearNotification
  }), [state.notification, actions.showNotification, actions.clearNotification]);
};

export const useUIState = () => {
  const state = useBudgetState();
  const actions = useBudgetActions();
  
  return useMemo(() => ({
    ui: state.ui,
    setUIState: actions.setUIState,
    setLoading: actions.setLoading
  }), [state.ui, actions.setUIState, actions.setLoading]);
};

// Legacy hook for backward compatibility
export const useBudget = () => {
  const state = useBudgetState();
  const actions = useBudgetActions();
  
  return useMemo(() => ({
    state,
    dispatch: (action) => {
      // Map old dispatch calls to new actions
      switch (action.type) {
        case 'SET_CURRENT_PERIOD':
          actions.setCurrentPeriod(action.payload);
          break;
        case 'SET_MONTHLY_DATA':
          actions.setMonthlyData(action.payload);
          break;
        case 'UPDATE_PERIOD_DATA':
          actions.updatePeriodData(action.payload);
          break;
        case 'SET_CURRENT_DATA':
          actions.setCurrentData(action.payload);
          break;
        case 'SET_CUSTOM_PAYMENT_METHODS':
          actions.setCustomPaymentMethods(action.payload);
          break;
        case 'SET_DATA_LOADED':
          actions.setDataLoaded(action.payload);
          break;
        case 'SET_NOTIFICATION':
          actions.showNotification(action.payload.type, action.payload.message);
          break;
        case 'ADD_TRANSACTION':
          actions.addTransaction(action.payload);
          break;
        case 'UPDATE_ENVELOPES':
          actions.updateEnvelopes(action.payload);
          break;
        case 'UPDATE_INCOME':
          actions.updateIncome(action.payload);
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }
    }
  }), [state, actions]);
};