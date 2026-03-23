import React, { useState } from 'react';
import './NWSCard.css';

const NWSCard = ({ type, icon, label, amount, percent, transactions }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`nws-card ${type}`}>
      <div className="nws-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="nws-card-icon">{icon}</div>
        <div className="nws-card-info">
          <div className="nws-card-label">{label}</div>
          <div className="nws-card-amount">
            ₹{amount.toLocaleString('en-IN')}
          </div>
          <div className="nws-card-percent">{percent}% of total</div>
        </div>
        <button className="nws-card-toggle">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="nws-card-transactions">
          <div className="nws-card-transactions-header">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
          {transactions.length === 0 ? (
            <div className="nws-card-empty">No transactions</div>
          ) : (
            <div className="nws-card-list">
              {transactions.map((transaction, index) => (
                <div key={index} className="nws-transaction">
                  <div className="nws-transaction-date">
                    {formatDate(transaction.date)}
                  </div>
                  <div className="nws-transaction-info">
                    <div className="nws-transaction-desc">
                      {transaction.description || 'Expense'}
                    </div>
                    <div className="nws-transaction-tags">
                      {transaction.envelope && (
                        <span className="nws-transaction-tag">
                          {transaction.envelope}
                        </span>
                      )}
                      {transaction.payment && (
                        <span className="nws-transaction-tag">
                          {transaction.payment}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="nws-transaction-amount">
                    ₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NWSCard;
