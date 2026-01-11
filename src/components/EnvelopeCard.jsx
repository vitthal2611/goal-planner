import React, { useState, memo } from 'react';
import { sanitizeInput } from '../utils/sanitize';

const EnvelopeCard = memo(({ 
  category, 
  name, 
  envelope, 
  onAddExpense, 
  onViewDetails,
  customPaymentMethods = [],
  isCompact = false 
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickExpense, setQuickExpense] = useState({
    amount: '',
    description: '',
    paymentMethod: customPaymentMethods[0] || 'UPI'
  });

  const balance = envelope.budgeted + envelope.rollover - envelope.spent;
  const percentage = envelope.budgeted > 0 ? (envelope.spent / envelope.budgeted) * 100 : 0;
  
  const getStatusColor = () => {
    if (balance <= 0) return 'var(--danger)';
    if (percentage > 80) return 'var(--warning)';
    return 'var(--success)';
  };

  const getStatusIcon = () => {
    if (balance <= 0) return '🚫';
    if (percentage > 80) return '⚠️';
    return '✅';
  };

  const handleQuickAdd = () => {
    const amount = parseFloat(quickExpense.amount);
    if (!amount || amount <= 0) return;
    
    if (amount > balance) {
      alert(`Insufficient balance! Available: ₹${balance.toLocaleString()}`);
      return;
    }

    const transaction = {
      envelope: `${category}.${name}`,
      amount,
      description: sanitizeInput(quickExpense.description || 'Quick expense'),
      paymentMethod: quickExpense.paymentMethod,
      date: new Date().toISOString().split('T')[0]
    };

    onAddExpense(transaction);
    
    // Reset form
    setQuickExpense({
      amount: '',
      description: '',
      paymentMethod: quickExpense.paymentMethod
    });
    setShowQuickAdd(false);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleCardClick = () => {
    if (balance <= 0) {
      alert('This envelope has no remaining balance');
      return;
    }
    setShowQuickAdd(!showQuickAdd);
  };

  return (
    <div className={`envelope-card ${isCompact ? 'compact' : ''} ${balance <= 0 ? 'disabled' : ''}`}>
      {/* Main Envelope Display */}
      <div 
        className="envelope-main"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`${name} envelope, balance ₹${balance.toLocaleString()}`}
      >
        <div className="envelope-header">
          <div className="envelope-icon">
            <span className="status-icon">{getStatusIcon()}</span>
            <span className="envelope-emoji">💰</span>
          </div>
          <div className="envelope-info">
            <h3 className="envelope-name">{name.toUpperCase()}</h3>
            <p className="envelope-category">{category.toUpperCase()}</p>
          </div>
          <div className="envelope-balance">
            <span className="balance-amount" style={{ color: getStatusColor() }}>
              ₹{balance.toLocaleString()}
            </span>
            <span className="balance-label">Available</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="envelope-progress">
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getStatusColor()
              }}
            />
          </div>
          <div className="progress-text">
            <span>₹{envelope.spent.toLocaleString()} spent</span>
            <span>of ₹{envelope.budgeted.toLocaleString()}</span>
          </div>
        </div>

        {/* Quick Stats */}
        {!isCompact && (
          <div className="envelope-stats">
            <div className="stat-item">
              <span className="stat-value">₹{envelope.budgeted.toLocaleString()}</span>
              <span className="stat-label">Budgeted</span>
            </div>
            {envelope.rollover > 0 && (
              <div className="stat-item">
                <span className="stat-value">₹{envelope.rollover.toLocaleString()}</span>
                <span className="stat-label">Rollover</span>
              </div>
            )}
            <div className="stat-item">
              <span className="stat-value">{percentage.toFixed(0)}%</span>
              <span className="stat-label">Used</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Expense Form */}
      {showQuickAdd && (
        <div className="quick-add-form">
          <div className="quick-add-header">
            <h4>Add to {name}</h4>
            <button 
              className="close-btn"
              onClick={() => setShowQuickAdd(false)}
              aria-label="Close quick add form"
            >
              ×
            </button>
          </div>
          
          <div className="quick-add-inputs">
            <div className="input-group">
              <input
                type="number"
                step="0.01"
                min="0"
                max={balance}
                placeholder="₹ Amount"
                value={quickExpense.amount}
                onChange={(e) => setQuickExpense({...quickExpense, amount: e.target.value})}
                className="amount-input"
                inputMode="decimal"
                autoFocus
              />
              <div className="quick-amounts">
                {[100, 500, 1000].filter(amt => amt <= balance).map(amount => (
                  <button
                    key={amount}
                    className="quick-amount-btn"
                    onClick={() => setQuickExpense({...quickExpense, amount: amount.toString()})}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Description (optional)"
              value={quickExpense.description}
              onChange={(e) => setQuickExpense({...quickExpense, description: e.target.value})}
              className="description-input"
              maxLength="100"
            />

            <select
              value={quickExpense.paymentMethod}
              onChange={(e) => setQuickExpense({...quickExpense, paymentMethod: e.target.value})}
              className="payment-select"
            >
              {customPaymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div className="quick-add-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowQuickAdd(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-success"
              onClick={handleQuickAdd}
              disabled={!quickExpense.amount || parseFloat(quickExpense.amount) <= 0}
            >
              Add ₹{quickExpense.amount || '0'}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="envelope-actions">
        <button 
          className="action-btn primary"
          onClick={handleCardClick}
          disabled={balance <= 0}
          aria-label={`Add expense to ${name}`}
        >
          <span>💸</span>
          Add Expense
        </button>
        <button 
          className="action-btn secondary"
          onClick={() => onViewDetails(category, name)}
          aria-label={`View details for ${name}`}
        >
          <span>📊</span>
          Details
        </button>
      </div>
    </div>
  );
});

EnvelopeCard.displayName = 'EnvelopeCard';

export default EnvelopeCard;