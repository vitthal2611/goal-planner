import React, { useState } from 'react';
import { sanitizeInput, validatePaymentMethod } from '../utils/sanitize';

const QuickExpenseForm = ({ 
  envelopes, 
  customPaymentMethods, 
  dateRange, 
  onAddTransaction, 
  onAddCustomPaymentMethod,
  onShowNotification 
}) => {
  const [transaction, setTransaction] = useState({
    envelope: '',
    amount: '',
    description: '',
    paymentMethod: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');

  const handleSubmit = () => {
    const { envelope, amount, description } = transaction;

    if (!amount || parseFloat(amount) <= 0) {
      onShowNotification('error', 'Enter valid amount');
      return;
    }

    if (!envelope) {
      onShowNotification('error', 'Select envelope');
      return;
    }

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

    // Reset form but keep envelope and payment method for convenience
    setTransaction({
      envelope: transaction.envelope,
      amount: '',
      description: '',
      paymentMethod: transaction.paymentMethod,
      date: new Date().toISOString().split('T')[0]
    });
    setCustomPaymentMethod('');
  };

  return (
    <div className="card mobile-optimized">
      <div className="card-header">
        <h3>⚡ Quick Expense</h3>
      </div>
      <div className="card-content">
        <div className="quick-expense-form">
          <div className="quick-form-row">
            <select
              value={transaction.envelope}
              onChange={(e) => setTransaction({...transaction, envelope: e.target.value})}
              className="quick-envelope"
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
            
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="₹ Amount"
              value={transaction.amount}
              onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
              className="quick-amount"
              inputMode="decimal"
              autoComplete="off"
              aria-label="Transaction amount"
            />
            
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
              <option value="">Select Payment Method</option>
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