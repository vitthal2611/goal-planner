import React, { useContext, useState } from 'react';
import { BudgetContext } from '../contexts/BudgetContext.jsx';
import './Forms.css';

const BudgetForm = () => {
  const { setBudgetAmount, envelopes, budgets } = useContext(BudgetContext);
  const [formData, setFormData] = useState({
    envelope: envelopes[0] || '',
    budgeted: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.envelope || !formData.budgeted) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await setBudgetAmount(formData.envelope, parseFloat(formData.budgeted));
      setFormData({ envelope: envelopes[0] || '', budgeted: '' });
      setMessage('Budget allocated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budget-form-container">
      <form onSubmit={handleSubmit} className="form">
        <h2>📋 Allocate Budget</h2>

        <div className="form-group">
          <label>Category (Envelope)</label>
          <select name="envelope" value={formData.envelope} onChange={handleChange} required>
            {envelopes.map(env => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Budget Amount</label>
          <input
            type="number"
            name="budgeted"
            value={formData.budgeted}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Allocating...' : 'Allocate Budget'}
        </button>
      </form>

      <div className="budget-list">
        <h3>Current Budgets</h3>
        {budgets.length === 0 ? (
          <p className="empty-state">No budgets allocated yet</p>
        ) : (
          <div className="budget-items">
            {budgets.map(budget => (
              <div key={budget.envelope} className="budget-item">
                <div className="budget-name">{budget.envelope}</div>
                <div className="budget-amount">₹{budget.budgeted.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetForm;
