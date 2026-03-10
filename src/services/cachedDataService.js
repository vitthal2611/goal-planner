// Disabled - using Google Sheets instead
export const useBudgetData = () => ({ data: null, isLoading: false });
export const useTransactionsQuery = () => ({ data: [], isLoading: false });
export const useAddTransactionMutation = () => ({ mutate: () => {} });
export const useDeleteTransactionMutation = () => ({ mutate: () => {} });
export const QUERY_KEYS = { BUDGET_DATA: 'budgetData', TRANSACTIONS: 'transactions' };