import React from 'react';

const SummaryCard = ({ icon, label, amount, meta, className, amountColor }) => (
  <div className={`summary-card ${className}`}>
    <div className="summary-header">
      <span className="summary-icon">{icon}</span>
      <span className="summary-label">{label}</span>
    </div>
    <div className="summary-amount" style={amountColor ? { color: amountColor } : {}}>
      ₹{amount.toLocaleString()}
    </div>
    <div className="summary-meta">{meta}</div>
  </div>
);

export default SummaryCard;
