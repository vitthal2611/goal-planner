import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import { googleSheetsAPI } from '../services/googleSheetsAPI.js';

export const BudgetContext = createContext();

const initialState = {
  transactions: [],
  budgets: [],
  envelopes: [],
  paymentMethods: [],
  currentMonth: new Date().toISOString().slice(0, 7),
  loading: false,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'SET_ENVELOPES':
      return { ...state, envelopes: action.payload };
    case 'ADD_ENVELOPE':
      return { ...state, envelopes: [...state.envelopes, action.payload] };
    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };
    case 'ADD_PAYMENT_METHOD':
      return { ...state, paymentMethods: [...state.paymentMethods, action.payload] };
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [transactions, budgets, envelopes, paymentMethods] = await Promise.all([
        googleSheetsAPI.getTransactions(),
        googleSheetsAPI.getBudgets(),
        googleSheetsAPI.getEnvelopes(),
        googleSheetsAPI.getPaymentMethods()
      ]);
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      dispatch({ type: 'SET_BUDGETS', payload: budgets });
      dispatch({ type: 'SET_ENVELOPES', payload: envelopes });
      dispatch({ type: 'SET_PAYMENT_METHODS', payload: paymentMethods });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Load data error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addTransaction = useCallback(async (month, type, description, envelope, amount, paymentMethod) => {
    try {
      await googleSheetsAPI.addTransaction(month, type, description, envelope, amount, paymentMethod);
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: { month, type, description, envelope, amount, paymentMethod }
      });
    } catch (error) {
      console.error('Add transaction error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const addBudget = useCallback(async (month, envelope, amount) => {
    try {
      await googleSheetsAPI.addBudget(month, envelope, amount);
      dispatch({ type: 'ADD_BUDGET', payload: { month, envelope, amount } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const addEnvelope = useCallback(async (name) => {
    try {
      await googleSheetsAPI.addEnvelope(name);
      dispatch({ type: 'ADD_ENVELOPE', payload: { name, active: true } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const addPaymentMethod = useCallback(async (name) => {
    try {
      await googleSheetsAPI.addPaymentMethod(name);
      dispatch({ type: 'ADD_PAYMENT_METHOD', payload: { name, active: true } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const value = {
    ...state,
    loadData,
    addTransaction,
    addBudget,
    addEnvelope,
    addPaymentMethod,
    setCurrentMonth: (month) => dispatch({ type: 'SET_CURRENT_MONTH', payload: month })
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
