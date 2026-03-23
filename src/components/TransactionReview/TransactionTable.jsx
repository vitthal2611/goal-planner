import React from 'react';
import './TransactionTable.css';

const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'transfer': return '🔄';
      default: return '💸';
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'income': return 'income';
      case 'expense': return 'expense';
      case 'transfer': return 'transfer';
      default: return 'expense';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>No transactions found</h3>
        <p>Try adjusting your filters or add some transactions.</p>
      </div>
    );
  }

  return (
    <div className="transaction-table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Category</th>
            <th>Payment</th>
            <th className="amount-col">Amount</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id} className={`transaction-row ${getTypeClass(transaction.type)}`}>
              <td className="date-col">
                <div className="date-cell">
                  <span className="date-main">{formatDate(transaction.date)}</span>
                  <span className="date-time">{formatTime(transaction.date)}</span>
                </div>
              </td>
              <td className="type-col">
                <span className={`type-badge ${getTypeClass(transaction.type)}`}>
                  {getTypeIcon(transaction.type)} {transaction.type}
                </span>
              </td>
              <td className="description-col">
                <div className="description-cell">
                  <span className="description-main">
                    {transaction.description || 'Transaction'}
                  </span>
                  <span className="description-id">ID: {transaction.id}</span>
                </div>
              </td>
              <td className="category-col">
                {transaction.type === 'transfer' ? (
                  <span className="transfer-info">
                    {transaction.from} → {transaction.to}
                  </span>
                ) : (
                  transaction.envelope || '-'
                )}
              </td>
              <td className="payment-col">
                {transaction.payment || '-'}
              </td>
              <td className={`amount-col ${getTypeClass(transaction.type)}`}>
                <span className="amount-value">
                  {transaction.type === 'expense' && '-'}
                  {transaction.type === 'income' && '+'}
                  ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN')}
                </span>
              </td>
              <td className="actions-col">
                <div className="action-buttons">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEdit(transaction)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(transaction.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
