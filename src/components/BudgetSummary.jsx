import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './BudgetSummary.css';

const BudgetSummary = () => {
  const { budgetSummary, deleteEnvelope, updateEnvelope } = useBudget();
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  if (budgetSummary.length === 0) {
    return null;
  }

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditAmount(item.budget.toString());
  };

  const handleSave = async (item) => {
    try {
      const newBudget = parseFloat(editAmount);
      if (isNaN(newBudget) || newBudget <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      await updateEnvelope(item.id, { ...item, budget: newBudget });
      setEditingId(null);
      setEditAmount('');
    } catch (error) {
      alert('Error updating envelope: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete "${item.name}" envelope? This cannot be undone.`)) {
      try {
        await deleteEnvelope(item.id);
      } catch (error) {
        alert('Error deleting envelope: ' + error.message);
      }
    }
  };

  return (
    <div className="budget-summary">
      <div className="section-header">
        <h3>📋 Budget Envelopes</h3>
        <span className="envelope-count">{budgetSummary.length} active</span>
      </div>
      <div className="budget-grid">
        {budgetSummary.map(item => {
          const statusClass = item.percentage > 100 ? 'over-budget' : item.percentage > 80 ? 'warning' : 'healthy';
          const isEditing = editingId === item.id;
          
          return (
            <div key={item.id} className={`budget-card ${statusClass}`}>
              <div className="budget-header">
                <div className="budget-name">{item.name}</div>
                <div className="budget-actions">
                  {!isEditing && (
                    <>
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(item)}
                        title="Edit budget"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(item)}
                        title="Delete envelope"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div className="budget-edit-form">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="edit-input"
                    placeholder="Budget amount"
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button className="btn-save" onClick={() => handleSave(item)}>✓ Save</button>
                    <button className="btn-cancel" onClick={handleCancel}>✕ Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="budget-amounts">
                    <span className="budget-spent">₹{item.spent.toFixed(0)}</span>
                    <span className="budget-total">/ ₹{item.budget.toFixed(0)}</span>
                  </div>
                  <div className="budget-progress">
                    <div 
                      className="budget-progress-bar"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="budget-footer">
                    <div className="budget-remaining">
                      {item.remaining >= 0 ? (
                        <span className="text-success">₹{item.remaining.toFixed(0)} left</span>
                      ) : (
                        <span className="text-danger">₹{Math.abs(item.remaining).toFixed(0)} over</span>
                      )}
                    </div>
                    <div className="budget-percentage">{item.percentage.toFixed(0)}%</div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetSummary;
