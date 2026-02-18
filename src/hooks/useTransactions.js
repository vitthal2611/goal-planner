import { useCallback, useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { useAddTransactionMutation, useDeleteTransactionMutation } from '../services/cachedDataService';
import { sanitizeInput } from '../utils/sanitize';

export const useTransactions = () => {
  const { state, dispatch } = useBudget();
  const { currentData, currentPeriod } = state;
  
  const addTransactionMutation = useAddTransactionMutation();
  const deleteTransactionMutation = useDeleteTransactionMutation();

  const addTransaction = useCallback(async (transactionData) => {
    const { envelope, amount, description, paymentMethod } = transactionData;
    
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Enter valid amount');
    }

    const [category, name] = envelope.split('.');
    const env = currentData.envelopes[category]?.[name];
    
    if (!env) {
      throw new Error('Invalid envelope');
    }

    const available = env.budgeted + env.rollover - env.spent;
    const expenseAmount = parseFloat(amount);

    if (available < expenseAmount) {
      throw new Error('Insufficient funds!');
    }

    const transactionRecord = {
      id: Date.now() + Math.random(),
      date: transactionData.date,
      envelope,
      amount: expenseAmount,
      description: sanitizeInput(description || 'Quick expense'),
      paymentMethod: sanitizeInput(paymentMethod),
      period: currentPeriod
    };

    // Use mutation for optimistic updates
    await addTransactionMutation.mutateAsync(transactionRecord);
    
    // Update local state
    const updatedEnvelopes = {
      ...currentData.envelopes,
      [category]: {
        ...currentData.envelopes[category],
        [name]: {
          ...currentData.envelopes[category][name],
          spent: currentData.envelopes[category][name].spent + expenseAmount
        }
      }
    };

    dispatch({
      type: 'UPDATE_PERIOD_DATA',
      payload: {
        envelopes: updatedEnvelopes,
        transactions: [...currentData.transactions, transactionRecord]
      }
    });

    return transactionRecord;
  }, [currentData, dispatch, currentPeriod, addTransactionMutation]);

  const deleteTransaction = useCallback(async (id) => {
    const transaction = currentData.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Use mutation for optimistic updates
    await deleteTransactionMutation.mutateAsync({ id, period: currentPeriod });
    
    if (transaction.type === 'income') {
      dispatch({
        type: 'UPDATE_PERIOD_DATA',
        payload: {
          income: currentData.income - transaction.amount,
          transactions: currentData.transactions.filter(t => t.id !== id)
        }
      });
    } else if (transaction.type === 'transfer-out' || transaction.type === 'transfer-in') {
      const relatedIds = [id];
      const relatedTransaction = currentData.transactions.find(t => 
        t.id !== id &&
        (t.type === 'transfer-in' || t.type === 'transfer-out') && 
        t.date === transaction.date && 
        t.amount === transaction.amount &&
        t.type !== transaction.type
      );
      
      if (relatedTransaction) {
        relatedIds.push(relatedTransaction.id);
        await deleteTransactionMutation.mutateAsync({ id: relatedTransaction.id, period: currentPeriod });
      }
      
      dispatch({
        type: 'UPDATE_PERIOD_DATA',
        payload: {
          transactions: currentData.transactions.filter(t => !relatedIds.includes(t.id))
        }
      });
    } else {
      const [category, name] = transaction.envelope.split('.');
      if (currentData.envelopes[category]?.[name]) {
        const updatedEnvelopes = {
          ...currentData.envelopes,
          [category]: {
            ...currentData.envelopes[category],
            [name]: {
              ...currentData.envelopes[category][name],
              spent: currentData.envelopes[category][name].spent - transaction.amount
            }
          }
        };
        
        dispatch({
          type: 'UPDATE_PERIOD_DATA',
          payload: {
            envelopes: updatedEnvelopes,
            transactions: currentData.transactions.filter(t => t.id !== id)
          }
        });
      }
    }
  }, [currentData, dispatch, currentPeriod, deleteTransactionMutation]);

  const updateTransactionPayment = useCallback(async (transactionId, newPaymentMethod) => {
    const updatedTransactions = currentData.transactions.map(t => 
      t.id === transactionId ? { ...t, paymentMethod: newPaymentMethod } : t
    );
    
    dispatch({
      type: 'UPDATE_PERIOD_DATA',
      payload: { transactions: updatedTransactions }
    });
  }, [currentData.transactions, dispatch]);

  // Memoize transactions to prevent unnecessary re-renders
  const memoizedTransactions = useMemo(() => currentData.transactions, [currentData.transactions]);

  return {
    addTransaction,
    deleteTransaction,
    updateTransactionPayment,
    transactions: memoizedTransactions,
    isAddingTransaction: addTransactionMutation.isPending,
    isDeletingTransaction: deleteTransactionMutation.isPending
  };
};