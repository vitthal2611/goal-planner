import React from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './TransactionsList.css';

const TransactionsList = () => {
  const { transactions, deleteTransaction } = useBudget();

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  if (transactions.length === 0) {
    return <div className="empty-state">No transactions yet</div>;
  }

  return (
    <div className="transactions-list">
      <h3>Recent Transactions</h3>
      <div className="transactions-grid">
        {transactions.map(t => (
          <div key={t.id} className={`transaction-card ${t.type.toLowerCase()}`}>
            <div className="transaction-header">
              <span className="transaction-type">{t.type}</span>
              <button onClick={() => handleDelete(t.id)} className="btn-delete">
                🗑️
              </button>
            </div>
            <div className="transaction-body">
              <div className="transaction-amount">₹{t.amount.toFixed(2)}</div>
              <div className="transaction-description">{t.description}</div>
              <div className="transaction-details">
                <span className="transaction-envelope">{t.envelope}</span>
                <span className="transaction-method">{t.paymentMethod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsList;
