import React from 'react';

const ExpenseModal = ({ 
  envelope, 
  balance, 
  form, 
  paymentMethods, 
  paymentBalances,
  onClose, 
  onFormChange, 
  onSubmit 
}) => (
  <div className="expense-modal-overlay" onClick={onClose}>
    <div className="expense-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-title">
          <span className="modal-icon">💸</span>
          <h3>{envelope.name.toUpperCase()}</h3>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="modal-balance">
        <span className="balance-label">Available</span>
        <span className="balance-amount">₹{balance.toLocaleString()}</span>
      </div>

      <div className="modal-form">
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="₹ 0"
            value={form.amount}
            onChange={(e) => onFormChange({ ...form, amount: e.target.value })}
            className="amount-input"
            inputMode="decimal"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            placeholder="What did you buy?"
            value={form.description}
            onChange={(e) => onFormChange({ ...form, description: e.target.value })}
            className="description-input"
            maxLength="100"
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <div className="payment-grid">
            {paymentMethods.map(method => (
              <div 
                key={method} 
                className={`payment-card ${form.paymentMethod === method ? 'selected' : ''}`}
                onClick={() => onFormChange({ ...form, paymentMethod: method })}
              >
                <div className="payment-name">{method}</div>
                <div className="payment-balance">₹{paymentBalances[method]?.toLocaleString() || '0'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button 
          className="btn btn-add" 
          onClick={onSubmit}
          disabled={!form.amount || parseFloat(form.amount) <= 0}
        >
          Add Expense ₹{form.amount || '0'}
        </button>
      </div>
    </div>
  </div>
);

export default ExpenseModal;
