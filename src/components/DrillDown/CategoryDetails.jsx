import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import './CategoryDetails.css';

const CategoryDetails = ({ category, envelopes, onBack }) => {
  const { deleteTransaction } = useApp();
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const envelope = envelopes.find(e => e.name === category.name);
  const icon = envelope?.icon || '📦';
  const type = envelope?.type || 'need';

  const sortedTransactions = useMemo(() => {
    const sorted = [...category.transactions];
    sorted.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        const amtA = parseFloat(a.amount || 0);
        const amtB = parseFloat(b.amount || 0);
        return sortOrder === 'desc' ? amtB - amtA : amtA - amtB;
      }
    });
    return sorted;
  }, [category.transactions, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const amounts = category.transactions.map(t => parseFloat(t.amount || 0));
    const avg = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const max = Math.max(...amounts, 0);
    const min = Math.min(...amounts, Infinity);

    // Group by payment method
    const byPayment = {};
    category.transactions.forEach(t => {
      const payment = t.payment || 'Unknown';
      byPayment[payment] = (byPayment[payment] || 0) + parseFloat(t.amount || 0);
    });

    return { avg, max, min: min === Infinity ? 0 : min, byPayment };
  }, [category.transactions]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      if (category.transactions.length <= 1) {
        onBack();
      }
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="category-details">
      <div className="details-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className={`details-title-section ${type}`}>
          <div className="details-icon">{icon}</div>
          <div className="details-title-info">
            <h2 className="details-title">{category.name}</h2>
            <div className="details-subtitle">
              {category.count} transaction{category.count !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="details-total">
            ₹{category.total.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="details-stats">
        <div className="stat-card">
          <div className="stat-label">Average</div>
          <div className="stat-value">₹{stats.avg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Highest</div>
          <div className="stat-value">₹{stats.max.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lowest</div>
          <div className="stat-value">₹{stats.min.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {Object.keys(stats.byPayment).length > 1 && (
        <div className="payment-breakdown">
          <h3 className="section-title">By Payment Method</h3>
          <div className="payment-bars">
            {Object.entries(stats.byPayment)
              .sort((a, b) => b[1] - a[1])
              .map(([payment, amount], index) => {
                const percentage = (amount / category.total * 100).toFixed(1);
                return (
                  <div key={index} className="payment-bar-row">
                    <div className="payment-bar-label">{payment}</div>
                    <div className="payment-bar-track">
                      <div
                        className="payment-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="payment-bar-value">
                      ₹{amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="transactions-section">
        <div className="transactions-header">
          <h3 className="section-title">All Transactions</h3>
          <div className="sort-controls">
            <button
              className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => handleSort('date')}
            >
              Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-btn ${sortBy === 'amount' ? 'active' : ''}`}
              onClick={() => handleSort('amount')}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        <div className="transactions-list">
          {sortedTransactions.map((transaction, index) => (
            <div key={index} className="transaction-row">
              <div className="transaction-date">
                {formatDate(transaction.date)}
              </div>
              <div className="transaction-info">
                <div className="transaction-desc">
                  {transaction.description || 'Expense'}
                </div>
                <div className="transaction-tags">
                  {transaction.payment && (
                    <span className="transaction-tag">{transaction.payment}</span>
                  )}
                  {transaction.expenseType && (
                    <span className="transaction-tag">{transaction.expenseType}</span>
                  )}
                </div>
              </div>
              <div className="transaction-amount">
                ₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
              </div>
              <button
                className="transaction-delete"
                onClick={() => handleDelete(transaction.id)}
                title="Delete transaction"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
