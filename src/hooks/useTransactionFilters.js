import { useMemo } from 'react';

export const useTransactionFilters = (transactions, filters) => {
  return useMemo(() => {
    let result = transactions;
    
    if (filters.search) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.envelope.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type !== 'all') {
      if (filters.type === 'income') {
        result = result.filter(t => t.type === 'income');
      } else if (filters.type === 'expense') {
        result = result.filter(t => !t.type || t.type === 'expense');
      } else if (filters.type === 'transfer') {
        result = result.filter(t => t.type && t.type.includes('transfer'));
      }
    }

    if (filters.category !== 'all') {
      result = result.filter(t => 
        (t.envelope.split('.')[1] || t.envelope).toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    result = [...result].sort((a, b) => {
      if (filters.sort.key === 'date') {
        const comparison = new Date(b.date) - new Date(a.date);
        return filters.sort.direction === 'asc' ? -comparison : comparison;
      }
      if (filters.sort.key === 'amount') {
        const comparison = b.amount - a.amount;
        return filters.sort.direction === 'asc' ? -comparison : comparison;
      }
      if (filters.sort.key === 'description') {
        const comparison = a.description.localeCompare(b.description);
        return filters.sort.direction === 'asc' ? comparison : -comparison;
      }
      if (filters.sort.key === 'type') {
        const aType = a.type || 'expense';
        const bType = b.type || 'expense';
        const comparison = aType.localeCompare(bType);
        return filters.sort.direction === 'asc' ? comparison : -comparison;
      }
      if (filters.sort.key === 'envelope') {
        const aEnv = a.envelope === 'INCOME' ? 'INCOME' : a.envelope === 'TRANSFER' ? 'TRANSFER' : a.envelope.replace('.', ' - ');
        const bEnv = b.envelope === 'INCOME' ? 'INCOME' : b.envelope === 'TRANSFER' ? 'TRANSFER' : b.envelope.replace('.', ' - ');
        const comparison = aEnv.localeCompare(bEnv);
        return filters.sort.direction === 'asc' ? comparison : -comparison;
      }
      if (filters.sort.key === 'paymentMethod') {
        const comparison = (a.paymentMethod || '').localeCompare(b.paymentMethod || '');
        return filters.sort.direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
    
    return result;
  }, [transactions, filters]);
};
