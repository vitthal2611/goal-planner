import { useCallback } from 'react';
import { useApp } from '../../../core/context/AppContext';

export const useBudget = () => {
  const { state, dispatch, services } = useApp();
  const { budgetService } = services;
  const { currentPeriod, monthlyData } = state;
  const currentData = monthlyData[currentPeriod] || { income: 0, envelopes: {} };

  const allocate = useCallback((category, name, amount) => {
    try {
      const updated = budgetService.allocateBudget(
        currentData.envelopes,
        category,
        name,
        amount,
        currentData.income
      );
      dispatch({ type: 'BUDGET_ALLOCATED', payload: updated });
    } catch (error) {
      throw error;
    }
  }, [budgetService, currentData, dispatch]);

  const increment = useCallback((category, name, amount) => {
    try {
      const updated = budgetService.incrementBudget(
        currentData.envelopes,
        category,
        name,
        amount,
        currentData.income
      );
      dispatch({ type: 'BUDGET_ALLOCATED', payload: updated });
    } catch (error) {
      throw error;
    }
  }, [budgetService, currentData, dispatch]);

  const copyFromLastMonth = useCallback(() => {
    const previousPeriod = getPreviousPeriod(currentPeriod);
    const previousData = monthlyData[previousPeriod];
    
    if (!previousData?.envelopes) {
      throw new Error('No budget data found in previous month');
    }
    
    const copied = budgetService.copyFromPreviousPeriod(currentData.envelopes, previousData.envelopes);
    dispatch({ type: 'BUDGET_ALLOCATED', payload: copied });
  }, [budgetService, currentData, monthlyData, currentPeriod, dispatch]);

  const updateIncome = useCallback((amount) => {
    dispatch({ type: 'INCOME_UPDATED', payload: amount });
  }, [dispatch]);

  return {
    income: currentData.income,
    envelopes: currentData.envelopes,
    allocate,
    increment,
    copyFromLastMonth,
    updateIncome
  };
};

const getPreviousPeriod = (currentPeriod) => {
  const [year, month] = currentPeriod.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
};
