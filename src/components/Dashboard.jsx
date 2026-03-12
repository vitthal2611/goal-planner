import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import BudgetSummary from './BudgetSummary';
import ProfileModal from './ProfileModal';
import YearInsights from './YearInsights';
import TransactionForm from './TransactionForm';
import EnhancedTransactionsList from './EnhancedTransactionsList';
import QuickAddFAB from './QuickAddFAB';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import './Dashboard.css';

const Dashboard = () => {
  const { currentMonth, setCurrentMonth, loading, budgetValidation } = useBudget();
  const [activeTab, setActiveTab] = useState('income');
  const [showProfile, setShowProfile] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: '1', callback: () => setActiveTab('income') },
    { key: '2', callback: () => setActiveTab('expense') },
    { key: '3', callback: () => setActiveTab('transfer') },
    { key: '4', callback: () => setActiveTab('budget') },
    { key: 's', ctrlKey: true, callback: () => setShowProfile(true) },
  ]);

  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        options.push(`${year}-${String(month).padStart(2, '0')}`);
      }
    }
    return options;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>💰 Budget Planner</h1>
        <div className="header-controls">
          <YearInsights currentMonth={currentMonth} />
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="month-selector"
          >
            {generateMonthOptions().map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button onClick={() => setShowProfile(true)} className="btn-icon" title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      {budgetValidation && (
        <div className="budget-status">
          <div className="status-item">
            <span className="status-label">Income</span>
            <span className="status-value">₹{budgetValidation.income.toLocaleString()}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Allocated</span>
            <span className="status-value">₹{budgetValidation.allocated.toLocaleString()}</span>
          </div>
          <div className={`status-item ${budgetValidation.isValid ? 'valid' : 'invalid'}`}>
            <span className="status-label">Unallocated</span>
            <span className="status-value">
              {budgetValidation.difference === 0 ? (
                <span>₹0</span>
              ) : budgetValidation.difference > 0 ? (
                <span>₹{budgetValidation.difference.toLocaleString()}</span>
              ) : (
                <span>-₹{Math.abs(budgetValidation.difference).toLocaleString()}</span>
              )}
            </span>
          </div>
          <div className={`status-item ${budgetValidation.isValid ? 'valid' : 'invalid'}`}>
            <span className="status-label">Status</span>
            <span className="status-value">{budgetValidation.isValid ? '✅ Balanced' : '⚠️ Unbalanced'}</span>
          </div>
        </div>
      )}
      
      <BudgetSummary />

      <div className="tabs">
        <button 
          className={activeTab === 'income' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('income')}
        >
          💰 Income
        </button>
        <button 
          className={activeTab === 'expense' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('expense')}
        >
          💸 Expense
        </button>
        <button 
          className={activeTab === 'transfer' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('transfer')}
        >
          🔄 Transfer
        </button>
        <button 
          className={activeTab === 'budget' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('budget')}
        >
          📋 Budget
        </button>
      </div>

      <div className="content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <TransactionForm type={activeTab} />
            <EnhancedTransactionsList />
          </>
        )}
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      
      {/* Quick Add FAB for fast expense entry */}
      <QuickAddFAB />
    </div>
  );
};

export default Dashboard;
