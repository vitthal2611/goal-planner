import { useCallback, useMemo } from 'react';
import { useApp } from '../../../core/context/AppContext';

export const useTransactions = () => {
  const { state, dispatch, services } = useApp();
  const { transactionService } = services;
  const { currentPeriod, monthlyData } = state;

  const add = useCallback((data) => {
    const transaction = transactionService.createTransaction(data, monthlyData, currentPeriod);
    dispatch({ type: 'TRANSACTION_ADDED', payload: transaction });
  }, [transactionService, monthlyData, currentPeriod, dispatch]);

  const addIncome = useCallback((data, currentIncome) => {
    const transaction = transactionService.createIncomeTransaction(data);
    dispatch({ type: 'TRANSACTION_ADDED', payload: transaction });
    dispatch({ type: 'INCOME_UPDATED', payload: currentIncome + transaction.amount });
  }, [transactionService, dispatch]);

  const transfer = useCallback((from, to, amount) => {
    const [transferOut, transferIn] = transactionService.createTransfer(from, to, amount);
    dispatch({ type: 'TRANSACTION_ADDED', payload: transferOut });
    dispatch({ type: 'TRANSACTION_ADDED', payload: transferIn });
  }, [transactionService, dispatch]);

  const remove = useCallback((id, transaction) => {
    dispatch({ type: 'TRANSACTION_DELETED', payload: id });
    if (transaction?.type === 'income') {
      const currentIncome = monthlyData[currentPeriod]?.income || 0;
      dispatch({ type: 'INCOME_UPDATED', payload: currentIncome - transaction.amount });
    }
  }, [dispatch, monthlyData, currentPeriod]);

  const getPaymentBalance = useCallback((paymentMethod) => {
    const transactions = monthlyData[currentPeriod]?.transactions || [];
    return transactionService.getPaymentMethodBalance(transactions, paymentMethod);
  }, [transactionService, monthlyData, currentPeriod]);

  const transactions = useMemo(() => {
    return monthlyData[currentPeriod]?.transactions || [];
  }, [monthlyData, currentPeriod]);

  return {
    transactions,
    add,
    addIncome,
    transfer,
    remove,
    getPaymentBalance
  };
};
