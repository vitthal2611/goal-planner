import React, { useContext, useState } from 'react';
import { BudgetContext } from '../contexts/AppContext.jsx';
import './BudgetForm.css';

const BudgetForm = () => {
  const { addBudget, currentMonth, envelopes } = useContext(BudgetContext);
  const [formData, setFormData] = useState({
    envelope: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.envelope || !formData.amount) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addBudget(currentMonth, formData.envelope, parseFloat(formData.amount));
      setFormData({ envelope: '', amount: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <h2>Allocate Budget for {currentMonth}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Envelope (Category)</label>
        <select
          name="envelope"
          value={formData.envelope}
          onChange={handleChange}
          required
        >
          <option value="">Select Envelope</option>
          {envelopes.map(env => (
            <option key={env.name} value={env.name}>{env.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Budget Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          required
        />
      </div>

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Allocating...' : 'Allocate Budget'}
      </button>
    </form>
  );
};

export default BudgetForm;
