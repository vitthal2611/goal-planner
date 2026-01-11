import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from './budgetService';

const QUERY_KEYS = {
  BUDGET_DATA: 'budgetData',
  TRANSACTIONS: 'transactions',
  ENVELOPES: 'envelopes',
  PAYMENT_METHODS: 'paymentMethods',
};

export const useBudgetData = (period) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BUDGET_DATA, period],
    queryFn: () => budgetService.loadBudgetData(period),
    enabled: !!period,
  });
};

export const useTransactionsQuery = (period) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, period],
    queryFn: () => budgetService.getTransactions(period),
    enabled: !!period,
  });
};

export const useAddTransactionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: budgetService.addTransaction,
    onMutate: async (newTransaction) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      
      const previousTransactions = queryClient.getQueryData([QUERY_KEYS.TRANSACTIONS, newTransaction.period]);
      
      queryClient.setQueryData([QUERY_KEYS.TRANSACTIONS, newTransaction.period], old => 
        old ? [...old, { ...newTransaction, id: Date.now() }] : [newTransaction]
      );
      
      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      queryClient.setQueryData([QUERY_KEYS.TRANSACTIONS, newTransaction.period], context.previousTransactions);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS, variables.period] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENVELOPES, variables.period] });
    },
  });
};

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, period }) => budgetService.deleteTransaction(id),
    onMutate: async ({ id, period }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS, period] });
      
      const previousTransactions = queryClient.getQueryData([QUERY_KEYS.TRANSACTIONS, period]);
      
      queryClient.setQueryData([QUERY_KEYS.TRANSACTIONS, period], old => 
        old ? old.filter(t => t.id !== id) : []
      );
      
      return { previousTransactions };
    },
    onError: (err, { period }, context) => {
      queryClient.setQueryData([QUERY_KEYS.TRANSACTIONS, period], context.previousTransactions);
    },
    onSettled: (data, error, { period }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS, period] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENVELOPES, period] });
    },
  });
};

export { QUERY_KEYS };