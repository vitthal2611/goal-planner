import React, { useState } from 'react';
import { sanitizeInput } from '../utils/sanitize';
import './BulkExpenseModal.css';

const BulkExpenseModal = ({ 
  envelopes, 
  paymentMethods, 
  dateRange, 
  onClose, 
  onSubmit 
}) => {
  const [expenses, setExpenses] = useState([
    { envelope: '', amount: '', description: '', paymentMethod: paymentMethods[0] || 'HDFC', date: new Date().toISOString().split('T')[0] }
  ]);

  const addRow = () => {
    setExpenses([...expenses, { 
      envelope: '', 
      amount: '', 
      description: '', 
      paymentMethod: paymentMethods[0] || 'HDFC', 
      date: new Date().toISOString().split('T')[0] 
    }]);
  };

  const removeRow = (index) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const handleSubmit = () => {
    const validExpenses = expenses.filter(e => e.envelope && e.amount && parseFloat(e.amount) > 0);
    
    if (validExpenses.length === 0) {
      alert('Please add at least one valid expense');
      return;
    }

    const sanitized = validExpenses.map(e => ({
      ...e,
      description: sanitizeInput(e.description || 'Bulk expense'),
      amount: parseFloat(e.amount)
    }));

    onSubmit(sanitized);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bulk-expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📝 Add Multiple Expenses</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="bulk-expense-content">
          <div className="expense-rows">
            {expenses.map((expense, index) => (
              <div key={index} className="expense-row">
                <span className="row-number">{index + 1}</span>
                
                <select
                  value={expense.envelope}
                  onChange={(e) => updateExpense(index, 'envelope', e.target.value)}
                  className="bulk-select"
                >
                  <option value="">Envelope</option>
                  {Object.keys(envelopes).flatMap(category =>
                    Object.keys(envelopes[category]).map(name => (
                      <option key={`${category}.${name}`} value={`${category}.${name}`}>
                        {name.toUpperCase()}
                      </option>
                    ))
                  )}
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount"
                  value={expense.amount}
                  onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                  className="bulk-input"
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={expense.description}
                  onChange={(e) => updateExpense(index, 'description', e.target.value)}
                  className="bulk-input"
                  maxLength="100"
                />

                <select
                  value={expense.paymentMethod}
                  onChange={(e) => updateExpense(index, 'paymentMethod', e.target.value)}
                  className="bulk-select-small"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={expense.date}
                  min={dateRange.min}
                  max={dateRange.max}
                  onChange={(e) => updateExpense(index, 'date', e.target.value)}
                  className="bulk-date"
                />

                <button 
                  className="btn-remove" 
                  onClick={() => removeRow(index)}
                  disabled={expenses.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary add-row-btn" onClick={addRow}>
            ➕ Add Row
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit}>
            Add {expenses.filter(e => e.envelope && e.amount).length} Expenses
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkExpenseModal;
