import React from 'react';
import './TypeSelector.css';

const TYPES = [
  { id: 'income', label: 'Income', icon: '💰', color: 'income' },
  { id: 'expense', label: 'Expense', icon: '💸', color: 'expense' },
  { id: 'transfer', label: 'Transfer', icon: '🔄', color: 'transfer' },
];

const TypeSelector = ({ selectedType, onTypeChange }) => {
  return (
    <div className="type-selector">
      {TYPES.map(type => (
        <button
          key={type.id}
          className={`type-btn ${selectedType === type.id ? 'active' : ''} ${type.color}`}
          onClick={() => onTypeChange(type.id)}
        >
          <span className="icon">{type.icon}</span>
          <span className="label">{type.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TypeSelector;
