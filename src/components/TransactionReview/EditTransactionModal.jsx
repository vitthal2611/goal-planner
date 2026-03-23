import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import './EditTransactionModal.css';

const EditTransactionModal = ({ transaction, onSave, onClose }) => {
  const { paymentMethods, envelopes } = useApp();
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    description: transaction.description || '',
    envelope: transaction.envelope || '',
    payment: transaction.payment || '',
    expenseType: transaction.expenseType || 'need',
    from: transaction.from || '',
    to: transaction.to || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onSave(transaction.id, formData);
  };

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✏️ Edit Transaction</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                className="amount-input"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Transaction description"
            />
          </div>

          {transaction.type === 'transfer' ? (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">From Account</label>
                <select
                  className="form-select"
                  value={formData.from}
                  onChange={(e) => handleChange('from', e.target.value)}
                >
                  <option value="">Select...</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">To Account</label>
                <select
                  className="form-select"
                  value={formData.to}
                  onChange={(e) => handleChange('to', e.target.value)}
                >
                  <option value="">Select...</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              {transaction.type === 'expense' && (
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.envelope}
                    onChange={(e) => handleChange('envelope', e.target.value)}
                  >
                    <option value="">Select category...</option>
                    {envelopes.map(env => (
                      <option key={env.name} value={env.name}>
                        {env.icon} {env.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={formData.payment}
                  onChange={(e) => handleChange('payment', e.target.value)}
                >
                  <option value="">Select method...</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {transaction.type === 'expense' && (
                <div className="form-group">
                  <label className="form-label">Expense Type</label>
                  <div className="expense-type-selector">
                    {['need', 'want', 'save'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`expense-type-btn ${formData.expenseType === type ? 'active' : ''}`}
                        onClick={() => handleChange('expenseType', type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
