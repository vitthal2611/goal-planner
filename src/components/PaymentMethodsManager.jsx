import React, { useState } from 'react';
import './PaymentMethodsManager.css';

const PaymentMethodsManager = ({ 
  paymentMethods, 
  onAdd, 
  onDelete, 
  transactions = [],
  onClose 
}) => {
  const [newMethod, setNewMethod] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = newMethod.trim();
    
    if (!trimmed) {
      setError('Payment method name cannot be empty');
      return;
    }

    if (paymentMethods.includes(trimmed)) {
      setError('Payment method already exists');
      return;
    }

    if (trimmed.length > 30) {
      setError('Name too long (max 30 characters)');
      return;
    }

    onAdd(trimmed);
    setNewMethod('');
    setError('');
  };

  const isMethodUsed = (method) => {
    return transactions.some(t => t.paymentMethod === method);
  };

  const getMethodUsageCount = (method) => {
    return transactions.filter(t => t.paymentMethod === method).length;
  };

  return (
    <div className="payment-methods-manager">
      <div className="manager-header">
        <h3>💳 Payment Methods</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="manager-content">
        {/* Add New Payment Method */}
        <div className="add-method-section">
          <h4>Add New Payment Method</h4>
          <div className="add-method-form">
            <input
              type="text"
              placeholder="e.g., HDFC Credit Card, GPay, Cash"
              value={newMethod}
              onChange={(e) => {
                setNewMethod(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="method-input"
              maxLength={30}
            />
            <button onClick={handleAdd} className="btn-add">
              ➕ Add
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Existing Payment Methods */}
        <div className="methods-list-section">
          <h4>Your Payment Methods ({paymentMethods.length})</h4>
          {paymentMethods.length === 0 ? (
            <div className="empty-state">
              <p>No payment methods yet</p>
              <small>Add your first payment method above</small>
            </div>
          ) : (
            <div className="methods-list">
              {paymentMethods.sort((a, b) => a.localeCompare(b)).map(method => {
                const isUsed = isMethodUsed(method);
                const usageCount = getMethodUsageCount(method);
                
                return (
                  <div key={method} className="method-item">
                    <div className="method-info">
                      <span className="method-name">{method}</span>
                      {isUsed && (
                        <span className="usage-badge">
                          {usageCount} transaction{usageCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(method)}
                      disabled={isUsed}
                      title={isUsed ? 'Cannot delete - used in transactions' : 'Delete payment method'}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <p>💡 <strong>Tip:</strong> Payment methods are global and can be used across all months.</p>
          <p>⚠️ You cannot delete payment methods that are used in transactions.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsManager;
