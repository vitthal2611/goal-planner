import React from 'react';
import './BalanceCard.css';

const BalanceCard = ({ title, amount, type, icon }) => {
  const formattedAmount = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className={`balance-card ${type}`}>
      <div className="balance-card-header">
        <span className="balance-card-icon">{icon}</span>
        <span className="balance-card-title">{title}</span>
      </div>
      <div className="balance-card-amount">
        ₹{formattedAmount}
      </div>
      {type === 'negative' && (
        <div className="balance-card-badge">Deficit</div>
      )}
      {type === 'positive' && amount > 0 && (
        <div className="balance-card-badge">Surplus</div>
      )}
    </div>
  );
};

export default BalanceCard;
