import React, { useState } from 'react';
import { sanitizeInput, validatePaymentMethod } from '../utils/sanitize';
import './QuickExpenseForm.css';

const QuickExpenseForm = ({ 
  envelopes, 
  customPaymentMethods, 
  dateRange, 
  onAddTransaction, 
  onAddCustomPaymentMethod,
  onShowNotification,
  onTransfer,
  preSelectedEnvelope = null,
  hideSubmitButton = false
}) => {
  const [transaction, setTransaction] = useState({
    envelope: preSelectedEnvelope || '',
    amount: '',
    description: '',
    paymentMethod: 'HDFC',
    date: new Date().toISOString().split('T')[0]
  });
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [errors, setErrors] = useState({});

  // Update envelope when preSelectedEnvelope changes
  React.useEffect(() => {
    if (preSelectedEnvelope) {
      setTransaction(prev => ({ ...prev, envelope: preSelectedEnvelope }));
      validateField('envelope', preSelectedEnvelope);
    }
  }, [preSelectedEnvelope]);

  const getEnvelopeBalance = (envelopeKey) => {
    if (!envelopeKey) return null;
    const [category, name] = envelopeKey.split('.');
    const env = envelopes[category]?.[name];
    return env ? env.budgeted + env.rollover - env.spent : null;
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'amount') {
      if (!value || parseFloat(value) <= 0) {
        newErrors.amount = 'Enter valid amount';
      } else {
        delete newErrors.amount;
      }
    }
    
    if (field === 'envelope') {
      if (!value) {
        newErrors.envelope = 'Select envelope';
      } else {
        delete newErrors.envelope;
        const balance = getEnvelopeBalance(value);
        const amount = parseFloat(transaction.amount);
        if (balance !== null && amount > balance) {
          newErrors.balance = `Low balance: ₹${balance.toLocaleString()} available`;
        } else {
          delete newErrors.balance;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const { envelope, amount, description } = transaction;

    const isAmountValid = validateField('amount', amount);
    const isEnvelopeValid = validateField('envelope', envelope);
    
    if (!isAmountValid || !isEnvelopeValid) return;

    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Blur active input to hide keyboard on mobile
    if (document.activeElement) {
      document.activeElement.blur();
    }

    // Sanitize user inputs
    const sanitizedTransaction = {
      ...transaction,
      description: sanitizeInput(description || 'Quick expense'),
      paymentMethod: transaction.paymentMethod === 'Custom' 
        ? sanitizeInput(customPaymentMethod) 
        : transaction.paymentMethod
    };

    // Validate custom payment method
    if (transaction.paymentMethod === 'Custom') {
      if (!validatePaymentMethod(customPaymentMethod)) {
        onShowNotification('error', 'Invalid payment method. Use only letters, numbers, spaces, hyphens, and underscores.');
        return;
      }
      onAddCustomPaymentMethod(sanitizedTransaction.paymentMethod);
    }

    onAddTransaction(sanitizedTransaction);

    setTransaction({
      envelope: transaction.envelope,
      amount: '',
      description: '',
      paymentMethod: transaction.paymentMethod,
      date: new Date().toISOString().split('T')[0]
    });
    setCustomPaymentMethod('');
    setErrors({});
  };

  return (
    <div className="card mobile-optimized quick-expense-card">
      <div className="card-header">
        <h3>⚡ Quick Expense</h3>
        <button 
          className="btn btn-primary btn-sm touch-feedback"
          onClick={onTransfer}
        >
          🔄 Transfer
        </button>
      </div>
      <div className="card-content">
        <div className="quick-expense-form">
          <div className="quick-form-row">
            <div className="form-field">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="₹ Amount"
                value={transaction.amount}
                onChange={(e) => {
                  setTransaction({...transaction, amount: e.target.value});
                  validateField('amount', e.target.value);
                  if (transaction.envelope) validateField('envelope', transaction.envelope);
                }}
                className={`quick-amount ${errors.amount ? 'input-error' : ''}`}
                inputMode="decimal"
                autoComplete="off"
                aria-label="Transaction amount"
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
          </div>
          
          <div className="quick-form-row">
            <div className="form-field">
              <select
                value={transaction.envelope}
                onChange={(e) => {
                  setTransaction({...transaction, envelope: e.target.value});
                  validateField('envelope', e.target.value);
                }}
                className={`quick-envelope ${errors.envelope ? 'input-error' : ''} ${errors.balance ? 'input-warning' : ''}`}
                aria-label="Select envelope"
              >
                <option value="">Select Envelope</option>
                {Object.keys(envelopes)
                  .flatMap(category =>
                    Object.keys(envelopes[category]).map(name => ({
                      category,
                      name,
                      env: envelopes[category][name]
                    }))
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ category, name, env }) => {
                    const balance = env.budgeted + env.rollover - env.spent;
                    return (
                      <option key={`${category}.${name}`} value={`${category}.${name}`}>
                        {name.toUpperCase()} - ₹{balance.toLocaleString()}
                      </option>
                    );
                  })
                }
              </select>
              {errors.envelope && <span className="error-text">{errors.envelope}</span>}
              {errors.balance && <span className="warning-text">⚠️ {errors.balance}</span>}
            </div>
            
            <input
              type="date"
              value={transaction.date}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) => setTransaction({...transaction, date: e.target.value})}
              className="quick-date"
            />
          </div>
          
          <div className="quick-form-row">
            <input
              type="text"
              placeholder="Description (optional)"
              value={transaction.description}
              onChange={(e) => setTransaction({...transaction, description: e.target.value})}
              className="quick-description"
              autoComplete="off"
              aria-label="Transaction description"
              maxLength="100"
            />
            
            <select
              value={transaction.paymentMethod}
              onChange={(e) => {
                setTransaction({...transaction, paymentMethod: e.target.value});
                if (e.target.value !== 'Custom') setCustomPaymentMethod('');
              }}
              className="quick-payment"
              aria-label="Select payment method"
            >
              {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
              <option value="Custom">➕ Add New</option>
            </select>
            
            {transaction.paymentMethod === 'Custom' && (
              <input
                type="text"
                placeholder="Enter payment method"
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                className="quick-payment"
                autoComplete="off"
                aria-label="Custom payment method name"
                maxLength="50"
              />
            )}
          </div>
          
          <div className="quick-form-row">
            <button 
              className="btn btn-success quick-add-btn touch-feedback" 
              onClick={handleSubmit}
              disabled={!transaction.envelope || !transaction.amount}
              style={{ display: hideSubmitButton ? 'none' : 'flex' }}
            >
              ➕ Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickExpenseForm;