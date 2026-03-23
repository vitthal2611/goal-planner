import React, { useState } from 'react';
import './TransactionItem.css';

const TransactionItem = ({ transaction, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = (type) => {
    switch (type) {
      case 'income': return 'income';
      case 'expense': return 'expense';
      case 'transfer': return 'transfer';
      default: return 'expense';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'transfer': return '🔄';
      default: return '💸';
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

  const typeColor = getTypeColor(transaction.type);
  const typeIcon = getTypeIcon(transaction.type);

  return (
    <div className={`transaction-item ${typeColor}`}>
      <div className="transaction-main" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="transaction-left">
          <span className="transaction-icon">{typeIcon}</span>
          <div className="transaction-info">
            <div className="transaction-description">
              {transaction.description || 'Transaction'}
            </div>
            <div className="transaction-meta">
              {formatTime(transaction.date)}
              {transaction.type === 'expense' && transaction.envelope && (
                <> · {transaction.envelope}</>
              )}
              {transaction.type === 'transfer' && (
                <> · {transaction.from} → {transaction.to}</>
              )}
              {transaction.type !== 'transfer' && transaction.payment && (
                <> · {transaction.payment}</>
              )}
            </div>
          </div>
        </div>
        <div className="transaction-right">
          <div className="transaction-amount">
            {transaction.type === 'expense' && '-'}
            {transaction.type === 'income' && '+'}
            ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN')}
          </div>
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="transaction-details">
          <div className="transaction-detail-row">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{transaction.type}</span>
          </div>
          {transaction.envelope && (
            <div className="transaction-detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{transaction.envelope}</span>
            </div>
          )}
          {transaction.payment && (
            <div className="transaction-detail-row">
              <span className="detail-label">Payment:</span>
              <span className="detail-value">{transaction.payment}</span>
            </div>
          )}
          {transaction.expenseType && (
            <div className="transaction-detail-row">
              <span className="detail-label">Expense Type:</span>
              <span className="detail-value">{transaction.expenseType}</span>
            </div>
          )}
          {transaction.type === 'transfer' && (
            <>
              <div className="transaction-detail-row">
                <span className="detail-label">From:</span>
                <span className="detail-value">{transaction.from}</span>
              </div>
              <div className="transaction-detail-row">
                <span className="detail-label">To:</span>
                <span className="detail-value">{transaction.to}</span>
              </div>
            </>
          )}
          <div className="transaction-detail-row">
            <span className="detail-label">ID:</span>
            <span className="detail-value">{transaction.id}</span>
          </div>
          <div className="transaction-actions">
            <button
              className="action-btn delete-btn"
              onClick={() => onDelete(transaction.id)}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
