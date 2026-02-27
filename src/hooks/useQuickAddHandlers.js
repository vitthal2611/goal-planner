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
    const envelopeData = dashboardData.envelopeBalances[category]?.[name];
    if (!envelopeData || envelopeData.balance <= 0) {
      onShowNotification('error', 'No balance available in this envelope');
      return;
    }
    setSelectedEnvelope({ category, name });
    setForms(prev => ({
      ...prev,
      expense: { amount: '', description: '', paymentMethod: customPaymentMethods[0] || 'HDFC' }
    }));
  };

  const handleAddExpense = () => {
    if (!selectedEnvelope) return;
    
    const amount = parseFloat(forms.expense.amount);
    if (!amount || amount <= 0) {
      onShowNotification('error', 'Enter valid amount');
      return;
    }

    const balance = getEnvelopeBalance(selectedEnvelope.category, selectedEnvelope.name, envelopes, currentPeriod, monthlyData, transactions);
    if (amount > balance) {
      onShowNotification('error', `Insufficient balance! Available: ₹${balance.toLocaleString()}`);
      return;
    }

    const transaction = {
      envelope: `${selectedEnvelope.category}.${selectedEnvelope.name}`,
      amount,
      description: forms.expense.description || 'Quick expense',
      paymentMethod: forms.expense.paymentMethod,
      date: new Date().toISOString().split('T')[0]
    };

    onAddTransaction(transaction);
    setSelectedEnvelope(null);
    setForms(prev => ({
      ...prev,
      expense: { amount: '', description: '', paymentMethod: customPaymentMethods[0] || 'HDFC' }
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

  const handleExport = () => {
    const data = JSON.stringify(transactions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        imported.forEach(t => onAddTransaction(t));
        onShowNotification('success', `Imported ${imported.length} transactions`);
      } catch (err) {
        onShowNotification('error', 'Invalid file format');
      }
    };
    reader.readAsText(file);
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
    handleExport,
    handleImport,
    handleSelectAll,
    handleSelectTransaction,
    toggleRowExpand
  };
};
