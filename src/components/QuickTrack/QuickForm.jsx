import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import Toast from '../shared/Toast';
import './QuickForm.css';

const QuickForm = ({ type, onSubmit }) => {
  const { paymentMethods, envelopes } = useApp();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    envelope: '',
    payment: '',
    from: '',
    to: '',
    expenseType: 'need',
  });
  const [toast, setToast] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setToast({ message: 'Please enter a valid amount', type: 'error' });
      return;
    }

    if (type === 'transfer') {
      if (!formData.from || !formData.to) {
        setToast({ message: 'Please select both From and To accounts', type: 'error' });
        return;
      }
      if (formData.from === formData.to) {
        setToast({ message: 'From and To accounts must be different', type: 'error' });
        return;
      }
    } else {
      if (!formData.payment) {
        setToast({ message: 'Please select a payment method', type: 'error' });
        return;
      }
      if (type === 'expense' && !formData.envelope) {
        setToast({ message: 'Please select a category', type: 'error' });
        return;
      }
    }

    const transaction = {
      type,
      amount: parseFloat(formData.amount),
      description: formData.description || (type === 'transfer' ? 'Transfer' : 'Transaction'),
      envelope: type === 'expense' ? formData.envelope : '',
      payment: type !== 'transfer' ? formData.payment : '',
      from: type === 'transfer' ? formData.from : '',
      to: type === 'transfer' ? formData.to : '',
      expenseType: type === 'expense' ? formData.expenseType : '',
    };

    const success = onSubmit(transaction);
    
    if (success) {
      setToast({ message: '✅ Transaction added successfully!', type: 'success' });
      // Reset form
      setFormData({
        amount: '',
        description: '',
        envelope: '',
        payment: '',
        from: '',
        to: '',
        expenseType: 'need',
      });
    }
  };

  return (
    <>
      <form className="quick-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Amount</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              className="amount-input"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-input"
            placeholder="What's this for?"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {type === 'transfer' ? (
          <>
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
          </>
        ) : (
          <>
            {type === 'expense' && (
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.envelope}
                  onChange={(e) => handleChange('envelope', e.target.value)}
                >
                  <option value="">Select category...</option>
                  {envelopes.map(env => (
                    <option key={env.name} value={env.name}>{env.icon} {env.name}</option>
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

            {type === 'expense' && (
              <div className="form-group">
                <label className="form-label">Expense Type</label>
                <div className="expense-type-selector">
                  {['need', 'want', 'save'].map(expType => (
                    <button
                      key={expType}
                      type="button"
                      className={`expense-type-btn ${formData.expenseType === expType ? 'active' : ''}`}
                      onClick={() => handleChange('expenseType', expType)}
                    >
                      {expType.charAt(0).toUpperCase() + expType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <button type="submit" className="submit-btn">
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default QuickForm;
