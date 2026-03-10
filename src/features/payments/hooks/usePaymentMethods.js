import { useCallback } from 'react';
import { useApp } from '../../../core/context/AppContext';
import { auth } from '../../../config/firebase';

export const usePaymentMethods = () => {
  const { state, dispatch, services } = useApp();
  const { paymentMethodService } = services;
  const { customPaymentMethods, currentPeriod, monthlyData } = state;

  const add = useCallback(async (method) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const updated = paymentMethodService.add(customPaymentMethods, method);
    await paymentMethodService.save(user.uid, updated);
    dispatch({ type: 'SET_PAYMENT_METHODS', payload: updated });
  }, [paymentMethodService, customPaymentMethods, dispatch]);

  const remove = useCallback(async (method) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const transactions = monthlyData[currentPeriod]?.transactions || [];
    const updated = paymentMethodService.remove(customPaymentMethods, method, transactions);
    await paymentMethodService.save(user.uid, updated);
    dispatch({ type: 'SET_PAYMENT_METHODS', payload: updated });
  }, [paymentMethodService, customPaymentMethods, monthlyData, currentPeriod, dispatch]);

  return {
    paymentMethods: customPaymentMethods,
    add,
    remove
  };
};
