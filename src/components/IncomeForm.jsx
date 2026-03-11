import React, { useContext, useState } from 'react';
import { BudgetContext } from '../contexts/BudgetContext.jsx';
import './Forms.css';

const IncomeForm = () => {
  const { addTransaction, paymentMethods, refresh } = useContext(BudgetContext);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paymentMethod: paymentMethods[0]?.name || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.paymentMethod) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await addTransaction('Income', formData.description, '', parseFloat(formData.amount), formData.paymentMethod);
      setFormData({ description: '', amount: '', paymentMethod: paymentMethods[0]?.name || '' });
      setMessage('Income added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>💰 Add Income</h2>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., Salary, Bonus"
          required
        />
      </div>

      <div className="form-group">
        <label>Amount</label>
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

      <div className="form-group">
        <label>Payment Method</label>
        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
          {paymentMethods.map(method => (
            <option key={method.name} value={method.name}>{method.name}</option>
          ))}
        </select>
      </div>

      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Adding...' : 'Add Income'}
      </button>
    </form>
  );
};

export default IncomeForm;
