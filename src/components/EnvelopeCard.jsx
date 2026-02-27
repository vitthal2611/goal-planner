import React from 'react';

const EnvelopeCard = ({ category, name, balance, statusColor, onClick, disabled }) => (
  <div
    className={`compact-envelope-card ${disabled ? 'disabled' : ''}`}
    onClick={onClick}
  >
    <div className="envelope-name">{name.toUpperCase()}</div>
    <div className="envelope-balance" style={{ color: statusColor }}>
      ₹{balance.toLocaleString()}
    </div>
  </div>
);

export default EnvelopeCard;
