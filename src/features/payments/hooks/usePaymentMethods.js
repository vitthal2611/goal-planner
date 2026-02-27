import { useCallback } from 'react';
import { useApp } from '../../../core/context/AppContext';

export const usePaymentMethods = () => {
  const { state, dispatch, services } = useApp();
  const { paymentMethodService } = services;
  const { customPaymentMethods, currentPeriod, monthlyData } = state;

  const add = useCallback(async (method, userId) => {
    const updated = paymentMethodService.add(customPaymentMethods, method);
    await paymentMethodService.save(userId, updated);
    dispatch({ type: 'SET_PAYMENT_METHODS', payload: updated });
  }, [paymentMethodService, customPaymentMethods, dispatch]);

  const remove = useCallback(async (method, userId) => {
    const transactions = monthlyData[currentPeriod]?.transactions || [];
    const updated = paymentMethodService.remove(customPaymentMethods, method, transactions);
    await paymentMethodService.save(userId, updated);
    dispatch({ type: 'SET_PAYMENT_METHODS', payload: updated });
  }, [paymentMethodService, customPaymentMethods, monthlyData, currentPeriod, dispatch]);

  return {
    paymentMethods: customPaymentMethods,
    add,
    remove
  };
};
