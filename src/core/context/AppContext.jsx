import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import { auth } from '../../config/firebase';

const AppContext = createContext();

const getCurrentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const initialState = {
  currentPeriod: getCurrentPeriod(),
  monthlyData: {},
  customPaymentMethods: [],
  dataLoaded: false,
  notification: { type: '', message: '' }
};

const budgetReducer = (state, action) => {
  const { currentPeriod, monthlyData } = state;
  const currentData = monthlyData[currentPeriod] || {};

  switch (action.type) {
    case 'BUDGET_ALLOCATED':
      return {
        ...state,
        monthlyData: {
          ...monthlyData,
          [currentPeriod]: {
            ...currentData,
            envelopes: action.payload
          }
        }
      };
    case 'INCOME_UPDATED':
      return {
        ...state,
        monthlyData: {
          ...monthlyData,
          [currentPeriod]: {
            ...currentData,
            income: action.payload
          }
        }
      };
    default:
      return state;
  }
};

const transactionReducer = (state, action) => {
  const { currentPeriod, monthlyData } = state;
  const currentData = monthlyData[currentPeriod] || {};

  switch (action.type) {
    case 'TRANSACTION_ADDED':
      return {
        ...state,
        monthlyData: {
          ...monthlyData,
          [currentPeriod]: {
            ...currentData,
            transactions: [...(currentData.transactions || []), action.payload]
          }
        }
      };
    case 'TRANSACTION_DELETED':
      return {
        ...state,
        monthlyData: {
          ...monthlyData,
          [currentPeriod]: {
            ...currentData,
            transactions: (currentData.transactions || []).filter(t => t.id !== action.payload)
          }
        }
      };
    default:
      return state;
  }
};

const envelopeReducer = (state, action) => {
  const { currentPeriod, monthlyData } = state;
  const currentData = monthlyData[currentPeriod] || {};

  switch (action.type) {
    case 'ENVELOPE_CREATED':
      const { category, name } = action.payload;
      return {
        ...state,
        monthlyData: {
          ...monthlyData,
          [currentPeriod]: {
            ...currentData,
            envelopes: {
              ...(currentData.envelopes || {}),
              [category]: {
                ...(currentData.envelopes?.[category] || {}),
                [name]: { budgeted: 0 }
              }
            }
          }
        }
      };
    case 'ENVELOPE_DELETED':
      const { category: cat, name: envName } = action.payload;
      const updatedEnvelopes = { ...(currentData.envelopes || {}) };
      if (updatedEnvelopes[cat]) {
        delete updatedEnvelopes[cat][envName];
      }
      return {
        ...state,
        monthlyData: {
          ...monthlyData,
          [currentPeriod]: {
            ...currentData,
            envelopes: updatedEnvelopes
          }
        }
      };
    default:
      return state;
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_PERIOD':
      return { ...state, currentPeriod: action.payload };
    case 'SET_MONTHLY_DATA':
      return { ...state, monthlyData: action.payload };
    case 'SET_PAYMENT_METHODS':
      return { ...state, customPaymentMethods: action.payload };
    case 'SET_DATA_LOADED':
      return { ...state, dataLoaded: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'BUDGET_ALLOCATED':
    case 'INCOME_UPDATED':
      return budgetReducer(state, action);
    case 'TRANSACTION_ADDED':
    case 'TRANSACTION_DELETED':
      return transactionReducer(state, action);
    case 'ENVELOPE_CREATED':
    case 'ENVELOPE_DELETED':
      return envelopeReducer(state, action);
    default:
      return state;
  }
};

export const AppProvider = ({ children, services }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    if (!state.dataLoaded || !auth.currentUser) return;
    
    const saveTimer = setTimeout(() => {
      const { budgetService } = services;
      const { currentPeriod, monthlyData } = state;
      budgetService.save(auth.currentUser.uid, { currentPeriod, monthlyData })
        .catch(err => console.error('Auto-save failed:', err));
    }, 1000);
    
    return () => clearTimeout(saveTimer);
  }, [state.monthlyData, state.currentPeriod, state.dataLoaded, services]);
  
  const value = useMemo(() => ({ state, dispatch, services }), [state, services]);
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
