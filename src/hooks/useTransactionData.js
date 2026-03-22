import { useMemo, useCallback } from 'react';
import { TRANSACTION_TYPES } from '../config/constants';
import { formatCurrency, sortByDateDesc, groupBy } from '../utils/helpers';

/**
 * Custom hook for optimized transaction management
 * Provides memoized calculations and filtered data
 */
export const useTransactionData = (transactions, filters = {}) => {
  // Filter transactions based on criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Type filter
      if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }
      
      // Date range filter
      if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
        return false;
      }
      
      // Envelope filter
      if (filters.envelope && transaction.envelope !== filters.envelope) {
        return false;
      }
      
      // Payment method filter
      if (filters.paymentMethod && transaction.paymentMethod !== filters.paymentMethod) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const description = (transaction.description || '').toLowerCase();
        const envelope = (transaction.envelope || '').toLowerCase();
        return description.includes(searchLower) || envelope.includes(searchLower);
      }
      
      return true;
    });
  }, [transactions, filters]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === TRANSACTION_TYPES.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = filteredTransactions
      .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const transfer = filteredTransactions
      .filter(t => t.type === TRANSACTION_TYPES.TRANSFER)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      transfer,
      balance: income - expense,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(sortByDateDesc);
  }, [filteredTransactions]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    return groupBy(sortedTransactions, (t) => {
      const date = new Date(t.date);
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    });
  }, [sortedTransactions]);

  // Group transactions by type
  const groupedByType = useMemo(() => {
    return groupBy(sortedTransactions, 'type');
  }, [sortedTransactions]);

  // Group transactions by envelope
  const groupedByEnvelope = useMemo(() => {
    return groupBy(
      sortedTransactions.filter(t => t.envelope),
      'envelope'
    );
  }, [sortedTransactions]);

  // Get statistics
  const statistics = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return {
        averageTransaction: 0,
        largestTransaction: 0,
        smallestTransaction: 0,
        mostUsedEnvelope: null,
        mostUsedPaymentMethod: null
      };
    }

    const amounts = filteredTransactions.map(t => t.amount);
    const envelopes = filteredTransactions
      .filter(t => t.envelope)
      .map(t => t.envelope);
    const paymentMethods = filteredTransactions
      .filter(t => t.paymentMethod)
      .map(t => t.paymentMethod);

    // Calculate most frequent
    const getMostFrequent = (arr) => {
      if (arr.length === 0) return null;
      const frequency = {};
      arr.forEach(item => {
        frequency[item] = (frequency[item] || 0) + 1;
      });
      return Object.keys(frequency).reduce((a, b) => 
        frequency[a] > frequency[b] ? a : b
      );
    };

    return {
      averageTransaction: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      largestTransaction: Math.max(...amounts),
      smallestTransaction: Math.min(...amounts),
      mostUsedEnvelope: getMostFrequent(envelopes),
      mostUsedPaymentMethod: getMostFrequent(paymentMethods)
    };
  }, [filteredTransactions]);

  // Get formatted summary
  const summary = useMemo(() => ({
    income: formatCurrency(totals.income),
    expense: formatCurrency(totals.expense),
    transfer: formatCurrency(totals.transfer),
    balance: formatCurrency(totals.balance),
    count: totals.count,
    averageTransaction: formatCurrency(statistics.averageTransaction)
  }), [totals, statistics]);

  // Helper to check if transaction matches search
  const matchesSearch = useCallback((transaction, searchTerm) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const description = (transaction.description || '').toLowerCase();
    const envelope = (transaction.envelope || '').toLowerCase();
    return description.includes(search) || envelope.includes(search);
  }, []);

  return {
    // Filtered and sorted data
    transactions: sortedTransactions,
    filteredCount: filteredTransactions.length,
    
    // Totals
    totals,
    
    // Grouped data
    groupedByDate,
    groupedByType,
    groupedByEnvelope,
    
    // Statistics
    statistics,
    
    // Formatted summary
    summary,
    
    // Helpers
    matchesSearch
  };
};

/**
 * Custom hook for transaction filters
 * Manages filter state and provides reset functionality
 */
export const useTransactionFilters = (initialFilters = {}) => {
  const [filters, setFilters] = React.useState({
    type: 'all',
    startDate: null,
    endDate: null,
    envelope: null,
    paymentMethod: null,
    search: '',
    ...initialFilters
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: 'all',
      startDate: null,
      endDate: null,
      envelope: null,
      paymentMethod: null,
      search: ''
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.type !== 'all' ||
           filters.startDate !== null ||
           filters.endDate !== null ||
           filters.envelope !== null ||
           filters.paymentMethod !== null ||
           filters.search !== '';
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters
  };
};
