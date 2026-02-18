import React, { useState } from 'react';
import './QuickAdd.css';

const QuickAdd = ({ 
  envelopes, 
  customPaymentMethods, 
  dateRange, 
  onAddTransaction, 
  onShowNotification,
  transactions = [],
  monthlyData,
  currentPeriod
}) => {
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    paymentMethod: customPaymentMethods?.[0] || 'HDFC',
    date: new Date().toISOString().split('T')[0]
  });

  const getPreviousPeriod = (currentPeriodStr) => {
    if (!currentPeriodStr) return null;
    const [year, month] = currentPeriodStr.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  };

  const getSpentAmount = (category, name, forPeriod = currentPeriod) => {
    const periodData = monthlyData[forPeriod] || { transactions: transactions };
    if (!periodData?.transactions) return 0;
    
    return periodData.transactions
      .filter(t => t.envelope === `${category}.${name}` && !t.type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getRolloverAmount = (category, name, forPeriod = currentPeriod) => {
    const targetPeriod = forPeriod || currentPeriod;
    const previousPeriod = getPreviousPeriod(targetPeriod);
    const previousData = monthlyData[previousPeriod];
    
    if (!previousData?.envelopes?.[category]?.[name]) return 0;
    
    const prevEnv = previousData.envelopes[category][name];
    const prevRollover = getRolloverAmount(category, name, previousPeriod);
    const prevSpent = getSpentAmount(category, name, previousPeriod);
    const lastMonthBalance = prevEnv.budgeted + prevRollover - prevSpent;
    
    return Math.max(0, lastMonthBalance);
  };

  const getEnvelopeBalance = (category, name) => {
    const env = envelopes[category]?.[name];
    if (!env) return 0;
    
    const rollover = getRolloverAmount(category, name);
    const spent = getSpentAmount(category, name);
    return env.budgeted + rollover - spent;
  };

  const getPaymentMethodBalance = (paymentMethod) => {
    let balance = 0;
    transactions.forEach(transaction => {
      if (transaction.paymentMethod === paymentMethod) {
        if (transaction.type === 'income' || transaction.type === 'transfer-in') {
          balance += transaction.amount;
        } else if (transaction.type === 'transfer-out') {
          balance -= transaction.amount;
        } else {
          balance -= transaction.amount;
        }
      }
    });
    return balance;
  };

  const handleEnvelopeClick = (category, name) => {
    const balance = getEnvelopeBalance(category, name);
    if (balance <= 0) {
      onShowNotification('error', 'No balance available in this envelope');
      return;
    }
    setSelectedEnvelope({ category, name });
    setExpenseForm({
      amount: '',
      description: '',
      paymentMethod: customPaymentMethods?.[0] || 'HDFC',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddExpense = () => {
    if (!selectedEnvelope) return;
    
    const amount = parseFloat(expenseForm.amount);
    if (!amount || amount <= 0) {
      onShowNotification('error', 'Enter valid amount');
      return;
    }

    if (!expenseForm.paymentMethod) {
      onShowNotification('error', 'Please select a payment method');
      return;
    }

    const balance = getEnvelopeBalance(selectedEnvelope.category, selectedEnvelope.name);
    if (amount > balance) {
      onShowNotification('error', `Insufficient balance! Available: ₹${balance.toLocaleString()}`);
      return;
    }

    const transaction = {
      envelope: `${selectedEnvelope.category}.${selectedEnvelope.name}`,
      amount,
      description: expenseForm.description || 'Quick expense',
      paymentMethod: expenseForm.paymentMethod,
      date: expenseForm.date
    };

    onAddTransaction(transaction);
    setSelectedEnvelope(null);
    setExpenseForm({
      amount: '',
      description: '',
      paymentMethod: customPaymentMethods?.[0] || 'HDFC',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusColor = (category, name) => {
    if (!envelopes[category]?.[name]) return '#dc2626';
    
    const env = envelopes[category][name];
    const rollover = getRolloverAmount(category, name);
    const spent = getSpentAmount(category, name);
    const balance = env.budgeted + rollover - spent;
    const percentage = env.budgeted > 0 ? (spent / env.budgeted) * 100 : 0;
    
    if (balance <= 0) return '#dc2626';
    if (percentage > 80) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="quick-add-container">
      {/* Compact Envelope Grid */}
      <div className="compact-envelope-grid">
        {Object.keys(envelopes).map(category => (
          <div key={category} className="category-section">
            <h3 className="category-title">
              {category === 'needs' ? '🏠' :
               category === 'savings' ? '💰' : '🎯'}
            </h3>
            <div className="envelope-cards">
              {Object.keys(envelopes[category]).map(name => {
                const env = envelopes[category][name];
                const rollover = getRolloverAmount(category, name);
                const spent = getSpentAmount(category, name);
                const balance = env.budgeted + rollover - spent;
                const statusColor = getStatusColor(category, name);

                return (
                  <div
                    key={name}
                    className={`compact-envelope-card ${balance <= 0 ? 'disabled' : ''}`}
                    onClick={() => handleEnvelopeClick(category, name)}
                  >
                    <div className="envelope-name">{name.toUpperCase()}</div>
                    <div className="envelope-balance" style={{ color: statusColor }}>
                      ₹{balance.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Expense Modal */}
      {selectedEnvelope && (
        <div className="expense-modal-overlay" onClick={() => setSelectedEnvelope(null)}>
          <div className="expense-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">💸</span>
                <h3>{selectedEnvelope.name.toUpperCase()}</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedEnvelope(null)}>×</button>
            </div>

            <div className="modal-balance">
              <span className="balance-label">Available</span>
              <span className="balance-amount">₹{getEnvelopeBalance(selectedEnvelope.category, selectedEnvelope.name).toLocaleString()}</span>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="₹ 0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
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
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="description-input"
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label>Payment Method <span style={{color: '#ef4444'}}>*</span></label>
                <div className="payment-grid">
                  {(customPaymentMethods || []).map(method => (
                    <div 
                      key={method} 
                      className={`payment-card ${expenseForm.paymentMethod === method ? 'selected' : ''}`}
                      onClick={() => setExpenseForm({ ...expenseForm, paymentMethod: method })}
                    >
                      <div className="payment-name">{method}</div>
                      <div className="payment-balance">₹{getPaymentMethodBalance(method).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  min={dateRange.min}
                  max={dateRange.max}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="date-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setSelectedEnvelope(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-add" 
                onClick={handleAddExpense}
                disabled={!expenseForm.amount || parseFloat(expenseForm.amount) <= 0 || !expenseForm.paymentMethod}
              >
                Add Expense ₹{expenseForm.amount || '0'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAdd;
