import React from 'react';

const PaymentMethodCard = ({ method, balance, onTransferClick }) => (
  <div className="payment-method-card">
    <div className="payment-method-name">{method}</div>
    <div className="payment-method-balance">₹{balance?.toLocaleString() || '0'}</div>
    {onTransferClick && (
      <button 
        className="transfer-icon-btn" 
        onClick={(e) => {
          e.stopPropagation();
          onTransferClick(method);
        }}
        title="Transfer from this account"
      >
        🔄
      </button>
    )}
  </div>
);

export default PaymentMethodCard;
