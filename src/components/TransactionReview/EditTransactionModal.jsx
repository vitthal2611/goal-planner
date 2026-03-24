import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import './EditTransactionModal.css';

const EditTransactionModal = ({ transaction, onSave, onClose }) => {
  const { paymentMethods, envelopes } = useApp();
  const [currentType, setCurrentType] = useState(transaction.type);
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

  const handleTypeChange = (newType) => {
    if (newType === currentType) return;
    
    // Clear type-specific fields when changing type
    const clearedData = { ...formData };
    
    if (newType === 'transfer') {
      // Converting to transfer: clear envelope, payment, expenseType
      clearedData.envelope = '';
      clearedData.payment = '';
      clearedData.expenseType = 'need';
      // Try to set from/to intelligently
      if (transaction.payment && !clearedData.from) {
        clearedData.from = transaction.payment;
      }
    } else if (newType === 'expense') {
      // Converting to expense: clear from/to, set payment if available
      clearedData.from = '';
      clearedData.to = '';
      if (transaction.from && !clearedData.payment) {
        clearedData.payment = transaction.from;
      }
    } else if (newType === 'income') {
      // Converting to income: clear envelope, from/to, expenseType
      clearedData.envelope = '';
      clearedData.from = '';
      clearedData.to = '';
      clearedData.expenseType = 'need';
      if (transaction.to && !clearedData.payment) {
        clearedData.payment = transaction.to;
      }
    }
    
    setFormData(clearedData);
    setCurrentType(newType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Validate type-specific required fields
    if (currentType === 'transfer') {
      if (!formData.from || !formData.to) {
        alert('Please select both From and To accounts for transfer');
        return;
      }
      if (formData.from === formData.to) {
        alert('From and To accounts must be different');
        return;
      }
    } else if (currentType === 'expense') {
      if (!formData.payment) {
        alert('Please select a payment method');
        return;
      }
    } else if (currentType === 'income') {
      if (!formData.payment) {
        alert('Please select a payment method');
        return;
      }
    }

    // Build updates object with type change if needed
    const updates = { ...formData };
    
    // If type changed, update the ID prefix and include type in updates
    if (currentType !== transaction.type) {
      const timestamp = transaction.id.split('-')[1]; // Keep original timestamp
      const prefixMap = { income: 'INC', expense: 'EXP', transfer: 'TRF' };
      updates.id = `${prefixMap[currentType]}-${timestamp}`;
      updates.type = currentType;
      
      // Clear fields that don't apply to new type
      if (currentType === 'transfer') {
        updates.envelope = '';
        updates.payment = '';
        updates.expenseType = '';
      } else if (currentType === 'income') {
        updates.envelope = '';
        updates.from = '';
        updates.to = '';
        updates.expenseType = '';
      } else if (currentType === 'expense') {
        updates.from = '';
        updates.to = '';
      }
    }

    onSave(transaction.id, updates);
  };

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✏️ Edit Transaction</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
          {/* Type Selector */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-selector-edit">
              <button
                type="button"
                className={`type-btn-edit income ${currentType === 'income' ? 'active' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <span className="icon">💰</span>
                <span>Income</span>
              </button>
              <button
                type="button"
                className={`type-btn-edit expense ${currentType === 'expense' ? 'active' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <span className="icon">💸</span>
                <span>Expense</span>
              </button>
              <button
                type="button"
                className={`type-btn-edit transfer ${currentType === 'transfer' ? 'active' : ''}`}
                onClick={() => handleTypeChange('transfer')}
              >
                <span className="icon">🔄</span>
                <span>Transfer</span>
              </button>
            </div>
            {currentType !== transaction.type && (
              <div className="type-change-warning">
                ⚠️ Converting from {transaction.type} to {currentType}
              </div>
            )}
          </div>

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

          {currentType === 'transfer' ? (
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
              {currentType === 'expense' && (
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

              {currentType === 'expense' && (
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
