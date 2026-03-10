import { getEnvelopeBalance } from '../utils/envelopeUtils';

export const useQuickAddHandlers = ({
  selectedEnvelope,
  setSelectedEnvelope,
  forms,
  setForms,
  filters,
  setFilters,
  selectedTransactions,
  setSelectedTransactions,
  expandedRows,
  setExpandedRows,
  customPaymentMethods,
  envelopes,
  currentPeriod,
  monthlyData,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onShowNotification,
  onAddIncome
}) => {
  const handleEnvelopeClick = (category, name, dashboardData) => {
    setSelectedEnvelope({ category, name });
    setForms(prev => ({
      ...prev,
      expense: { amount: '', description: '', paymentMethod: customPaymentMethods[0] || 'HDFC', allowOverspend: false }
    }));
  };

  const handleAddExpense = () => {
    if (!selectedEnvelope) return;
    
    const amount = parseFloat(forms.expense.amount);
    if (!amount || amount <= 0) {
      onShowNotification('error', 'Enter valid amount');
      return;
    }

    const transaction = {
      envelope: `${selectedEnvelope.category}.${selectedEnvelope.name}`,
      amount,
      description: forms.expense.description || 'Quick expense',
      paymentMethod: forms.expense.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      allowOverspend: forms.expense.allowOverspend || false
    };

    onAddTransaction(transaction);
    setSelectedEnvelope(null);
    setForms(prev => ({
      ...prev,
      expense: { amount: '', description: '', paymentMethod: customPaymentMethods[0] || 'HDFC', allowOverspend: false }
    }));
  };

  const handleAddIncome = () => {
    if (!forms.income.amount || parseFloat(forms.income.amount) <= 0) {
      onShowNotification('error', 'Enter valid amount');
      return;
    }
    if (!forms.income.paymentMethod) {
      onShowNotification('error', 'Select payment method');
      return;
    }
    onAddIncome({
      amount: parseFloat(forms.income.amount),
      description: forms.income.description || 'Monthly Income',
      paymentMethod: forms.income.paymentMethod
    });
    setForms(prev => ({ ...prev, income: { amount: '', description: '', paymentMethod: customPaymentMethods[0] || '' } }));
  };

  const handleSort = (key) => {
    setFilters(prev => ({
      ...prev,
      sort: {
        key,
        direction: prev.sort.key === key && prev.sort.direction === 'desc' ? 'asc' : 'desc'
      }
    }));
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) return;
    if (!window.confirm(`Delete ${selectedTransactions.size} transactions?`)) return;
    selectedTransactions.forEach(id => onDeleteTransaction(id));
    setSelectedTransactions(new Set());
  };

  const handleSelectAll = (checked, transactions) => {
    if (checked) {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleSelectTransaction = (id, checked) => {
    const newSet = new Set(selectedTransactions);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedTransactions(newSet);
  };

  const toggleRowExpand = (id) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  return {
    handleEnvelopeClick,
    handleAddExpense,
    handleAddIncome,
    handleSort,
    handleBulkDelete,
    handleSelectAll,
    handleSelectTransaction,
    toggleRowExpand
  };
};
