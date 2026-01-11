import React, { useState } from 'react';

const EnvelopeCard = ({ name, budget, spent, type, onAddExpense }) => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  
  const remaining = budget - spent;
  const percentage = (spent / budget) * 100;
  
  const getTypeIcon = () => {
    switch(type) {
      case 'need': return '🔴';
      case 'want': return '🟡';
      case 'saving': return '🟢';
      default: return '⚪';
    }
  };

  const getColor = () => {
    if (remaining <= 0) return '#ef4444';
    if (percentage > 80) return '#f59e0b';
    return '#10b981';
  };

  const handleAdd = () => {
    if (amount && parseFloat(amount) > 0) {
      onAddExpense(name, parseFloat(amount));
      setAmount('');
      setShowForm(false);
    }
  };

  return (
    <div className="envelope-card" onClick={() => !showForm && setShowForm(true)}>
      <div className="envelope-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{getTypeIcon()}</span>
          <h3>{name}</h3>
        </div>
        <span style={{ color: getColor(), fontWeight: 'bold' }}>
          ₹{remaining.toLocaleString()}
        </span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: getColor() }}
        />
      </div>
      
      <div className="envelope-stats">
        <span>₹{spent.toLocaleString()} / ₹{budget.toLocaleString()}</span>
      </div>

      {showForm && (
        <div className="quick-form" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
          />
          <div className="form-actions">
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button onClick={handleAdd} className="add-btn">Add</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvelopeCard;