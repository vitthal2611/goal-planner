import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../config/queryClient';

const BudgetContext = createContext();

const initialState = {
  currentPeriod: '',
  monthlyData: {},
  currentData: { income: 0, envelopes: {}, transactions: [], blockedTransactions: [] },
  customPaymentMethods: [],
  dataLoaded: false,
  notification: { type: '', message: '' }
};

const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_PERIOD':
      return { ...state, currentPeriod: action.payload };
    
    case 'SET_MONTHLY_DATA':
      return { ...state, monthlyData: action.payload };
    
    case 'UPDATE_PERIOD_DATA':
      return {
        ...state,
        monthlyData: {
          ...state.monthlyData,
          [state.currentPeriod]: {
            ...state.monthlyData[state.currentPeriod],
            ...action.payload
          }
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
    
    default:
      return state;
  }
};

const BudgetContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  
  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};

export const BudgetProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BudgetContextProvider>
        {children}
      </BudgetContextProvider>
    </QueryClientProvider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};