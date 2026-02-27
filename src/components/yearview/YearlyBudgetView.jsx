import React, { useState, useEffect } from 'react';
import { useYearlyBudget } from '../../features/budget/hooks/useYearlyBudget';
import { useApp } from '../../core/context/AppContext';
import './YearlyBudgetView.css';

const YearlyBudgetView = ({ selectedYear }) => {
  const [year, setYear] = useState(selectedYear || new Date().getFullYear());
  
  useEffect(() => {
    if (selectedYear) {
      setYear(selectedYear);
    }
  }, [selectedYear]);
  const { totalIncome, totalAllocated, unallocated, envelopeTotals, monthsCount } = useYearlyBudget(year);
  const { state, dispatch } = useApp();
  const { monthlyData } = state;
  const [newEnvelope, setNewEnvelope] = useState({ category: '', name: '' });
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [copyAmount, setCopyAmount] = useState('');

  const allEnvelopes = Object.values(envelopeTotals);

  const getMonthlyBudget = (category, name, month) => {
    const period = `${year}-${String(month).padStart(2, '0')}`;
    return monthlyData[period]?.envelopes?.[category]?.[name]?.budgeted || 0;
  };

  const handleSetMonthlyBudget = (category, name, month, amount) => {
    const monthlyAmount = parseFloat(amount) || 0;
    const period = `${year}-${String(month).padStart(2, '0')}`;

    const updatedMonthlyData = { ...monthlyData };
    if (!updatedMonthlyData[period]) {
      updatedMonthlyData[period] = { envelopes: {} };
    }
    if (!updatedMonthlyData[period].envelopes) {
      updatedMonthlyData[period].envelopes = {};
    }
    if (!updatedMonthlyData[period].envelopes[category]) {
      updatedMonthlyData[period].envelopes[category] = {};
    }
    updatedMonthlyData[period].envelopes[category][name] = { budgeted: monthlyAmount };

    dispatch({ type: 'SET_MONTHLY_DATA', payload: updatedMonthlyData });
  };

  const handleCopyToAll = () => {
    if (!selectedEnvelope || !copyAmount) return;
    const amount = parseFloat(copyAmount);
    if (isNaN(amount)) return;

    for (let month = 1; month <= 12; month++) {
      handleSetMonthlyBudget(selectedEnvelope.category, selectedEnvelope.name, month, amount);
    }
    setCopyAmount('');
  };

  const handleAddEnvelope = async () => {
    if (!newEnvelope.category || !newEnvelope.name.trim()) return;

    // Add to global envelopes
    const { addGlobalEnvelope } = await import('../../utils/globalEnvelopes');
    await addGlobalEnvelope(newEnvelope.category, newEnvelope.name);

    const updatedMonthlyData = { ...monthlyData };
    
    for (let month = 1; month <= 12; month++) {
      const period = `${year}-${String(month).padStart(2, '0')}`;
      if (!updatedMonthlyData[period]) {
        updatedMonthlyData[period] = { envelopes: {} };
      }
      if (!updatedMonthlyData[period].envelopes) {
        updatedMonthlyData[period].envelopes = {};
      }
      if (!updatedMonthlyData[period].envelopes[newEnvelope.category]) {
        updatedMonthlyData[period].envelopes[newEnvelope.category] = {};
      }
      updatedMonthlyData[period].envelopes[newEnvelope.category][newEnvelope.name] = { budgeted: 0 };
    }

    dispatch({ type: 'SET_MONTHLY_DATA', payload: updatedMonthlyData });
    setNewEnvelope({ category: '', name: '' });
    setSelectedEnvelope({ category: newEnvelope.category, name: newEnvelope.name });
  };

  const handleDeleteEnvelope = async (category, name) => {
    // Remove from global envelopes
    const { removeGlobalEnvelope } = await import('../../utils/globalEnvelopes');
    await removeGlobalEnvelope(category, name);

    const updatedMonthlyData = { ...monthlyData };
    
    for (let month = 1; month <= 12; month++) {
      const period = `${year}-${String(month).padStart(2, '0')}`;
      if (updatedMonthlyData[period]?.envelopes?.[category]?.[name]) {
        delete updatedMonthlyData[period].envelopes[category][name];
      }
    }

    dispatch({ type: 'SET_MONTHLY_DATA', payload: updatedMonthlyData });
    if (selectedEnvelope?.category === category && selectedEnvelope?.name === name) {
      setSelectedEnvelope(null);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getCategoryIcon = (category) => {
    if (category === 'needs') return '🏠';
    if (category === 'savings') return '💰';
    return '🎯';
  };

  const getCategoryName = (category) => {
    if (category === 'needs') return 'Needs';
    if (category === 'savings') return 'Savings';
    return 'Wants';
  };

  return (
    <div className="yearly-budget-view">
      <div className="year-selector">
        <button onClick={() => setYear(year - 1)} className="year-nav-btn">←</button>
        <h2>{year}</h2>
        <button onClick={() => setYear(year + 1)} className="year-nav-btn">→</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">₹{totalIncome.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card allocated">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <div className="stat-label">Total Allocated</div>
            <div className="stat-value">₹{totalAllocated.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card unallocated">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <div className="stat-label">Unallocated</div>
            <div className="stat-value">₹{unallocated.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card months">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Months Tracked</div>
            <div className="stat-value">{monthsCount}</div>
          </div>
        </div>
      </div>

      <div className="envelope-breakdown">
        <h3>Manage Envelopes</h3>
        
        <div className="add-envelope-form">
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
            className="envelope-input"
          />
          <button onClick={handleAddEnvelope} className="btn-add">➕ Add Envelope</button>
        </div>

        <div className="envelope-manager">
          <div className="envelope-list-sidebar">
            <h4>Select Envelope</h4>
            {allEnvelopes.length === 0 ? (
              <p className="no-envelopes">No envelopes yet. Add one above!</p>
            ) : (
              allEnvelopes.map(env => {
                const isSelected = selectedEnvelope?.category === env.category && selectedEnvelope?.name === env.name;
                return (
                  <div
                    key={`${env.category}.${env.name}`}
                    className={`envelope-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedEnvelope({ category: env.category, name: env.name })}
                  >
                    <div className="envelope-item-header">
                      <span className="envelope-icon">{getCategoryIcon(env.category)}</span>
                      <div className="envelope-item-info">
                        <span className="envelope-item-name">{env.name.toUpperCase()}</span>
                        <span className="envelope-item-category">{getCategoryName(env.category)}</span>
                      </div>
                    </div>
                    <span className="envelope-item-total">₹{env.total.toLocaleString()}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="envelope-detail-panel">
            {selectedEnvelope ? (
              <>
                <div className="detail-header">
                  <div className="detail-title">
                    <span className="detail-icon">{getCategoryIcon(selectedEnvelope.category)}</span>
                    <div>
                      <h4>{selectedEnvelope.name.toUpperCase()}</h4>
                      <span className="detail-category">{getCategoryName(selectedEnvelope.category)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteEnvelope(selectedEnvelope.category, selectedEnvelope.name)} 
                    className="btn-delete-envelope"
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="quick-actions">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Amount"
                    value={copyAmount}
                    onChange={(e) => setCopyAmount(e.target.value)}
                    className="copy-input"
                  />
                  <button onClick={handleCopyToAll} className="btn-copy">📋 Copy to All Months</button>
                </div>

                <div className="yearly-total">
                  <span>Yearly Total:</span>
                  <span className="total-amount">
                    ₹{envelopeTotals[`${selectedEnvelope.category}.${selectedEnvelope.name}`]?.total.toLocaleString() || 0}
                  </span>
                </div>

                <div className="months-grid">
                  {monthNames.map((monthName, index) => {
                    const month = index + 1;
                    const budget = getMonthlyBudget(selectedEnvelope.category, selectedEnvelope.name, month);
                    return (
                      <div key={month} className="month-row">
                        <label className="month-label">{monthName}</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={budget}
                          onChange={(e) => handleSetMonthlyBudget(selectedEnvelope.category, selectedEnvelope.name, month, e.target.value)}
                          className="month-input"
                          placeholder="0"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="no-selection">
                <span className="no-selection-icon">👈</span>
                <p>Select an envelope from the list to manage monthly budgets</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyBudgetView;
