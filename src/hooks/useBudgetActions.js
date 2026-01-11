import { useCallback } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { BudgetService } from '../services/budgetService';
import { sanitizeInput, validatePaymentMethod } from '../utils/sanitize';
import { useTransactions } from './useTransactions';
import { useEnvelopes } from './useEnvelopes';

export const useBudgetActions = () => {
  const { state, dispatch } = useBudget();
  const { addTransaction } = useTransactions();
  const { addCustomPaymentMethod: addPaymentMethod } = usePaymentMethods();

  const showNotification = useCallback((type, message) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } });
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
    }
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: { type: '', message: '' } }), 3000);
  }, [dispatch]);

  const addIncome = useCallback(async (incomeData) => {
    try {
      const { amount, description, paymentMethod, date } = incomeData;

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Enter valid income amount');
      }

      const incomeAmount = parseFloat(amount);
      const transactionRecord = {
        id: Date.now() + Math.random(),
        date,
        envelope: 'INCOME',
        amount: incomeAmount,
        description: sanitizeInput(description || 'Monthly Income'),
        paymentMethod: sanitizeInput(paymentMethod),
        type: 'income'
      };

      dispatch({
        type: 'UPDATE_PERIOD_DATA',
        payload: {
          income: state.currentData.income + incomeAmount,
          transactions: [...state.currentData.transactions, transactionRecord]
        }
      });

      showNotification('success', '✓ Income Added!');
    } catch (error) {
      showNotification('error', error.message);
    }
  }, [state.currentData, dispatch, showNotification]);

  return {
    showNotification,
    addIncome,
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
        
        await BudgetService.saveCustomPaymentMethods(updatedMethods);
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