import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';
import EditTransactionModal from './EditTransactionModal';
import Toast from '../shared/Toast';
import './TransactionReviewTab.css';

const TransactionReviewTab = () => {
  const { transactions, deleteTransaction, updateTransaction, selectedYear, selectedMonth } = useApp();
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    envelope: 'all',
    payment: 'all',
    sortBy: 'date-desc',
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toast, setToast] = useState(null);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by selected date
    filtered = filtered.filter(t => {
      if (!t.date) return false;
      try {
        const d = new Date(t.date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;

        if (selectedMonth === 0) {
          return year === selectedYear;
        } else {
          return year === selectedYear && month === selectedMonth;
        }
      } catch {
        return false;
      }
    });

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.description || '').toLowerCase().includes(searchLower) ||
        (t.envelope || '').toLowerCase().includes(searchLower) ||
        (t.payment || '').toLowerCase().includes(searchLower) ||
        (t.id || '').toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Envelope filter
    if (filters.envelope !== 'all') {
      filtered = filtered.filter(t => t.envelope === filters.envelope);
    }

    // Payment filter
    if (filters.payment !== 'all') {
      filtered = filtered.filter(t => t.payment === filters.payment);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return parseFloat(b.amount) - parseFloat(a.amount);
        case 'amount-asc':
          return parseFloat(a.amount) - parseFloat(b.amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, filters, selectedYear, selectedMonth]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return { income, expense, net: income - expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      setToast({ message: '✅ Transaction deleted', type: 'success' });
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveEdit = (id, updates) => {
    updateTransaction(id, updates);
    setEditingTransaction(null);
    setToast({ message: '✅ Transaction updated', type: 'success' });
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Date', 'Type', 'Description', 'Category', 'Payment', 'Amount'].join(','),
      ...filteredTransactions.map(t => [
        t.id,
        new Date(t.date).toLocaleDateString('en-IN'),
        t.type,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.envelope || '-',
        t.payment || '-',
        t.amount,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({ message: '📥 Transactions exported', type: 'success' });
  };

  return (
    <div className="transaction-review-tab">
      <div className="review-header">
        <div className="review-summary">
          <div className="summary-stat">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{summary.count}</span>
          </div>
          <div className="summary-stat income">
            <span className="stat-label">Income</span>
            <span className="stat-value">₹{summary.income.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-stat expense">
            <span className="stat-label">Expense</span>
            <span className="stat-value">₹{summary.expense.toLocaleString('en-IN')}</span>
          </div>
          <div className={`summary-stat net ${summary.net >= 0 ? 'positive' : 'negative'}`}>
            <span className="stat-label">Net</span>
            <span className="stat-value">₹{Math.abs(summary.net).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button className="export-btn" onClick={handleExport}>
          📥 Export CSV
        </button>
      </div>

      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={handleSaveEdit}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TransactionReviewTab;
