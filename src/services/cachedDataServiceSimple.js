// Simple cache without react-query dependency
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

export const useBudgetData = (period) => {
  return {
    data: null,
    isLoading: false,
    error: null
  };
};

export const useTransactionsQuery = (period) => {
  return {
    data: [],
    isLoading: false,
    error: null
  };
};

export const useAddTransactionMutation = () => {
  return {
    mutate: () => {},
    isLoading: false
  };
};

export const useDeleteTransactionMutation = () => {
  return {
    mutate: () => {},
    isLoading: false
  };
};

export const QUERY_KEYS = {
  BUDGET_DATA: 'budgetData',
  TRANSACTIONS: 'transactions',
  ENVELOPES: 'envelopes',
  PAYMENT_METHODS: 'paymentMethods',
};