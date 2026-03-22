import React from 'react';
import './CompactSummary.css';

const CompactSummary = ({ income, expenses, balance, paymentBalances }) => {
  const totalPaymentBalance = Object.values(paymentBalances).reduce((sum, val) => sum + val, 0);

  return (
    <div className="compact-summary">
      <div className="summary-item balance-item">
        <div className="summary-label">Balance</div>
        <div className={`summary-value ${balance >= 0 ? 'positive' : 'negative'}`}>
          ₹{balance.toLocaleString()}
        </div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Income</div>
        <div className="summary-value income-value">₹{income.toLocaleString()}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Expenses</div>
        <div className="summary-value expense-value">₹{expenses.toLocaleString()}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Total Cash</div>
        <div className="summary-value">₹{totalPaymentBalance.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default CompactSummary;
