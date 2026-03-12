import React, { useState } from 'react';
import './QuickTrackUI.css';

const QuickTrackUI = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [activeType, setActiveType] = useState('expense');
  const [currentMonth, setCurrentMonth] = useState('2025-02');

  const months = [
    { value: '2025-01', label: 'Jan 2025' },
    { value: '2025-02', label: 'Feb 2025' },
    { value: '2025-03', label: 'Mar 2025' },
  ];

  const handlePrevMonth = () => {
    const currentIndex = months.findIndex(m => m.value === currentMonth);
    if (currentIndex > 0) {
      setCurrentMonth(months[currentIndex - 1].value);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = months.findIndex(m => m.value === currentMonth);
    if (currentIndex < months.length - 1) {
      setCurrentMonth(months[currentIndex + 1].value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ type: activeType, amount, description });
    setAmount('');
    setDescription('');
  };

  return (
    <div className="quick-track">
      <div className="top-bar">
        <div className="month-selector">
          <button className="month-nav" onClick={handlePrevMonth}>‹</button>
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="month-select"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button className="month-nav" onClick={handleNextMonth}>›</button>
        </div>
      </div>

      <div className="balance-summary">
        <div className="balance-item income">
          <div className="balance-label">Income</div>
          <div className="balance-value">₹85,000</div>
        </div>
        <div className="balance-item expense">
          <div className="balance-label">Expense</div>
          <div className="balance-value">₹42,340</div>
        </div>
        <div className="balance-item transfer">
          <div className="balance-label">Transfer</div>
          <div className="balance-value">₹10,000</div>
        </div>
        <div className="balance-item net">
          <div className="balance-label">Balance</div>
          <div className="balance-value">₹32,660</div>
        </div>
      </div>
      <div className="quick-track-header">
        <button 
          className={`type-btn ${activeType === 'income' ? 'active income' : ''}`}
          onClick={() => setActiveType('income')}
        >
          <span className="icon">↓</span>
          <span>Income</span>
        </button>
        <button 
          className={`type-btn ${activeType === 'expense' ? 'active expense' : ''}`}
          onClick={() => setActiveType('expense')}
        >
          <span className="icon">↑</span>
          <span>Expense</span>
        </button>
        <button 
          className={`type-btn ${activeType === 'transfer' ? 'active transfer' : ''}`}
          onClick={() => setActiveType('transfer')}
        >
          <span className="icon">⇄</span>
          <span>Transfer</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="quick-form">
        <div className="amount-input-wrapper">
          <span className="currency">₹</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="amount-input"
            autoFocus
          />
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={activeType === 'transfer' ? 'From → To' : "What's this for?"}
          className="description-input"
        />

        <button type="submit" className={`submit-btn ${activeType}`}>
          Add {activeType === 'income' ? 'Income' : activeType === 'expense' ? 'Expense' : 'Transfer'}
        </button>
      </form>

      <div className="quick-stats">
        <div className="stat-card income-card">
          <div className="stat-label">Today's Income</div>
          <div className="stat-value">₹12,500</div>
        </div>
        <div className="stat-card expense-card">
          <div className="stat-label">Today's Expense</div>
          <div className="stat-value">₹3,240</div>
        </div>
      </div>

      <div className="envelope-budget">
        <h3>Envelope Budget vs Actual</h3>
        <div className="envelope-item">
          <div className="envelope-header">
            <span className="envelope-name">EMI</span>
            <span className="envelope-amounts">₹85,000 / ₹85,000</span>
          </div>
          <div className="envelope-bar">
            <div className="envelope-progress" style={{width: '100%', backgroundColor: '#ef4444'}}></div>
          </div>
        </div>
        <div className="envelope-item">
          <div className="envelope-header">
            <span className="envelope-name">Food</span>
            <span className="envelope-amounts">₹8,340 / ₹15,000</span>
          </div>
          <div className="envelope-bar">
            <div className="envelope-progress" style={{width: '55.6%', backgroundColor: '#22c55e'}}></div>
          </div>
        </div>
        <div className="envelope-item">
          <div className="envelope-header">
            <span className="envelope-name">Transport</span>
            <span className="envelope-amounts">₹4,500 / ₹5,000</span>
          </div>
          <div className="envelope-bar">
            <div className="envelope-progress" style={{width: '90%', backgroundColor: '#f59e0b'}}></div>
          </div>
        </div>
      </div>

      <div className="recent-transactions">
        <h3>Recent</h3>
        <div className="transaction-item expense">
          <div className="transaction-icon">🍔</div>
          <div className="transaction-details">
            <div className="transaction-desc">Lunch</div>
            <div className="transaction-time">2 mins ago</div>
          </div>
          <div className="transaction-amount">-₹450</div>
        </div>
        <div className="transaction-item expense">
          <div className="transaction-icon">🚕</div>
          <div className="transaction-details">
            <div className="transaction-desc">Uber</div>
            <div className="transaction-time">1 hour ago</div>
          </div>
          <div className="transaction-amount">-₹280</div>
        </div>
        <div className="transaction-item income">
          <div className="transaction-icon">💰</div>
          <div className="transaction-details">
            <div className="transaction-desc">Salary</div>
            <div className="transaction-time">Today</div>
          </div>
          <div className="transaction-amount">+₹50,000</div>
        </div>
      </div>
    </div>
  );
};

export default QuickTrackUI;
