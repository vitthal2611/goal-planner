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
  onTransferClick,
  onDeleteTransaction,
  onUpdatePaymentMethod,
  onUpdateEnvelope,
  onSwitchToTransactions
}) => {
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState({ type: '', value: '' });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [loanForm, setLoanForm] = useState({ amount: '', description: '', paymentMethod: '' });
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [quickAddForm, setQuickAddForm] = useState({ amount: '', envelope: '', showAdvanced: false });

  // Auto-dismiss undo notification after 5 seconds
  React.useEffect(() => {
    if (lastTransaction) {
      const timer = setTimeout(() => setLastTransaction(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastTransaction]);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    paymentMethod: customPaymentMethods?.[0] || 'HDFC',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { lightTap, success, error } = useHapticFeedback();

  const getAllTransactions = useMemo(() => {
    const allTrans = [];
    Object.keys(monthlyData || {}).forEach(period => {
      const periodTrans = monthlyData[period]?.transactions || [];
      allTrans.push(...periodTrans);
    });
    return allTrans.length > 0 ? allTrans : transactions;
  }, [monthlyData, transactions]);

  const loanBalance = useMemo(() => {
    let borrowed = 0;
    let repaid = 0;
    getAllTransactions.forEach(t => {
      if (t.type === 'loan') borrowed += t.amount;
      if (t.type === 'repay') repaid += t.amount;
    });
    return { borrowed, repaid, net: borrowed - repaid };
  }, [getAllTransactions]);

  const getPreviousPeriod = useCallback((currentPeriodStr) => {
    if (!currentPeriodStr) return null;
    const [year, month] = currentPeriodStr.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  }, []);

  const getSpentAmount = useCallback((category, name, forPeriod = currentPeriod) => {
    // If year view (no month), aggregate all months in that year
    if (currentPeriod.match(/^\d{4}$/)) {
      let totalSpent = 0;
      Object.keys(monthlyData).forEach(period => {
        if (period.startsWith(currentPeriod)) {
          const periodData = monthlyData[period];
          if (periodData?.transactions) {
            totalSpent += periodData.transactions
              .filter(t => t.envelope === `${category}.${name}` && !t.type)
              .reduce((sum, t) => sum + t.amount, 0);
          }
        }
      });
      return totalSpent;
    }
    
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
    
    // If year view, get transactions from all months in that year
    if (currentPeriod.match(/^\d{4}$/)) {
      Object.keys(monthlyData).forEach(period => {
        if (period.startsWith(currentPeriod)) {
          const periodTransactions = monthlyData[period]?.transactions || [];
          periodTransactions.forEach(transaction => {
            if (transaction.paymentMethod === paymentMethod) {
              if (transaction.type === 'income' || transaction.type === 'transfer-in' || transaction.type === 'loan') {
                balance += transaction.amount;
              } else if (transaction.type === 'transfer-out' || transaction.type === 'repay') {
                balance -= transaction.amount;
              } else {
                balance -= transaction.amount;
              }
            }
          });
        }
      });
    } else {
      // Month view - get transactions only from current period
      const periodTransactions = monthlyData[currentPeriod]?.transactions || [];
      periodTransactions.forEach(transaction => {
        if (transaction.paymentMethod === paymentMethod) {
          if (transaction.type === 'income' || transaction.type === 'transfer-in' || transaction.type === 'loan') {
            balance += transaction.amount;
          } else if (transaction.type === 'transfer-out' || transaction.type === 'repay') {
            balance -= transaction.amount;
          } else {
            balance -= transaction.amount;
          }
        }
      });
    }
    
    return balance;
  }, [monthlyData, currentPeriod]);

  const envelopeBalances = useMemo(() => {
    const balances = {};
    
    // If year view, aggregate budgeted and spent from all months
    if (currentPeriod.match(/^\d{4}$/)) {
      Object.keys(envelopes).forEach(category => {
        balances[category] = {};
        Object.keys(envelopes[category]).forEach(name => {
          let totalBudgeted = 0;
          let totalSpent = 0;
          
          Object.keys(monthlyData).forEach(period => {
            if (period.startsWith(currentPeriod)) {
              const periodData = monthlyData[period];
              if (periodData?.envelopes?.[category]?.[name]) {
                totalBudgeted += periodData.envelopes[category][name].budgeted || 0;
              }
              if (periodData?.transactions) {
                totalSpent += periodData.transactions
                  .filter(t => t.envelope === `${category}.${name}` && !t.type)
                  .reduce((sum, t) => sum + t.amount, 0);
              }
            }
          });
          
          balances[category][name] = totalBudgeted - totalSpent;
        });
      });
    } else {
      Object.keys(envelopes).forEach(category => {
        balances[category] = {};
        Object.keys(envelopes[category]).forEach(name => {
          const env = envelopes[category][name];
          const spent = getSpentAmount(category, name);
          balances[category][name] = env.budgeted - spent;
        });
      });
    }
    
    return balances;
  }, [envelopes, getSpentAmount, currentPeriod, monthlyData]);

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

  const handleQuickAdd = useCallback(async () => {
    if (!quickAddForm.amount || !quickAddForm.envelope) {
      onShowNotification('error', 'Enter amount and select envelope');
      return;
    }

    const amount = parseFloat(quickAddForm.amount);
    if (amount <= 0) {
      onShowNotification('error', 'Enter valid amount');
      return;
    }

    const sortedMethods = Object.entries(paymentBalances)
      .sort(([, a], [, b]) => b - a)
      .filter(([, balance]) => balance > 0);
    const bestMethod = sortedMethods.length > 0 ? sortedMethods[0][0] : customPaymentMethods?.[0] || 'Cash';

    const [category, name] = quickAddForm.envelope.split('.');
    const transaction = {
      envelope: quickAddForm.envelope,
      amount,
      description: name,
      paymentMethod: bestMethod,
      date: new Date().toISOString().split('T')[0]
    };

    await onAddTransaction(transaction);
    success();
    setLastTransaction({ ...transaction, id: Date.now() });
    setQuickAddForm({ amount: '', envelope: '', showAdvanced: false });
  }, [quickAddForm, onAddTransaction, success, paymentBalances, customPaymentMethods, onShowNotification]);

  const handleEnvelopeClick = useCallback((category, name) => {
    lightTap();
    
    // Auto-select payment method with highest balance
    const sortedMethods = Object.entries(paymentBalances)
      .sort(([, a], [, b]) => b - a)
      .filter(([, balance]) => balance > 0);
    
    const bestMethod = sortedMethods.length > 0 ? sortedMethods[0][0] : customPaymentMethods?.[0] || 'HDFC';
    
    setSelectedEnvelope({ category, name });
    setExpenseForm({
      amount: '',
      description: name, // Pre-fill with envelope name
      paymentMethod: bestMethod,
      date: new Date().toISOString().split('T')[0]
    });
  }, [lightTap, customPaymentMethods, paymentBalances]);

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
        setIsSubmitting(false);
        return;
      }

      // Check payment method balance
      const paymentBalance = paymentBalances[expenseForm.paymentMethod] || 0;
      if (paymentBalance < amount) {
        // Allow but warn
        const proceed = window.confirm(`${expenseForm.paymentMethod} has only ₹${paymentBalance.toLocaleString()}. This will create negative balance. Continue?`);
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
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
      setLastTransaction({ ...transaction, envelope: `${selectedEnvelope.category}.${selectedEnvelope.name}` });
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
  }, [selectedEnvelope, expenseForm, onAddTransaction, success, error, onShowNotification, customPaymentMethods, paymentBalances]);

  return (
    <div className="quick-add-optimized">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card" style={{ gridColumn: 'span 3' }}>
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Total Available</div>
            <div className="summary-value">₹{Object.values(envelopeBalances).reduce((sum, cat) => sum + Object.values(cat).reduce((s, bal) => s + bal, 0), 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Quick Add Inline */}
      <div className="quick-add-inline">
        <h4 className="section-title">💸 Quick Add Expense</h4>
        <div className="quick-add-form">
          <input
            type="number"
            placeholder="₹ Amount"
            value={quickAddForm.amount}
            onChange={(e) => setQuickAddForm({ ...quickAddForm, amount: e.target.value })}
            className="quick-input"
          />
          <select
            value={quickAddForm.envelope}
            onChange={(e) => setQuickAddForm({ ...quickAddForm, envelope: e.target.value })}
            className="quick-select"
          >
            <option value="">Select Envelope</option>
            {Object.keys(envelopes).flatMap(cat => 
              Object.keys(envelopes[cat]).map(name => (
                <option key={`${cat}.${name}`} value={`${cat}.${name}`}>
                  {cat.toUpperCase()} - {name.toUpperCase()}
                </option>
              ))
            )}
          </select>
          <button className="quick-add-btn" onClick={handleQuickAdd}>
            Add
          </button>
        </div>
      </div>

      {/* Undo Notification */}
      {lastTransaction && (
        <div className="undo-notification">
          <div className="undo-content">
            <span>✓ Added ₹{lastTransaction.amount.toLocaleString()} to {lastTransaction.envelope.split('.')[1]?.toUpperCase()}</span>
            <div className="undo-actions">
              <button onClick={() => {
                onDeleteTransaction(lastTransaction.id);
                setLastTransaction(null);
                onShowNotification('success', 'Undone');
              }}>Undo</button>
              <button onClick={() => setLastTransaction(null)}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Action Bar */}
      <div className="quick-actions-bar">
        <button className="action-button transfer" onClick={onTransferClick}>
          <span>🔄</span>
          <span>Transfer</span>
        </button>
        <button className="action-button review" onClick={onSwitchToTransactions}>
          <span>📋</span>
          <span>Review All</span>
        </button>
      </div>

      {/* Grouped Envelope View */}
      <div className="budget-status-card">
        <h4 className="section-title">📊 Budget Status</h4>
        {Object.keys(envelopes).map(category => {
          const categoryIcon = category === 'needs' ? '🏠' : category === 'savings' ? '💰' : '🎯';
          const categoryColor = category === 'needs' ? '#10b981' : category === 'savings' ? '#f59e0b' : '#3b82f6';
          
          const categoryBudgeted = Object.values(envelopes[category]).reduce((sum, env) => sum + env.budgeted, 0);
          const categorySpent = Object.keys(envelopes[category]).reduce((sum, name) => sum + getSpentAmount(category, name), 0);
          const categoryPercentage = categoryBudgeted > 0 ? (categorySpent / categoryBudgeted) * 100 : 0;
          
          return (
            <div key={category} className="category-group">
              <div 
                className="category-summary"
                onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
              >
                <div className="category-info">
                  <span className="category-icon">{categoryIcon}</span>
                  <span className="category-name">{category.toUpperCase()}</span>
                  <span className="expand-icon">{expandedCategories[category] ? '▲' : '▼'}</span>
                </div>
                <div className="category-amounts">
                  <span style={{ color: categoryColor, fontWeight: '700' }}>₹{categorySpent.toLocaleString()}</span>
                  <span style={{ color: '#9ca3af' }}> / ₹{categoryBudgeted.toLocaleString()}</span>
                </div>
              </div>
              <div className="category-progress">
                <div className="category-progress-bar" style={{ width: `${Math.min(categoryPercentage, 100)}%`, backgroundColor: categoryColor }}></div>
              </div>
              
              {expandedCategories[category] && (
                <div className="envelope-chips">
                  {Object.keys(envelopes[category]).map(name => {
                    const balance = envelopeBalances[category]?.[name] || 0;
                    const statusInfo = getStatusInfo(category, name);
                    
                    return (
                      <div
                        key={name}
                        className="envelope-chip"
                        onClick={() => handleEnvelopeClick(category, name)}
                        style={{ borderColor: statusInfo.color }}
                      >
                        <span className="chip-name">{name.toUpperCase()}</span>
                        <span className="chip-balance" style={{ color: statusInfo.color }}>₹{balance.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Methods Quick View - Collapsible */}
      <div className="payment-quick-view">
        <div className="section-header-collapsible" onClick={() => setShowPaymentMethods(!showPaymentMethods)}>
          <h4 className="section-title">💳 Payment Methods</h4>
          <span className="collapse-icon">{showPaymentMethods ? '▲' : '▼'}</span>
        </div>
        {showPaymentMethods && (
          <div className="payment-scroll">
            {Object.entries(paymentBalances).map(([method, balance]) => (
              <div 
                key={method} 
                className="payment-quick-card"
                onDoubleClick={() => {
                  lightTap();
                  setTransactionFilter({ type: 'payment', value: method });
                  setShowTransactions(true);
                }}
              >
                <div className="payment-method-name">{method}</div>
                <div className="payment-method-balance" style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}>
                  ₹{balance.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTransactions && (
        <div className="modal-overlay-optimized" onClick={() => setShowTransactions(false)}>
          <div className="expense-modal-optimized" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-optimized">
              <div className="modal-title-section">
                <div className="modal-icon">📋</div>
                <div>
                  <h3 className="modal-title">
                    {transactionFilter.type === 'payment' ? transactionFilter.value : transactionFilter.value.split('.')[1]?.toUpperCase()}
                  </h3>
                  <p className="modal-subtitle">Transaction History</p>
                </div>
              </div>
              <button className="modal-close-optimized" onClick={() => setShowTransactions(false)}>✕</button>
            </div>
            <div className="transaction-list-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>{transactionFilter.type === 'payment' ? 'Envelope' : 'Payment'}</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllTransactions
                    .filter(t => 
                      transactionFilter.type === 'payment' 
                        ? t.paymentMethod === transactionFilter.value
                        : t.envelope === transactionFilter.value
                    )
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(t => (
                      <tr key={t.id}>
                        <td>{t.date}</td>
                        <td>
                          {editingTransaction?.id === t.id ? (
                            <input
                              type="text"
                              value={editingTransaction.description}
                              onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                              className="edit-input"
                            />
                          ) : (
                            t.description
                          )}
                        </td>
                        <td>
                          {transactionFilter.type === 'payment' ? (
                            editingTransaction?.id === t.id ? (
                              <select
                                value={editingTransaction.envelope}
                                onChange={(e) => setEditingTransaction({...editingTransaction, envelope: e.target.value})}
                                className="edit-select"
                              >
                                {Object.keys(envelopes).flatMap(cat => 
                                  Object.keys(envelopes[cat]).map(name => (
                                    <option key={`${cat}.${name}`} value={`${cat}.${name}`}>
                                      {name.toUpperCase()}
                                    </option>
                                  ))
                                )}
                              </select>
                            ) : (
                              t.envelope === 'INCOME' || t.envelope === 'LOAN' || t.envelope === 'TRANSFER' ? t.envelope : t.envelope.replace('.', ' - ')
                            )
                          ) : (
                            editingTransaction?.id === t.id ? (
                              <select
                                value={editingTransaction.paymentMethod}
                                onChange={(e) => setEditingTransaction({...editingTransaction, paymentMethod: e.target.value})}
                                className="edit-select"
                              >
                                {customPaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            ) : (
                              t.paymentMethod
                            )
                          )}
                        </td>
                        <td style={{ color: t.type === 'income' ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </td>
                        <td>
                          {editingTransaction?.id === t.id ? (
                            <div className="action-buttons">
                              <button className="btn-save" onClick={() => {
                                if (transactionFilter.type === 'payment' && editingTransaction.envelope !== t.envelope) {
                                  onUpdateEnvelope(t.id, editingTransaction.envelope);
                                } else if (editingTransaction.paymentMethod !== t.paymentMethod) {
                                  onUpdatePaymentMethod(t.id, editingTransaction.paymentMethod);
                                }
                                setEditingTransaction(null);
                              }}>✓</button>
                              <button className="btn-cancel" onClick={() => setEditingTransaction(null)}>✕</button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button className="btn-edit" onClick={() => setEditingTransaction(t)}>✏️</button>
                              <button className="btn-delete" onClick={() => setDeleteConfirm(t.id)}>🗑️</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              {getAllTransactions.filter(t => 
                transactionFilter.type === 'payment' 
                  ? t.paymentMethod === transactionFilter.value
                  : t.envelope === transactionFilter.value
              ).length === 0 && (
                <div className="empty-transactions">
                  <div>📄</div>
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay-optimized" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Transaction?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-delete" onClick={() => {
                onDeleteTransaction(deleteConfirm);
                setDeleteConfirm(null);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {selectedEnvelope && !showTransactions && (
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
                label="Description (Optional)"
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
                    const isSufficient = balance >= parseFloat(expenseForm.amount || 0);
                    
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
                        <div className="payment-balance" style={{ color: isSufficient || !expenseForm.amount ? '#10b981' : '#ef4444' }}>
                          ₹{balance.toLocaleString()}
                        </div>
                        {isSelected && <div className="payment-selected-indicator">✓</div>}
                        {!isSufficient && expenseForm.amount && <div className="payment-insufficient">⚠️</div>}
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

      {showBorrowModal && (
        <div className="modal-overlay-optimized" onClick={() => setShowBorrowModal(false)}>
          <div className="expense-modal-optimized" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-optimized">
              <div className="modal-title-section">
                <div className="modal-icon">🤝</div>
                <div>
                  <h3 className="modal-title">Borrow Money</h3>
                  <p className="modal-subtitle">Record borrowed amount</p>
                </div>
              </div>
              <button className="modal-close-optimized" onClick={() => setShowBorrowModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <MobileInput
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="₹ 0.00"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                required
                autoFocus
              />
              <MobileInput
                label="Borrowed From"
                type="text"
                placeholder="e.g., Friend name"
                value={loanForm.description}
                onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
              />
              <div style={{ marginTop: '16px' }}>
                <label className="section-label">Payment Method</label>
                <select
                  value={loanForm.paymentMethod}
                  onChange={(e) => setLoanForm({ ...loanForm, paymentMethod: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '14px' }}
                >
                  {customPaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions-optimized">
              <MobileButton variant="secondary" onClick={() => setShowBorrowModal(false)}>Cancel</MobileButton>
              <MobileButton 
                variant="primary"
                onClick={() => {
                  if (loanForm.amount && parseFloat(loanForm.amount) > 0) {
                    onAddTransaction({
                      envelope: 'LOAN',
                      amount: parseFloat(loanForm.amount),
                      description: loanForm.description || 'Borrowed money',
                      paymentMethod: loanForm.paymentMethod,
                      date: new Date().toISOString().split('T')[0],
                      type: 'loan'
                    });
                    setShowBorrowModal(false);
                  }
                }}
                fullWidth
              >
                Add Borrow
              </MobileButton>
            </div>
          </div>
        </div>
      )}

      {showRepayModal && (
        <div className="modal-overlay-optimized" onClick={() => setShowRepayModal(false)}>
          <div className="expense-modal-optimized" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-optimized">
              <div className="modal-title-section">
                <div className="modal-icon">💸</div>
                <div>
                  <h3 className="modal-title">Repay Loan</h3>
                  <p className="modal-subtitle">Record repayment</p>
                </div>
              </div>
              <button className="modal-close-optimized" onClick={() => setShowRepayModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <MobileInput
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="₹ 0.00"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                required
                autoFocus
              />
              <MobileInput
                label="Repaying To"
                type="text"
                placeholder="e.g., Friend name"
                value={loanForm.description}
                onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })}
              />
              <div style={{ marginTop: '16px' }}>
                <label className="section-label">Payment Method</label>
                <select
                  value={loanForm.paymentMethod}
                  onChange={(e) => setLoanForm({ ...loanForm, paymentMethod: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '14px' }}
                >
                  {customPaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions-optimized">
              <MobileButton variant="secondary" onClick={() => setShowRepayModal(false)}>Cancel</MobileButton>
              <MobileButton 
                variant="primary"
                onClick={() => {
                  if (loanForm.amount && parseFloat(loanForm.amount) > 0) {
                    onAddTransaction({
                      envelope: 'LOAN',
                      amount: parseFloat(loanForm.amount),
                      description: loanForm.description || 'Repaid loan',
                      paymentMethod: loanForm.paymentMethod,
                      date: new Date().toISOString().split('T')[0],
                      type: 'repay'
                    });
                    setShowRepayModal(false);
                  }
                }}
                fullWidth
              >
                Add Repayment
              </MobileButton>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .quick-add-optimized {
          padding: 16px;
          min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%);
        }

        .summary-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .summary-card:active {
          transform: scale(0.98);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .summary-card.warning {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .summary-icon {
          font-size: 32px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .summary-content {
          text-align: center;
        }

        .summary-label {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .summary-value {
          font-size: 36px;
          font-weight: 900;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
        }

        .payment-quick-view {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .quick-add-inline {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 2px solid #e0f2fe;
        }

        .quick-add-form {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 8px;
          margin-top: 12px;
        }

        .quick-input, .quick-select {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .quick-input:focus, .quick-select:focus {
          outline: none;
          border-color: #10b981;
        }

        .quick-add-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quick-add-btn:active {
          transform: scale(0.96);
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
        }

        .budget-status-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .category-group {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .category-group:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .category-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 8px 0;
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-name {
          font-size: 14px;
          font-weight: 700;
          color: #374151;
        }

        .expand-icon {
          font-size: 10px;
          color: #9ca3af;
        }

        .category-amounts {
          font-size: 16px;
        }

        .category-progress {
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          overflow: hidden;
          margin: 8px 0;
        }

        .category-progress-bar {
          height: 100%;
          transition: width 0.3s ease;
        }

        .envelope-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .envelope-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .envelope-chip:active {
          transform: scale(0.96);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chip-name {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
        }

        .chip-balance {
          font-size: 13px;
          font-weight: 700;
        }
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .collapse-icon {
          font-size: 12px;
          color: #6b7280;
        }

        .undo-notification {
          position: fixed;
          bottom: 80px;
          left: 16px;
          right: 16px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          z-index: 999;
          animation: slideUp 0.3s ease;
        }

        .undo-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .undo-actions {
          display: flex;
          gap: 8px;
        }

        .undo-actions button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .undo-actions button:active {
          background: rgba(255, 255, 255, 0.3);
        }

        .payment-card-optimized.insufficient {
          opacity: 1;
          cursor: pointer;
        }

        .payment-insufficient {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 14px;
        }
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .payment-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .payment-scroll::-webkit-scrollbar {
          display: none;
        }

        .payment-quick-card {
          min-width: 120px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-quick-card:active {
          transform: scale(0.95);
          background: #e5e7eb;
        }

        .payment-method-name {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .payment-method-balance {
          font-size: 18px;
          font-weight: 700;
        }

        .quick-actions-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .action-button {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }

        .action-button.transfer {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-button.review {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .action-button.borrow {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .action-button.repay {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .action-button:active {
          transform: scale(0.97);
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
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        .envelope-card-optimized:active {
          transform: scale(0.95);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .envelope-card-optimized.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .envelope-card-optimized.disabled:active {
          transform: none;
        }

        .envelope-status {
          font-size: 20px;
          margin-bottom: 2px;
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
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .envelope-progress {
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .progress-bar {
          height: 100%;
          transition: width 0.3s ease;
        }

        .envelope-budget-info {
          font-size: 9px;
          color: #6b7280;
          font-weight: 500;
        }

        .transaction-list-container {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .transaction-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .transaction-table th {
          background: #f3f4f6;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          position: sticky;
          top: 0;
        }

        .transaction-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .transaction-table tr:hover {
          background: #f9fafb;
        }

        .edit-input, .edit-select {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #3b82f6;
          border-radius: 4px;
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
        }

        .btn-edit, .btn-delete, .btn-save, .btn-cancel {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-save {
          background: #d1fae5;
          color: #065f46;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-edit:active, .btn-delete:active, .btn-save:active, .btn-cancel:active {
          transform: scale(0.95);
        }

        .confirm-modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 320px;
          margin: auto;
        }

        .confirm-modal h3 {
          margin: 0 0 12px 0;
          color: #1f2937;
        }

        .confirm-modal p {
          margin: 0 0 20px 0;
          color: #6b7280;
        }

        .confirm-actions {
          display: flex;
          gap: 12px;
        }

        .confirm-actions button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .confirm-actions .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .confirm-actions .btn-delete {
          background: #ef4444;
          color: white;
        }

        .empty-transactions {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
        }

        .empty-transactions div {
          font-size: 48px;
          margin-bottom: 12px;
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
