import React, { useState, useEffect, useCallback } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, getDefaultEnvelopes } from '../utils/localStorage';
import './EnvelopeBudget.css';

const EnvelopeBudget = () => {
  // Generate budget period (25th to 24th)
  // Generate list of budget periods (last 6 months + next 6 months)
  const generatePeriodOptions = () => {
    const periods = [];
    const today = new Date();
    
    for (let i = -6; i <= 6; i++) {
      const startDate = new Date(today.getFullYear(), today.getMonth() + i, 25);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      
      const endDate = new Date(startYear, startMonth, 24); // Next month, 24th
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      
      const periodKey = `${startYear}-${String(startMonth).padStart(2, '0')}-25_to_${endYear}-${String(endMonth).padStart(2, '0')}-24`;
      const periodLabel = `${startYear}/${String(startMonth).padStart(2, '0')}/25 to ${endYear}/${String(endMonth).padStart(2, '0')}/24`;
      
      periods.push({ key: periodKey, label: periodLabel });
    }
    
    return periods;
  };

  const getCurrentBudgetPeriod = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    if (currentDay >= 25) {
      // Current period: 25th of this month to 24th of next month
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-25_to_${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-24`;
    } else {
      // Current period: 25th of last month to 24th of this month
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return `${lastYear}-${String(lastMonth + 1).padStart(2, '0')}-25_to_${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-24`;
    }
  };

  const [currentPeriod, setCurrentPeriod] = useState(getCurrentBudgetPeriod());
  const [monthlyData, setMonthlyData] = useState({});
  const [newTransaction, setNewTransaction] = useState({ envelope: '', amount: '', description: '' });
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ type: '', id: '', name: '' });
  const [activeView, setActiveView] = useState('daily'); // 'daily', 'spending', 'budget'

  // Get current period's data
  const getCurrentPeriodData = () => {
    return monthlyData[currentPeriod] || {
      income: 0,
      envelopes: getDefaultEnvelopes(),
      transactions: [],
      blockedTransactions: []
    };
  };

  const currentData = getCurrentPeriodData();
  const { income, envelopes, transactions, blockedTransactions } = currentData;

  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData && savedData.monthlyData) {
      setMonthlyData(savedData.monthlyData);
      setCurrentPeriod(savedData.currentPeriod || getCurrentBudgetPeriod());
    }
  }, []);

  const saveData = useCallback(() => {
    saveToLocalStorage({
      monthlyData,
      currentPeriod
    });
  }, [monthlyData, currentPeriod]);

  useEffect(() => {
    saveData();
  }, [saveData]);

  const updatePeriodData = (updates) => {
    setMonthlyData(prev => ({
      ...prev,
      [currentPeriod]: {
        ...getCurrentPeriodData(),
        ...updates
      }
    }));
  };

  const setIncome = (value) => {
    updatePeriodData({ income: value });
  };

  const setEnvelopes = (value) => {
    updatePeriodData({ envelopes: typeof value === 'function' ? value(envelopes) : value });
  };

  const setTransactions = (value) => {
    updatePeriodData({ transactions: typeof value === 'function' ? value(transactions) : value });
  };

  const setBlockedTransactions = (value) => {
    updatePeriodData({ blockedTransactions: typeof value === 'function' ? value(blockedTransactions) : value });
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  const getStatus = (envelope) => {
    const available = envelope.budgeted + envelope.rollover - envelope.spent;
    if (available <= 0) return 'blocked';
    if (available < envelope.budgeted * 0.2) return 'warning';
    return 'healthy';
  };

  const addTransaction = () => {
    const { envelope, amount, description } = newTransaction;
    
    if (!amount || parseFloat(amount) <= 0) {
      showNotification('error', 'Enter valid amount');
      return;
    }
    
    if (!envelope) {
      showNotification('error', 'Select envelope');
      return;
    }

    const [category, name] = envelope.split('.');
    const env = envelopes[category]?.[name];
    
    if (!env) {
      showNotification('error', 'Invalid envelope');
      return;
    }
    
    const available = env.budgeted + env.rollover - env.spent;
    const expenseAmount = parseFloat(amount);

    if (available < expenseAmount) {
      showNotification('error', 'Insufficient funds!');
      return;
    }

    const updatedEnvelopes = {
      ...envelopes,
      [category]: {
        ...envelopes[category],
        [name]: {
          ...envelopes[category][name],
          spent: envelopes[category][name].spent + expenseAmount
        }
      }
    };
    
    const transactionRecord = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString().split('T')[0],
      envelope,
      amount: expenseAmount,
      description: description || 'Quick expense'
    };
    
    updatePeriodData({
      envelopes: updatedEnvelopes,
      transactions: [...transactions, transactionRecord]
    });

    setNewTransaction({ 
      envelope: newTransaction.envelope, 
      amount: '', 
      description: '' 
    });
    
    showNotification('success', '✓ Added!');
  };

  const allocateBudget = (category, name, amount) => {
    const updatedEnvelopes = {
      ...envelopes,
      [category]: {
        ...envelopes[category],
        [name]: {
          ...envelopes[category][name],
          budgeted: parseFloat(amount) || 0
        }
      }
    };
    updatePeriodData({ envelopes: updatedEnvelopes });
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showNotification('success', 'Transaction deleted');
  };

  const deleteEnvelope = (category, name) => {
    setEnvelopes(prev => {
      const updated = { ...prev };
      delete updated[category][name];
      return updated;
    });
    setTransactions(prev => prev.filter(t => t.envelope !== `${category}.${name}`));
    showNotification('success', 'Envelope deleted');
  };

  const confirmDelete = () => {
    if (deleteConfirm.type === 'transaction') {
      deleteTransaction(deleteConfirm.id);
    } else if (deleteConfirm.type === 'envelope') {
      const [category, name] = deleteConfirm.id.split('.');
      deleteEnvelope(category, name);
    }
    setDeleteConfirm({ type: '', id: '', name: '' });
  };

  const getNextBudgetPeriod = (currentPeriodStr) => {
    // Extract start date from current period
    const startDateStr = currentPeriodStr.split('_to_')[0];
    const [year, month, day] = startDateStr.split('-').map(Number);
    
    // Calculate next period start (add 1 month)
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    
    // Calculate next period end (add 1 month to end date)
    const endMonth = nextMonth === 12 ? 1 : nextMonth + 1;
    const endYear = nextMonth === 12 ? nextYear + 1 : nextYear;
    
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-25_to_${endYear}-${String(endMonth).padStart(2, '0')}-24`;
  };
  const rolloverToNextPeriod = () => {
    // Calculate next period
    const nextPeriod = getNextBudgetPeriod(currentPeriod);
    
    // Rollover unused funds to next period
    const rolledOverEnvelopes = { ...envelopes };
    Object.keys(rolledOverEnvelopes).forEach(category => {
      Object.keys(rolledOverEnvelopes[category]).forEach(name => {
        const env = rolledOverEnvelopes[category][name];
        const unused = env.budgeted + env.rollover - env.spent;
        rolledOverEnvelopes[category][name] = {
          budgeted: 0,
          spent: 0,
          rollover: Math.max(0, unused)
        };
      });
    });
    
    // Set data for next period
    setMonthlyData(prev => ({
      ...prev,
      [nextPeriod]: {
        income: 0,
        envelopes: rolledOverEnvelopes,
        transactions: [],
        blockedTransactions: []
      }
    }));
    
    // Switch to next period
    setCurrentPeriod(nextPeriod);
    showNotification('success', 'Started next period with rollover balances');
  };

  const exportData = () => {
    const data = { monthlyData, currentPeriod };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-${currentPeriod}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Data exported successfully');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setMonthlyData(data.monthlyData || {});
        setCurrentPeriod(data.currentPeriod || getCurrentBudgetPeriod());
        showNotification('success', 'Data imported successfully');
      } catch (error) {
        showNotification('error', 'Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getInsights = () => {
    const healthy = [];
    const blocked = [];
    const warnings = [];

    Object.keys(envelopes).forEach(category => {
      Object.keys(envelopes[category]).forEach(name => {
        const env = envelopes[category][name];
        const status = getStatus(env);
        if (status === 'healthy') healthy.push(name);
        else if (status === 'blocked') blocked.push(name);
        else warnings.push(name);
      });
    });

    return { healthy, blocked, warnings };
  };

  const insights = getInsights();
  const totalBudgeted = Object.values(envelopes).reduce((sum, category) => 
    sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0);
  const totalSpent = Object.values(envelopes).reduce((sum, category) => 
    sum + Object.values(category).reduce((catSum, env) => catSum + env.spent, 0), 0);

  return (
    <div className="envelope-budget">
      <div className="header">
        <h1>💰 Envelope Budget Tracker</h1>
        <div className="header-controls">
          <div className="control-group">
            <label>Budget Period (25th to 24th)</label>
            <select 
              value={currentPeriod}
              onChange={(e) => setCurrentPeriod(e.target.value)}
              className="period-selector"
            >
              {generatePeriodOptions().map(period => (
                <option key={period.key} value={period.key}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeView === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveView('daily')}
        >
          ⚡ Daily
        </button>
        <button 
          className={`tab-btn ${activeView === 'spending' ? 'active' : ''}`}
          onClick={() => setActiveView('spending')}
        >
          💳 Spending
        </button>
        <button 
          className={`tab-btn ${activeView === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveView('budget')}
        >
          📊 Budget
        </button>
      </div>

      {notification.message && (
        <div className={notification.type}>
          {notification.message}
        </div>
      )}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-value">₹{income.toLocaleString()}</div>
          <div className="summary-label">Monthly Income</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">₹{totalBudgeted.toLocaleString()}</div>
          <div className="summary-label">Total Budgeted</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">₹{totalSpent.toLocaleString()}</div>
          <div className="summary-label">Total Spent</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">₹{(income - totalSpent).toLocaleString()}</div>
          <div className="summary-label">Remaining</div>
        </div>
      </div>

      {/* Conditional Views */}
      {activeView === 'daily' ? (
        <>
          {/* Quick Expense Interface */}
          <div className="card">
            <div className="card-header">
              <h3>⚡ Quick Expense</h3>
            </div>
            <div className="card-content">
              <div className="quick-expense-form">
                <div className="quick-form-row">
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="₹ Amount" 
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="quick-amount"
                  />
                  <select 
                    value={newTransaction.envelope} 
                    onChange={(e) => setNewTransaction({...newTransaction, envelope: e.target.value})}
                    className="quick-envelope"
                  >
                    <option value="">Select Envelope</option>
                    {Object.keys(envelopes).map(category => 
                      Object.keys(envelopes[category]).map(name => (
                        <option key={`${category}.${name}`} value={`${category}.${name}`}>
                          {name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="quick-form-row">
                  <input 
                    type="text" 
                    placeholder="Description (optional)" 
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="quick-description"
                  />
                  <button className="btn btn-success quick-add-btn" onClick={addTransaction}>
                    ➕ Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Transactions */}
          <div className="card">
            <div className="card-header">
              <h3>📅 Today's Expenses</h3>
            </div>
            <div className="table-container">
              <table className="envelope-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Envelope</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).reverse().map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.description}</td>
                      <td style={{textTransform: 'capitalize'}}>
                        {transaction.envelope.replace('.', ' - ')}
                      </td>
                      <td>₹{transaction.amount.toLocaleString()}</td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => setDeleteConfirm({ 
                            type: 'transaction', 
                            id: transaction.id, 
                            name: transaction.description 
                          })}
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', color: 'var(--gray-600)'}}>No expenses today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeView === 'spending' ? (
        <>
          {/* Envelope Status */}
          <div className="card">
            <div className="card-header">
              <h3>📊 Envelope Status</h3>
            </div>
            <div className="table-container">
              <table className="envelope-table">
                <thead>
                  <tr>
                    <th>Envelope</th>
                    <th>Category</th>
                    <th>Budgeted</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>Rollover</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(envelopes).map(category => 
                    Object.keys(envelopes[category]).map(name => {
                      const env = envelopes[category][name];
                      const remaining = env.budgeted + env.rollover - env.spent;
                      const status = getStatus(env);
                      return (
                        <tr key={`${category}.${name}`}>
                          <td style={{textTransform: 'capitalize'}}>{name}</td>
                          <td style={{textTransform: 'capitalize'}}>{category}</td>
                          <td>₹{env.budgeted.toLocaleString()}</td>
                          <td>₹{env.spent.toLocaleString()}</td>
                          <td>₹{remaining.toLocaleString()}</td>
                          <td>₹{env.rollover.toLocaleString()}</td>
                          <td>
                            <span className={`status ${status}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h3>📝 Recent Transactions</h3>
            </div>
            <div className="table-container">
              <table className="envelope-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Envelope</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(-10).reverse().map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td>{transaction.description}</td>
                      <td style={{textTransform: 'capitalize'}}>
                        {transaction.envelope.replace('.', ' - ')}
                      </td>
                      <td>₹{transaction.amount.toLocaleString()}</td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => setDeleteConfirm({ 
                            type: 'transaction', 
                            id: transaction.id, 
                            name: transaction.description 
                          })}
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{textAlign: 'center', color: 'var(--gray-600)'}}>No transactions yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Budget Controls */}
          <div className="card">
            <div className="card-header">
              <h3>💼 Budget Controls</h3>
            </div>
            <div className="card-content">
              <div className="control-group">
                <label>Monthly Income</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={income} 
                  onChange={(e) => setIncome(parseFloat(e.target.value) || 0)} 
                  placeholder="0.00"
                />
              </div>
              <div className="budget-actions">
                <button className="btn btn-primary" onClick={rolloverToNextPeriod}>
                  🔄 Start Next Period
                </button>
                <button className="btn btn-secondary" onClick={exportData}>
                  📤 Export
                </button>
                <label className="btn btn-secondary">
                  📥 Import
                  <input type="file" accept=".json" onChange={importData} style={{display: 'none'}} />
                </label>
              </div>
            </div>
          </div>

          {/* Budget Allocation */}
          <div className="card">
            <div className="card-header">
              <h3>💼 Budget Allocation</h3>
            </div>
            <div className="card-content">
              <div className="budget-grid">
                {Object.keys(envelopes).map(category => (
                  <div key={category} className="category-card">
                    <div className="category-title">
                      {category === 'needs' ? '🏠 Needs' : 
                       category === 'savings' ? '💰 Savings' : '🎯 Wants'}
                    </div>
                    {Object.keys(envelopes[category]).map(name => (
                      <div key={name} className="envelope-input">
                        <label>{name}:</label>
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={envelopes[category][name].budgeted}
                          onChange={(e) => allocateBudget(category, name, e.target.value)}
                          placeholder="0.00"
                        />
                        <button 
                          className="btn-delete"
                          onClick={() => setDeleteConfirm({ type: 'envelope', id: `${category}.${name}`, name })}
                          title="Delete envelope"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Insights */}
          <div className="card">
            <div className="card-header">
              <h3>📈 Monthly Insights</h3>
            </div>
            <div className="card-content">
              <div className="insights-grid">
                <div className="insight-item healthy">
                  <div className="insight-label">✅ Healthy Envelopes</div>
                  <div className="insight-value">
                    {insights.healthy.length > 0 ? insights.healthy.join(', ') : 'None'}
                  </div>
                </div>
                <div className="insight-item warning">
                  <div className="insight-label">⚠️ Warning Envelopes</div>
                  <div className="insight-value">
                    {insights.warnings.length > 0 ? insights.warnings.join(', ') : 'None'}
                  </div>
                </div>
                <div className="insight-item blocked">
                  <div className="insight-label">🚫 Blocked Envelopes</div>
                  <div className="insight-value">
                    {insights.blocked.length > 0 ? insights.blocked.join(', ') : 'None'}
                  </div>
                </div>
                <div className="insight-item blocked">
                  <div className="insight-label">❌ Blocked Transactions</div>
                  <div className="insight-value">{blockedTransactions.length} transactions</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {deleteConfirm.type && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {deleteConfirm.type} "{deleteConfirm.name}"?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm({ type: '', id: '', name: '' })}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvelopeBudget;