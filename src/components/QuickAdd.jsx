import React, { useState, useEffect, useMemo } from 'react';
import './QuickAdd.css';

const QuickAdd = ({ 
  envelopes, 
  customPaymentMethods, 
  dateRange, 
  onAddTransaction, 
  onShowNotification,
  transactions = [],
  monthlyData,
  currentPeriod,
  onAddIncome,
  onAddCustomPaymentMethod,
  onDeleteTransaction,
  onTransfer,
  onAddEnvelope,
  onAllocateBudget,
  onIncrementBudget,
  onDeleteEnvelope,
  onCopyFromLastMonth,
  onSaveBulkEdit,
  income
}) => {
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    paymentMethod: customPaymentMethods[0] || 'HDFC'
  });
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    description: '',
    paymentMethod: customPaymentMethods[0] || ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newEnvelope, setNewEnvelope] = useState({ category: '', name: '' });
  const [budgetInputs, setBudgetInputs] = useState({});
  const [incrementInputs, setIncrementInputs] = useState({});
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState({});

  useEffect(() => {
    if (customPaymentMethods.length > 0 && !incomeForm.paymentMethod) {
      setIncomeForm(prev => ({ ...prev, paymentMethod: customPaymentMethods[0] }));
    }
  }, [customPaymentMethods, incomeForm.paymentMethod]);

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
      paymentMethod: customPaymentMethods[0] || 'HDFC'
    });
  };

  const handleAddExpense = () => {
    if (!selectedEnvelope) return;
    
    const amount = parseFloat(expenseForm.amount);
    if (!amount || amount <= 0) {
      onShowNotification('error', 'Enter valid amount');
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
      date: new Date().toISOString().split('T')[0]
    };

    onAddTransaction(transaction);
    setSelectedEnvelope(null);
    setExpenseForm({
      amount: '',
      description: '',
      paymentMethod: customPaymentMethods[0] || 'HDFC'
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

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.envelope.split('.')[1] || t.envelope));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    
    if (searchTerm) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.envelope.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(t => 
        (t.envelope.split('.')[1] || t.envelope).toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    result = [...result].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const comparison = new Date(b.date) - new Date(a.date);
        return sortConfig.direction === 'asc' ? -comparison : comparison;
      }
      if (sortConfig.key === 'amount') {
        const comparison = b.amount - a.amount;
        return sortConfig.direction === 'asc' ? -comparison : comparison;
      }
      if (sortConfig.key === 'description') {
        const comparison = a.description.localeCompare(b.description);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      if (sortConfig.key === 'type') {
        const aType = a.type || 'expense';
        const bType = b.type || 'expense';
        const comparison = aType.localeCompare(bType);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      if (sortConfig.key === 'envelope') {
        const aEnv = a.envelope === 'INCOME' ? 'INCOME' : a.envelope === 'TRANSFER' ? 'TRANSFER' : a.envelope.replace('.', ' - ');
        const bEnv = b.envelope === 'INCOME' ? 'INCOME' : b.envelope === 'TRANSFER' ? 'TRANSFER' : b.envelope.replace('.', ' - ');
        const comparison = aEnv.localeCompare(bEnv);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      if (sortConfig.key === 'paymentMethod') {
        const comparison = (a.paymentMethod || '').localeCompare(b.paymentMethod || '');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
    
    return result;
  }, [transactions, searchTerm, categoryFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const SortIcon = ({ column }) => {
    return <span>{getSortIcon(column)}</span>;
  };

  return (
    <div className="quick-add-container">
      {/* Add Income Section */}
      <div className="income-section">
        <h3 className="section-title">💰 Add Monthly Income</h3>
        <div className="income-form-grid">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="₹ Amount"
            value={incomeForm.amount}
            onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
            className="income-input-field"
          />
          <input
            type="text"
            placeholder="Description"
            value={incomeForm.description}
            onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
            className="income-input-field"
          />
          <select
            value={incomeForm.paymentMethod}
            onChange={(e) => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}
            className="income-input-field"
          >
            {!incomeForm.paymentMethod && <option value="">Select Payment Method</option>}
            {customPaymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <button
            className="btn-add-income"
            onClick={() => {
              if (!incomeForm.amount || parseFloat(incomeForm.amount) <= 0) {
                onShowNotification('error', 'Enter valid amount');
                return;
              }
              if (!incomeForm.paymentMethod) {
                onShowNotification('error', 'Select payment method');
                return;
              }
              onAddIncome({
                amount: parseFloat(incomeForm.amount),
                description: incomeForm.description || 'Monthly Income',
                paymentMethod: incomeForm.paymentMethod
              });
              setIncomeForm({ amount: '', description: '', paymentMethod: customPaymentMethods[0] || '' });
            }}
          >
            ➕ Add Income
          </button>
          <button
            className="btn-transfer"
            onClick={onTransfer}
            title="Transfer between payment methods"
          >
            🔄 Transfer
          </button>
        </div>
      </div>

      {/* Budget Allocation Section */}
      <div className="budget-allocation-section">
        <div className="budget-header">
          <h3 className="section-title">💼 Budget Allocation</h3>
          <div className="budget-actions">
            <button className="btn-secondary" onClick={onCopyFromLastMonth}>📋 Copy</button>
            <button className={bulkEditMode ? 'btn-warning' : 'btn-secondary'} onClick={() => {
              if (bulkEditMode) { setBulkEditValues({}); setBulkEditMode(false); }
              else { const v = {}; Object.keys(envelopes).forEach(c => Object.keys(envelopes[c]).forEach(n => v[`${c}.${n}`] = envelopes[c][n].budgeted)); setBulkEditValues(v); setBulkEditMode(true); }
            }}>{bulkEditMode ? '✖ Cancel' : '✏️ Bulk'}</button>
            {bulkEditMode && <button className="btn-add-income" onClick={() => {
              let t = 0; Object.keys(bulkEditValues).forEach(k => t += parseFloat(bulkEditValues[k]) || 0);
              if (t > income) { onShowNotification('error', `Total (₹${t.toLocaleString()}) exceeds income (₹${income.toLocaleString()})`); return; }
              onSaveBulkEdit(bulkEditValues); setBulkEditMode(false); setBulkEditValues({});
            }}>💾 Save</button>}
          </div>
        </div>
        
        {/* Add New Envelope */}
        <div className="add-envelope-form">
          <div className="envelope-form-row">
            <select
              value={newEnvelope.category}
              onChange={(e) => setNewEnvelope({...newEnvelope, category: e.target.value})}
              className="envelope-select"
            >
              <option value="">Select Category</option>
              <option value="needs">🏠 Needs</option>
              <option value="savings">💰 Savings</option>
              <option value="wants">🎯 Wants</option>
            </select>
            <input
              type="text"
              placeholder="Envelope name"
              value={newEnvelope.name}
              onChange={(e) => setNewEnvelope({...newEnvelope, name: e.target.value})}
              className="envelope-input-field"
            />
            <button 
              className="btn-add-income" 
              onClick={() => {
                if (!newEnvelope.category || !newEnvelope.name) {
                  onShowNotification('error', 'Select category and enter name');
                  return;
                }
                onAddEnvelope();
                setNewEnvelope({ category: '', name: '' });
              }}
            >
              ➕ Add Envelope
            </button>
          </div>
        </div>

        {/* Budget Grid */}
        <div className="budget-grid">
          {Object.keys(envelopes).map(category => (
            <div key={category} className="category-section">
              <h3 className="category-title">
                {category === 'needs' ? '🏠 Needs' :
                 category === 'savings' ? '💰 Savings' : '🎯 Wants'}
              </h3>
              {Object.keys(envelopes[category]).map(name => (
                <div key={name} className="envelope-budget-item">
                  <div className="envelope-header">
                    <label>{name.toUpperCase()}: ₹{envelopes[category][name].budgeted.toLocaleString()}</label>
                    {!bulkEditMode && <button className="btn-delete" onClick={() => onDeleteEnvelope(category, name)}>🗑️</button>}
                  </div>
                  {bulkEditMode ? (
                    <input type="number" step="0.01" min="0" value={bulkEditValues[`${category}.${name}`] ?? 0}
                      onChange={(e) => setBulkEditValues(p => ({...p, [`${category}.${name}`]: e.target.value}))}
                      placeholder="Set budget" className="budget-input" />
                  ) : (
                    <>
                      <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetInputs[`${category}.${name}`] ?? envelopes[category][name].budgeted}
                    onChange={(e) => {
                      setBudgetInputs(prev => ({
                        ...prev,
                        [`${category}.${name}`]: e.target.value
                      }));
                    }}
                    onBlur={(e) => {
                      onAllocateBudget(category, name, e.target.value);
                      setBudgetInputs(prev => {
                        const updated = { ...prev };
                        delete updated[`${category}.${name}`];
                        return updated;
                      });
                    }}
                    placeholder="Set budget"
                    className="budget-input"
                  />
                  <div className="increment-row">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={incrementInputs[`${category}.${name}`] || ''}
                      onChange={(e) => {
                        setIncrementInputs(prev => ({
                          ...prev,
                          [`${category}.${name}`]: e.target.value
                        }));
                      }}
                      placeholder="+ Amount"
                      className="increment-input"
                    />
                    <button
                      className="btn-add-income"
                      onClick={() => {
                        const incrementAmount = incrementInputs[`${category}.${name}`];
                        if (incrementAmount) {
                          onIncrementBudget(category, name, incrementAmount);
                          setIncrementInputs(prev => {
                            const updated = { ...prev };
                            delete updated[`${category}.${name}`];
                            return updated;
                          });
                        }
                      }}
                    >
                      + Add
                    </button>
                  </div>
                  </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

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

      {/* Current Month Summary */}
      <div className="month-summary">
        <div className="summary-item income">
          <span className="summary-icon">💰</span>
          <div className="summary-details">
            <span className="summary-label">Income</span>
            <span className="summary-count">
              {transactions.filter(t => t.type === 'income').length} | ₹{transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="summary-item expense">
          <span className="summary-icon">💸</span>
          <div className="summary-details">
            <span className="summary-label">Expenses</span>
            <span className="summary-count">
              {transactions.filter(t => !t.type || t.type === 'expense').length} | ₹{transactions.filter(t => !t.type || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="summary-item transfer">
          <span className="summary-icon">🔄</span>
          <div className="summary-details">
            <span className="summary-label">Transfers</span>
            <span className="summary-count">
              {transactions.filter(t => t.type && t.type.includes('transfer')).length / 2} | ₹{(transactions.filter(t => t.type === 'transfer-out').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transaction Details - Matching Transaction Tab */}
      <div className="transactions-section">
        <h3 className="section-title">📋 Recent Transaction Details</h3>
        
        <div className="transactions-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="table-container">
          <table className="envelope-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('date')} style={{cursor: 'pointer'}}>
                  Date <SortIcon column="date" />
                </th>
                <th onClick={() => handleSort('type')} style={{cursor: 'pointer'}}>
                  Type <SortIcon column="type" />
                </th>
                <th onClick={() => handleSort('description')} style={{cursor: 'pointer'}}>
                  Description <SortIcon column="description" />
                </th>
                <th onClick={() => handleSort('envelope')} style={{cursor: 'pointer'}}>
                  Envelope <SortIcon column="envelope" />
                </th>
                <th onClick={() => handleSort('amount')} style={{cursor: 'pointer'}}>
                  Amount <SortIcon column="amount" />
                </th>
                <th onClick={() => handleSort('paymentMethod')} style={{cursor: 'pointer'}}>
                  Payment <SortIcon column="paymentMethod" />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => {
                const transactionType = transaction.type === 'income' ? '💰' : 
                                      transaction.type === 'transfer-in' ? '⬅️' :
                                      transaction.type === 'transfer-out' ? '➡️' : '💸';
                const typeLabel = transaction.type === 'income' ? 'Income' : 
                                transaction.type === 'transfer-in' ? 'Transfer In' :
                                transaction.type === 'transfer-out' ? 'Transfer Out' : 'Expense';
                return (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transactionType} {typeLabel}</td>
                    <td>{transaction.description}</td>
                    <td style={{textTransform: 'uppercase'}}>
                      {transaction.envelope === 'INCOME' ? 'INCOME' :
                       transaction.envelope === 'TRANSFER' ? 'TRANSFER' :
                       transaction.envelope.replace('.', ' - ')}
                    </td>
                    <td style={{
                      color: transaction.type === 'income' || transaction.type === 'transfer-in' ? 'var(--success)' : 'var(--danger)',
                      fontWeight: '600'
                    }}>
                      {transaction.type === 'income' || transaction.type === 'transfer-in' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </td>
                    <td>{transaction.paymentMethod || 'Unknown'}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => onDeleteTransaction(transaction.id)}
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', color: 'var(--gray-600)'}}>No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                <label>Payment Method</label>
                <div className="payment-grid">
                  {customPaymentMethods.map(method => (
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
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setSelectedEnvelope(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-add" 
                onClick={handleAddExpense}
                disabled={!expenseForm.amount || parseFloat(expenseForm.amount) <= 0}
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
