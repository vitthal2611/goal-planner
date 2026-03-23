import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import TransactionItem from './TransactionItem';
import Toast from '../shared/Toast';
import './TodayTransactionsTab.css';

const TodayTransactionsTab = () => {
  const { transactions, deleteTransaction, updateTransaction } = useApp();
  const [toast, setToast] = useState(null);

  const todayTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return transactions
      .filter(t => {
        if (!t.date) return false;
        try {
          const txDate = new Date(t.date);
          txDate.setHours(0, 0, 0, 0);
          return txDate.getTime() === today.getTime();
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  const summary = useMemo(() => {
    const income = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expense = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return { income, expense, net: income - expense };
  }, [todayTransactions]);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      setToast({ message: 'Transaction deleted', type: 'success' });
    }
  };

  const handleEdit = (id, updates) => {
    updateTransaction(id, updates);
    setToast({ message: 'Transaction updated', type: 'success' });
  };

  return (
    <div className="today-transactions-tab">
      <div className="today-summary">
        <div className="today-summary-card income">
          <div className="summary-label">Income</div>
          <div className="summary-amount">₹{summary.income.toLocaleString('en-IN')}</div>
        </div>
        <div className="today-summary-card expense">
          <div className="summary-label">Expense</div>
          <div className="summary-amount">₹{summary.expense.toLocaleString('en-IN')}</div>
        </div>
        <div className={`today-summary-card net ${summary.net >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-label">Net</div>
          <div className="summary-amount">₹{Math.abs(summary.net).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="transactions-header">
          <h3 className="transactions-title">Today's Transactions</h3>
          <span className="transactions-count">{todayTransactions.length} transactions</span>
        </div>

        {todayTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No transactions today</h3>
            <p>Add your first transaction in the Quick Track tab.</p>
          </div>
        ) : (
          <div className="transactions-list">
            {todayTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

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

export default TodayTransactionsTab;
