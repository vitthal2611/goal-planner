import { useMemo } from 'react';
import { useApp } from '../../../core/context/AppContext';

export const useYearlyBudget = (year) => {
  const { state } = useApp();
  const { monthlyData } = state;

  return useMemo(() => {
    const yearPrefix = `${year}-`;
    const yearMonths = Object.keys(monthlyData).filter(period => period.startsWith(yearPrefix));

    let totalIncome = 0;
    let totalAllocated = 0;
    const envelopeTotals = {};

    yearMonths.forEach(period => {
      const data = monthlyData[period];
      
      // Sum income
      if (data.income) {
        totalIncome += data.income;
      }

      // Sum allocated budgets and group by envelope
      if (data.envelopes) {
        Object.keys(data.envelopes).forEach(category => {
          Object.keys(data.envelopes[category]).forEach(name => {
            const budgeted = data.envelopes[category][name].budgeted || 0;
            totalAllocated += budgeted;

            const key = `${category}.${name}`;
            if (!envelopeTotals[key]) {
              envelopeTotals[key] = { category, name, total: 0 };
            }
            envelopeTotals[key].total += budgeted;
          });
        });
      }
    });

    const unallocated = totalIncome - totalAllocated;

    return {
      totalIncome,
      totalAllocated,
      unallocated,
      envelopeTotals,
      monthsCount: yearMonths.length
    };
  }, [monthlyData, year]);
};
