import React, { useContext } from 'react';
import { BudgetContext } from '../contexts/BudgetContext.jsx';
import './TransactionsList.css';

const TransactionsList = () => {
  const { transactions } = useContext(BudgetContext);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Income':
        return '#28a745';
      case 'Expense':
        return '#dc3545';
      case 'Transfer-In':
        return '#17a2b8';
      case 'Transfer-Out':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Income':
        return '💰';
      case 'Expense':
        return '💸';
      case 'Transfer-In':
        return '📥';
      case 'Transfer-Out':
        return '📤';
      default:
        return '📝';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="transactions-container">
        <h3>Recent Transactions</h3>
        <div className="empty-state">No transactions yet</div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <h3>Recent Transactions</h3>
      <div className="transactions-list">
        {transactions.map((txn, idx) => (
          <div key={txn.id || idx} className="transaction-item">
            <div className="transaction-icon" style={{ color: getTypeColor(txn.type) }}>
              {getTypeIcon(txn.type)}
            </div>
            <div className="transaction-details">
              <div className="transaction-description">{txn.description}</div>
              <div className="transaction-meta">
                {txn.envelope && <span className="envelope-badge">{txn.envelope}</span>}
                <span className="payment-method">{txn.paymentMethod}</span>
                <span className="date">{formatDate(txn.date)}</span>
              </div>
            </div>
            <div className="transaction-amount" style={{ color: getTypeColor(txn.type) }}>
              {txn.type === 'Income' || txn.type === 'Transfer-In' ? '+' : '-'}₹{txn.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;
