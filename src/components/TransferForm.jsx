import React, { useContext, useState } from 'react';
import { BudgetContext } from '../contexts/BudgetContext.jsx';
import './Forms.css';

const TransferForm = () => {
  const { addTransaction, paymentMethods } = useContext(BudgetContext);
  const [formData, setFormData] = useState({
    fromMethod: paymentMethods[0]?.name || '',
    toMethod: paymentMethods[1]?.name || '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fromMethod || !formData.toMethod || !formData.amount) {
      setMessage('Please fill all fields');
      return;
    }

    if (formData.fromMethod === formData.toMethod) {
      setMessage('From and To methods must be different');
      return;
    }

    try {
      setLoading(true);
      const desc = formData.description || `Transfer from ${formData.fromMethod} to ${formData.toMethod}`;
      
      await Promise.all([
        addTransaction('Transfer-Out', desc, '', parseFloat(formData.amount), formData.fromMethod),
        addTransaction('Transfer-In', desc, '', parseFloat(formData.amount), formData.toMethod)
      ]);

      setFormData({
        fromMethod: paymentMethods[0]?.name || '',
        toMethod: paymentMethods[1]?.name || '',
        amount: '',
        description: ''
      });
      setMessage('Transfer completed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>🔄 Transfer Funds</h2>

      <div className="form-group">
        <label>From Payment Method</label>
        <select name="fromMethod" value={formData.fromMethod} onChange={handleChange} required>
          {paymentMethods.map(method => (
            <option key={method.name} value={method.name}>{method.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>To Payment Method</label>
        <select name="toMethod" value={formData.toMethod} onChange={handleChange} required>
          {paymentMethods.map(method => (
            <option key={method.name} value={method.name}>{method.name}</option>
          ))}
        </select>
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
        <label>Description (Optional)</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., Monthly transfer"
        />
      </div>

      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Processing...' : 'Transfer Funds'}
      </button>
    </form>
  );
};

export default TransferForm;
