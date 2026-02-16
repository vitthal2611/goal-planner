import React, { useState, useCallback, useMemo } from 'react';
import { MobileFormOptimized, MobileInput, MobileButton } from './MobileFormComponents';
import { useHapticFeedback } from '../hooks/useMobileEnhancements';

const QuickAddOptimized = ({ 
  envelopes, 
  customPaymentMethods, 
  dateRange, 
  onAddTransaction, 
  onShowNotification,
  transactions = [],
  monthlyData,
  currentPeriod,
  onTransferClick
}) => {
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    paymentMethod: customPaymentMethods?.[0] || 'HDFC',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { lightTap, success, error } = useHapticFeedback();

  const getPreviousPeriod = useCallback((currentPeriodStr) => {
    if (!currentPeriodStr) return null;
    const [year, month] = currentPeriodStr.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  }, []);

  const getSpentAmount = useCallback((category, name, forPeriod = currentPeriod) => {
    const periodData = monthlyData[forPeriod] || { transactions: transactions };
    if (!periodData?.transactions) return 0;
    
    return periodData.transactions
      .filter(t => t.envelope === `${category}.${name}` && !t.type)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyData, transactions, currentPeriod]);

  const getRolloverAmount = useCallback((category, name, forPeriod = currentPeriod) => {
    const targetPeriod = forPeriod || currentPeriod;
    const previousPeriod = getPreviousPeriod(targetPeriod);
    const previousData = monthlyData[previousPeriod];
    
    if (!previousData?.envelopes?.[category]?.[name]) return 0;
    
    const prevEnv = previousData.envelopes[category][name];
    const prevRollover = getRolloverAmount(category, name, previousPeriod);
    const prevSpent = getSpentAmount(category, name, previousPeriod);
    const lastMonthBalance = prevEnv.budgeted + prevRollover - prevSpent;
    
    return Math.max(0, lastMonthBalance);
  }, [monthlyData, currentPeriod, getPreviousPeriod, getSpentAmount]);

  const getPaymentMethodBalance = useCallback((paymentMethod) => {
    let balance = 0;
    // Get ALL transactions from ALL periods
    Object.keys(monthlyData).forEach(period => {
      const periodTransactions = monthlyData[period]?.transactions || [];
      periodTransactions.forEach(transaction => {
        if (transaction.paymentMethod === paymentMethod) {
          if (transaction.type === 'income' || transaction.type === 'transfer-in' || transaction.type === 'loan') {
            balance += transaction.amount;
          } else if (transaction.type === 'transfer-out') {
            balance -= transaction.amount;
          } else {
            balance -= transaction.amount;
          }
        }
      });
    });
    return balance;
  }, [monthlyData]);

  const envelopeBalances = useMemo(() => {
    const balances = {};
    
    Object.keys(envelopes).forEach(category => {
      balances[category] = {};
      Object.keys(envelopes[category]).forEach(name => {
        const env = envelopes[category][name];
        const rollover = getRolloverAmount(category, name);
        const spent = getSpentAmount(category, name);
        balances[category][name] = env.budgeted + rollover - spent;
      });
    });
    
    return balances;
  }, [envelopes, getRolloverAmount, getSpentAmount]);

  const paymentBalances = useMemo(() => {
    const balances = {};
    customPaymentMethods.forEach(method => {
      balances[method] = getPaymentMethodBalance(method);
    });
    return balances;
  }, [customPaymentMethods, getPaymentMethodBalance]);

  const getStatusInfo = useCallback((category, name) => {
    const balance = envelopeBalances[category]?.[name] || 0;
    const env = envelopes[category]?.[name];
    
    if (!env) return { color: '#dc2626', status: 'invalid', icon: '❌' };
    
    const spent = getSpentAmount(category, name);
    const percentage = env.budgeted > 0 ? (spent / env.budgeted) * 100 : 0;
    
    if (balance <= 0) return { color: '#dc2626', status: 'blocked', icon: '🚫' };
    if (percentage > 90) return { color: '#f59e0b', status: 'critical', icon: '⚠️' };
    if (percentage > 75) return { color: '#3b82f6', status: 'warning', icon: '📊' };
    return { color: '#10b981', status: 'healthy', icon: '✅' };
  }, [envelopeBalances, envelopes, getSpentAmount]);

  const handleEnvelopeClick = useCallback((category, name) => {
    lightTap();
    setSelectedEnvelope({ category, name });
    setExpenseForm({
      amount: '',
      description: '',
      paymentMethod: customPaymentMethods?.[0] || 'HDFC',
      date: new Date().toISOString().split('T')[0]
    });
  }, [lightTap, customPaymentMethods]);

  const validateAmount = useCallback((value) => {
    const amount = parseFloat(value);
    const balance = selectedEnvelope ? envelopeBalances[selectedEnvelope.category]?.[selectedEnvelope.name] || 0 : 0;
    
    if (!value) return { error: 'Amount is required' };
    if (isNaN(amount) || amount <= 0) return { error: 'Enter a valid amount' };
    if (amount > balance) return { warning: `Exceeds budget by ₹${(amount - balance).toLocaleString()}` };
    
    return {};
  }, [selectedEnvelope, envelopeBalances]);

  const handleAddExpense = useCallback(async (e) => {
    e.preventDefault();
    
    if (!selectedEnvelope) return;
    
    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(expenseForm.amount);
      
      if (!amount || amount <= 0) {
        error();
        onShowNotification('error', 'Enter valid amount');
        return;
      }

      const transaction = {
        envelope: `${selectedEnvelope.category}.${selectedEnvelope.name}`,
        amount,
        description: expenseForm.description || 'Quick expense',
        paymentMethod: expenseForm.paymentMethod,
        date: expenseForm.date
      };

      await onAddTransaction(transaction);
      
      success();
      setSelectedEnvelope(null);
      setExpenseForm({
        amount: '',
        description: '',
        paymentMethod: customPaymentMethods?.[0] || 'HDFC',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      error();
      onShowNotification('error', 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedEnvelope, expenseForm, onAddTransaction, success, error, onShowNotification, customPaymentMethods]);

  return (
    <div className="quick-add-optimized">
      {/* Transfer Button */}
      <div className="quick-actions-bar">
        <button 
          className="transfer-button-quick"
          onClick={onTransferClick}
          aria-label="Transfer between payment methods"
        >
          <span className="transfer-icon">🔄</span>
          <span className="transfer-text">Transfer Money</span>
        </button>
      </div>

      <div className="envelope-grid-optimized">
        {Object.keys(envelopes).map(category => {
          const categoryIcon = category === 'needs' ? '🏠' : category === 'savings' ? '💰' : '🎯';
          const categoryColor = category === 'needs' ? '#10b981' : category === 'savings' ? '#f59e0b' : '#3b82f6';
          
          return (
            <div key={category} className="category-section-optimized">
              <div className="category-header" style={{ color: categoryColor }}>
                <span className="category-icon">{categoryIcon}</span>
                <h3 className="category-title">{category.toUpperCase()}</h3>
              </div>
              
              <div className="envelope-cards-grid">
                {Object.keys(envelopes[category]).map(name => {
                  const balance = envelopeBalances[category]?.[name] || 0;
                  const statusInfo = getStatusInfo(category, name);
                  
                  return (
                    <div
                      key={name}
                      className="envelope-card-optimized"
                      onClick={() => handleEnvelopeClick(category, name)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${name} envelope, balance ₹${balance.toLocaleString()}`}
                    >
                      <div className="envelope-status" style={{ color: statusInfo.color }}>
                        {statusInfo.icon}
                      </div>
                      <div className="envelope-name">{name.toUpperCase()}</div>
                      <div className="envelope-balance" style={{ color: statusInfo.color }}>
                        ₹{balance.toLocaleString()}
                      </div>
                      <div className="envelope-tap-hint">Tap to spend</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedEnvelope && (
        <div className="modal-overlay-optimized" onClick={() => setSelectedEnvelope(null)}>
          <div className="expense-modal-optimized" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-optimized">
              <div className="modal-title-section">
                <div className="modal-icon">💸</div>
                <div>
                  <h3 className="modal-title">{selectedEnvelope.name.toUpperCase()}</h3>
                  <p className="modal-subtitle">Add new expense</p>
                </div>
              </div>
              <button 
                className="modal-close-optimized" 
                onClick={() => setSelectedEnvelope(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-balance-display">
              <div className="balance-info">
                <span className="balance-label">Available Balance</span>
                <span className="balance-amount">
                  ₹{(envelopeBalances[selectedEnvelope.category]?.[selectedEnvelope.name] || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <MobileFormOptimized onSubmit={handleAddExpense} className="expense-form-optimized">
              <MobileInput
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="₹ 0.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                validate={validateAmount}
                required
                autoFocus
              />

              <MobileInput
                label="Description"
                type="text"
                placeholder="What did you buy?"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                maxLength={100}
              />

              <div className="payment-method-section">
                <label className="section-label">Payment Method</label>
                <div className="payment-grid-optimized">
                  {(customPaymentMethods || []).map(method => {
                    const balance = paymentBalances[method] || 0;
                    const isSelected = expenseForm.paymentMethod === method;
                    
                    return (
                      <div 
                        key={method} 
                        className={`payment-card-optimized ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          lightTap();
                          setExpenseForm({ ...expenseForm, paymentMethod: method });
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${method} payment method, balance ₹${balance.toLocaleString()}`}
                      >
                        <div className="payment-name">{method}</div>
                        <div className="payment-balance" style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}>
                          ₹{balance.toLocaleString()}
                        </div>
                        {isSelected && <div className="payment-selected-indicator">✓</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <MobileInput
                label="Date"
                type="date"
                value={expenseForm.date}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                required
              />

              <div className="modal-actions-optimized">
                <MobileButton 
                  variant="secondary" 
                  onClick={() => setSelectedEnvelope(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </MobileButton>
                <MobileButton 
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={!expenseForm.amount || parseFloat(expenseForm.amount) <= 0}
                  fullWidth
                >
                  Add ₹{expenseForm.amount || '0'}
                </MobileButton>
              </div>
            </MobileFormOptimized>
          </div>
        </div>
      )}

      <style>{`
        .quick-add-optimized {
          padding: 16px;
          min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .quick-actions-bar {
          margin-bottom: 20px;
        }

        .transfer-button-quick {
          width: 100%;
          padding: 16px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
        }

        .transfer-button-quick:active {
          transform: scale(0.97);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        .transfer-icon {
          font-size: 20px;
        }

        .transfer-text {
          font-size: 15px;
          letter-spacing: 0.3px;
        }

        .envelope-grid-optimized {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .category-section-optimized {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f1f5f9;
        }

        .category-icon {
          font-size: 24px;
        }

        .category-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .envelope-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .envelope-card-optimized {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        .envelope-card-optimized:active {
          transform: scale(0.95);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .envelope-card-optimized.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .envelope-status {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .envelope-name {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          line-height: 1.2;
          word-break: break-word;
          margin-bottom: 4px;
        }

        .envelope-balance {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .envelope-tap-hint {
          font-size: 9px;
          color: #6b7280;
          font-weight: 500;
          opacity: 0.8;
        }

        .modal-overlay-optimized {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
          backdrop-filter: blur(4px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .expense-modal-optimized {
          background: white;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .modal-header-optimized {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 2px solid #f1f5f9;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-icon {
          font-size: 24px;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          color: #1f2937;
          font-weight: 700;
        }

        .modal-subtitle {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .modal-close-optimized {
          background: #f3f4f6;
          border: none;
          font-size: 18px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .modal-close-optimized:active {
          transform: scale(0.9);
          background: #e5e7eb;
        }

        .modal-balance-display {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }

        .balance-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .balance-label {
          font-size: 12px;
          opacity: 0.9;
          font-weight: 500;
        }

        .balance-amount {
          font-size: 28px;
          font-weight: 700;
        }

        .expense-form-optimized {
          padding: 20px;
        }

        .payment-method-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .payment-grid-optimized {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .payment-card-optimized {
          padding: 12px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          min-height: 70px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }

        .payment-card-optimized:active {
          transform: scale(0.95);
        }

        .payment-card-optimized.selected {
          border-color: #10b981;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .payment-name {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        .payment-balance {
          font-size: 14px;
          font-weight: 700;
        }

        .payment-selected-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #10b981;
          font-size: 14px;
          font-weight: 700;
        }

        .modal-actions-optimized {
          display: flex;
          gap: 12px;
          padding: 20px;
          border-top: 2px solid #f1f5f9;
          position: sticky;
          bottom: 0;
          background: white;
        }

        @media (max-width: 480px) {
          .envelope-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .payment-grid-optimized {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 768px) {
          .quick-add-optimized {
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .envelope-cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }

          .modal-overlay-optimized {
            align-items: center;
          }

          .expense-modal-optimized {
            border-radius: 20px;
            max-width: 500px;
            max-height: 85vh;
          }

          .payment-grid-optimized {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default QuickAddOptimized;