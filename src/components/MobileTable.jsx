import React from 'react';
import './MobileTable.css';

const MobileTable = ({ transactions, onDelete }) => (
  <div className="mobile-table">
    {transactions.map(t => (
      <div key={t.id} className="mobile-card">
        <div className="mobile-card-header">
          <span className="mobile-date">{t.date}</span>
          <span className={`mobile-amount ${t.type === 'income' ? 'income' : 'expense'}`}>
            {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
          </span>
        </div>
        <div className="mobile-card-body">
          <div className="mobile-desc">{t.description}</div>
          <div className="mobile-meta">
            <span className="mobile-envelope">{t.envelope.split('.')[1] || t.envelope}</span>
            <span className="mobile-payment">{t.paymentMethod || 'UPI'}</span>
          </div>
        </div>
        <button className="mobile-delete" onClick={() => onDelete(t.id)}>🗑️</button>
      </div>
    ))}
  </div>
);

export default MobileTable;
