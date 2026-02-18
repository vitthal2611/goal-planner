import React, { useState } from 'react';
import './BudgetWorkflowDashboard.css';

const BudgetWorkflowDashboard = ({ 
  income, 
  envelopes, 
  onAddIncome, 
  onAllocateBudget, 
  onAddExpense,
  customPaymentMethods,
  dateRange,
  onAddPaymentMethod,
  transactions,
  monthlyData,
  currentPeriod
}) => {
  const [incomeForm, setIncomeForm] = useState({ amount: '', description: '', paymentMethod: '', date: new Date().toISOString().split('T')[0], type: 'income' });
  const [expenseForm, setExpenseForm] = useState({ envelope: '', amount: '', description: '', paymentMethod: '', date: new Date().toISOString().split('T')[0] });
  const [budgetInputs, setBudgetInputs] = useState({});
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [sortBy, setSortBy] = useState('percentage');

  const loanTransactions = (transactions || []).filter(t => t.type === 'loan');
  const totalBorrowed = loanTransactions.reduce((sum, t) => sum + t.amount, 0);

  const actualIncome = monthlyData && currentPeriod && monthlyData[currentPeriod]?.transactions 
    ? monthlyData[currentPeriod].transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    : 0;

  const totalBudgeted = Object.values(envelopes).reduce((sum, cat) =>
    sum + Object.values(cat).reduce((s, env) => s + env.budgeted, 0), 0);
  
  const totalSpent = (transactions || []).filter(t => !t.type || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const remaining = totalBudgeted - totalSpent;
  const spentPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const savings = actualIncome - totalSpent;
  
  const unallocated = actualIncome - totalBudgeted;
  const isBudgetComplete = actualIncome > 0 && unallocated === 0;
  const canAddExpense = isBudgetComplete;

  const handleAddIncome = () => {
    if (!incomeForm.amount || parseFloat(incomeForm.amount) <= 0) return;
    onAddIncome({
      amount: parseFloat(incomeForm.amount),
      description: incomeForm.description || (incomeForm.type === 'loan' ? 'Borrowed Amount' : 'Monthly Income'),
      paymentMethod: incomeForm.paymentMethod,
      date: incomeForm.date,
      type: incomeForm.type
    });
    setIncomeForm({ amount: '', description: '', paymentMethod: '', date: new Date().toISOString().split('T')[0], type: 'income' });
  };

  const handleAllocateBudget = (category, name) => {
    const amount = parseFloat(budgetInputs[`${category}.${name}`]) || 0;
    if (amount <= 0) return;
    
    const currentBudget = envelopes[category][name].budgeted;
    const newTotal = totalBudgeted - currentBudget + amount;
    
    if (newTotal > actualIncome) {
      alert(`Cannot allocate ₹${amount.toLocaleString()}. Only ₹${(actualIncome - totalBudgeted + currentBudget).toLocaleString()} available`);
      return;
    }
    
    onAllocateBudget(category, name, amount);
    setBudgetInputs(prev => {
      const updated = { ...prev };
      delete updated[`${category}.${name}`];
      return updated;
    });
  };

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.trim()) return;
    if (onAddPaymentMethod) {
      onAddPaymentMethod(newPaymentMethod.trim());
    }
    setExpenseForm({...expenseForm, paymentMethod: newPaymentMethod.trim()});
    setNewPaymentMethod('');
  };

  const handleAddExpense = () => {
    if (!canAddExpense) return;
    if (!expenseForm.envelope || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return;
    
    onAddExpense({
      envelope: expenseForm.envelope,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description || 'Expense',
      paymentMethod: expenseForm.paymentMethod,
      date: expenseForm.date
    });
    setExpenseForm({ envelope: '', amount: '', description: '', paymentMethod: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="workflow-dashboard">
      {/* Monthly Breakdown Table */}
      {monthlyData && (
        <div className="workflow-step active">
          <div className="step-header">
            <h3>📊 Monthly Breakdown</h3>
          </div>
          <div className="step-content">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Month</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Income</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Expense</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Transfer In</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Transfer Out</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(monthlyData).sort().map(period => {
                    const data = monthlyData[period];
                    const txns = data?.transactions || [];
                    
                    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                    const expense = txns.filter(t => !t.type || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                    const transferIn = txns.filter(t => t.type === 'transfer-in').reduce((sum, t) => sum + t.amount, 0);
                    const transferOut = txns.filter(t => t.type === 'transfer-out').reduce((sum, t) => sum + t.amount, 0);
                    const net = income + transferIn - expense - transferOut;
                    
                    return (
                      <tr key={period} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{period}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>₹{income.toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#ef4444' }}>₹{expense.toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#3b82f6' }}>₹{transferIn.toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#f59e0b' }}>₹{transferOut.toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: net >= 0 ? '#10b981' : '#ef4444' }}>₹{net.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Income Section */}
      {monthlyData && currentPeriod && monthlyData[currentPeriod]?.transactions?.filter(t => t.type === 'income').length > 0 && (
        <div className="workflow-step active">
          <div className="step-header">
            <h3>💰 Monthly Income - {currentPeriod}</h3>
          </div>
          <div className="step-content">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData[currentPeriod].transactions.filter(t => t.type === 'income').sort((a, b) => b.date.localeCompare(a.date)).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{t.date}</td>
                      <td style={{ padding: '12px' }}>{t.description}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>+₹{t.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{t.paymentMethod}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f3f4f6', borderTop: '2px solid #e5e7eb' }}>
                    <td colSpan="2" style={{ padding: '12px', fontWeight: '600' }}>Total Income</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: '700', fontSize: '16px' }}>
                      ₹{monthlyData[currentPeriod].transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Loans Section */}
      {monthlyData && currentPeriod && monthlyData[currentPeriod]?.transactions?.filter(t => t.type === 'loan').length > 0 && (
        <div className="workflow-step active">
          <div className="step-header">
            <h3>🤝 Loans/Borrowed - {currentPeriod}</h3>
          </div>
          <div className="step-content">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData[currentPeriod].transactions.filter(t => t.type === 'loan').sort((a, b) => b.date.localeCompare(a.date)).map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{t.date}</td>
                      <td style={{ padding: '12px' }}>{t.description}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#f59e0b', fontWeight: '600' }}>+₹{t.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{t.paymentMethod}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f3f4f6', borderTop: '2px solid #e5e7eb' }}>
                    <td colSpan="2" style={{ padding: '12px', fontWeight: '600' }}>Total Borrowed</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#f59e0b', fontWeight: '700', fontSize: '16px' }}>
                      ₹{monthlyData[currentPeriod].transactions.filter(t => t.type === 'loan').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Add Income */}
      <div className={`workflow-step ${actualIncome > 0 ? 'completed' : 'active'}`}>
        <div className="step-header">
          <span className="step-number">1</span>
          <h3>Add Monthly Income</h3>
          {actualIncome > 0 && <span className="step-badge">✓ ₹{actualIncome.toLocaleString()}</span>}
        </div>
        
        <div className="step-content">
          <div className="income-type-tabs">
            <button 
              className={`type-tab ${incomeForm.type !== 'loan' ? 'active' : ''}`}
              onClick={() => setIncomeForm({...incomeForm, type: 'income'})}
            >
              💰 Income
            </button>
            <button 
              className={`type-tab ${incomeForm.type === 'loan' ? 'active' : ''}`}
              onClick={() => setIncomeForm({...incomeForm, type: 'loan'})}
            >
              🤝 Loan/Borrow
            </button>
          </div>
          <div className="form-row">
            <input
              type="number"
              placeholder="₹ Amount"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
              className="form-input"
            />
            <input
              type="date"
              value={incomeForm.date}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder={incomeForm.type === 'loan' ? 'Borrowed from (e.g., John)' : 'Description (optional)'}
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
              className="form-input"
            />
            <select
              value={incomeForm.paymentMethod}
              onChange={(e) => setIncomeForm({...incomeForm, paymentMethod: e.target.value})}
              className="form-input"
            >
              <option value="">Payment Method</option>
              {customPaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button onClick={handleAddIncome} className="btn-primary">
            {actualIncome > 0 ? `+ Add More ${incomeForm.type === 'loan' ? 'Loan' : 'Income'}` : `Add ${incomeForm.type === 'loan' ? 'Loan' : 'Income'}`}
          </button>
        </div>
      </div>

      {/* Step 2: Allocate Budget */}
      <div className={`workflow-step ${actualIncome === 0 ? 'disabled' : isBudgetComplete ? 'completed' : 'active'}`}>
        <div className="step-header">
          <span className="step-number">2</span>
          <h3>Allocate Budget to Envelopes</h3>
          {isBudgetComplete && <span className="step-badge">✓ Complete</span>}
        </div>
        
        {actualIncome > 0 && (
          <>
            <div className="budget-status">
              <div className="status-item">
                <span className="label">Income</span>
                <span className="value">₹{actualIncome.toLocaleString()}</span>
              </div>
              <div className="status-item">
                <span className="label">Budgeted</span>
                <span className="value">₹{totalBudgeted.toLocaleString()}</span>
              </div>
              <div className="status-item">
                <span className="label">Remaining</span>
                <span className={`value ${unallocated === 0 ? 'success' : 'warning'}`}>
                  ₹{unallocated.toLocaleString()}
                </span>
              </div>
            </div>

            {unallocated !== 0 && (
              <div className={`allocation-alert ${unallocated > 0 ? 'warning' : 'error'}`}>
                {unallocated > 0 
                  ? `⚠️ Allocate remaining ₹${unallocated.toLocaleString()} to envelopes`
                  : `❌ Over-allocated by ₹${Math.abs(unallocated).toLocaleString()}`}
              </div>
            )}

            <div className="step-content">
              <div className="envelope-grid">
                {Object.keys(envelopes).map(category => (
                  <div key={category} className="category-section">
                    <h4 className="category-title">
                      {category === 'needs' ? '🏠 Needs' : category === 'wants' ? '🎯 Wants' : '💰 Savings'}
                    </h4>
                    {Object.keys(envelopes[category]).map(name => (
                      <div key={name} className="envelope-item">
                        <div className="envelope-info">
                          <span className="envelope-name">{name}</span>
                          <span className="envelope-budget">₹{envelopes[category][name].budgeted.toLocaleString()}</span>
                        </div>
                        <div className="envelope-input-row">
                          <input
                            type="number"
                            placeholder="₹ Amount"
                            value={budgetInputs[`${category}.${name}`] || ''}
                            onChange={(e) => setBudgetInputs({...budgetInputs, [`${category}.${name}`]: e.target.value})}
                            className="budget-input"
                          />
                          <button 
                            onClick={() => handleAllocateBudget(category, name)}
                            className="btn-allocate"
                          >
                            Set
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Step 3: Add Expenses */}
      <div className={`workflow-step ${!canAddExpense ? 'disabled' : 'active'}`}>
        <div className="step-header">
          <span className="step-number">3</span>
          <h3>Add Expenses</h3>
          {!canAddExpense && <span className="step-badge locked">🔒 Complete budget first</span>}
        </div>
        
        {canAddExpense && (
          <div className="step-content">
            {customPaymentMethods.length === 0 ? (
              <div className="no-payment-alert">
                <div className="alert-message">
                  ⚠️ Add a payment method first to track expenses
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Payment method (e.g., HDFC Bank, Cash)"
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    className="form-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPaymentMethod()}
                  />
                  <button onClick={handleAddPaymentMethod} className="btn-primary">
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <>
            <div className="form-row">
              <select
                value={expenseForm.envelope}
                onChange={(e) => setExpenseForm({...expenseForm, envelope: e.target.value})}
                className="form-input"
              >
                <option value="">Select Envelope</option>
                {Object.keys(envelopes).map(cat =>
                  Object.keys(envelopes[cat]).map(name => (
                    <option key={`${cat}.${name}`} value={`${cat}.${name}`}>
                      {cat} - {name}
                    </option>
                  ))
                )}
              </select>
              <input
                type="number"
                placeholder="₹ Amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                className="form-input"
              />
              <input
                type="date"
                value={expenseForm.date}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
                className="form-input"
              >
                <option value="">Payment Method</option>
                {customPaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="__add_new__">+ Add New Payment Method</option>
              </select>
              <button onClick={handleAddExpense} className="btn-primary">Add Expense</button>
            </div>
            {expenseForm.paymentMethod === '__add_new__' && (
              <div className="form-row">
                <input
                  type="text"
                  placeholder="New payment method name"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="form-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPaymentMethod()}
                  autoFocus
                />
                <button onClick={handleAddPaymentMethod} className="btn-primary">
                  Add
                </button>
              </div>
            )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Budget vs Actual Insights */}
      {totalSpent > 0 && (
        <div className="insights-section">
          <h3 className="insights-title">📊 Budget Insights</h3>
          
          {totalBorrowed > 0 && (
            <div className="loan-alert">
              🤝 You have borrowed ₹{totalBorrowed.toLocaleString()} - Remember to repay!
            </div>
          )}
          
          <div className="insights-grid">
            <div className="insight-card primary">
              <div className="insight-icon">💰</div>
              <div className="insight-content">
                <div className="insight-label">Total Budget</div>
                <div className="insight-value">₹{totalBudgeted.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="insight-card danger">
              <div className="insight-icon">💸</div>
              <div className="insight-content">
                <div className="insight-label">Total Spent</div>
                <div className="insight-value">₹{totalSpent.toLocaleString()}</div>
                <div className="insight-percentage">{spentPercentage.toFixed(1)}% of budget</div>
              </div>
            </div>
            
            <div className={`insight-card ${remaining >= 0 ? 'success' : 'warning'}`}>
              <div className="insight-icon">{remaining >= 0 ? '✅' : '⚠️'}</div>
              <div className="insight-content">
                <div className="insight-label">Remaining</div>
                <div className="insight-value">₹{remaining.toLocaleString()}</div>
                <div className="insight-percentage">{remaining >= 0 ? 'Under budget' : 'Over budget'}</div>
              </div>
            </div>
            
            <div className={`insight-card ${savings >= 0 ? 'success' : 'danger'}`}>
              <div className="insight-icon">{savings >= 0 ? '🎯' : '📉'}</div>
              <div className="insight-content">
                <div className="insight-label">Net Savings</div>
                <div className="insight-value">₹{savings.toLocaleString()}</div>
                <div className="insight-percentage">{savings >= 0 ? 'On track' : 'Deficit'}</div>
              </div>
            </div>
          </div>

          <div className="spending-progress">
            <div className="progress-header">
              <span>Budget Usage</span>
              <span>{spentPercentage.toFixed(1)}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${spentPercentage > 100 ? 'over' : spentPercentage > 80 ? 'warning' : 'normal'}`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
          </div>

          {spentPercentage > 80 && (
            <div className={`insight-alert ${spentPercentage > 100 ? 'danger' : 'warning'}`}>
              {spentPercentage > 100 
                ? `🚨 You've exceeded your budget by ₹${Math.abs(remaining).toLocaleString()}!`
                : `⚠️ You've used ${spentPercentage.toFixed(0)}% of your budget. ${remaining.toLocaleString()} remaining.`
              }
            </div>
          )}

          {/* Envelope-wise Breakdown */}
          <div className="envelope-breakdown">
            <div className="breakdown-header">
              <h4 className="breakdown-title">📋 Envelope-wise Spending</h4>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="percentage">Highest % Used</option>
                <option value="amount">Highest Spent</option>
                <option value="remaining">Lowest Remaining</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            {Object.keys(envelopes).map(category => {
              const categoryIcon = category === 'needs' ? '🏠' : category === 'wants' ? '🎯' : '💰';
              
              const envelopeData = Object.keys(envelopes[category]).map(name => {
                const env = envelopes[category][name];
                const spent = (transactions || []).filter(t => t.envelope === `${category}.${name}` && (!t.type || t.type === 'expense')).reduce((sum, t) => sum + t.amount, 0);
                const remaining = env.budgeted - spent;
                const percentage = env.budgeted > 0 ? (spent / env.budgeted) * 100 : 0;
                return { name, env, spent, remaining, percentage };
              });

              const sortedEnvelopes = [...envelopeData].sort((a, b) => {
                if (sortBy === 'percentage') return b.percentage - a.percentage;
                if (sortBy === 'amount') return b.spent - a.spent;
                if (sortBy === 'remaining') return a.remaining - b.remaining;
                return a.name.localeCompare(b.name);
              });
              
              return (
                <div key={category} className="category-breakdown">
                  <div className="category-breakdown-header">
                    <span>{categoryIcon} {category.toUpperCase()}</span>
                  </div>
                  <div className="envelope-breakdown-list">
                    {sortedEnvelopes.map(({ name, env, spent, remaining, percentage }) => (
                      <div key={name} className="envelope-breakdown-item">
                        <div className="envelope-breakdown-info">
                          <span className="envelope-breakdown-name">{name}</span>
                          <span className="envelope-breakdown-amounts">
                            <span className="spent">₹{spent.toLocaleString()}</span>
                            <span className="separator">/</span>
                            <span className="budgeted">₹{env.budgeted.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="envelope-breakdown-progress">
                          <div 
                            className={`envelope-progress-fill ${percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'normal'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="envelope-breakdown-status">
                          <span className={remaining >= 0 ? 'positive' : 'negative'}>
                            {remaining >= 0 ? `₹${remaining.toLocaleString()} left` : `₹${Math.abs(remaining).toLocaleString()} over`}
                          </span>
                          <span className="percentage">{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetWorkflowDashboard;
