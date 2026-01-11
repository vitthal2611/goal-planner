import React, { useState, useEffect } from 'react';
import { createRecurringTransaction, getRecurringTransactions } from '../services/recurringService.js';

const RecurringManager = ({ userId, envelopes }) => {
  const [recurring, setRecurring] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    envelope: '',
    frequency: 'monthly',
    type: 'expense',
    paymentMethod: ''
  });

  useEffect(() => {
    loadRecurring();
  }, [userId]);

  const loadRecurring = async () => {
    const result = await getRecurringTransactions(userId);
    if (result.success && result.data) {
      setRecurring(Object.entries(result.data).map(([id, data]) => ({ id, ...data })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createRecurringTransaction(userId, formData);
    if (result.success) {
      setFormData({
        description: '',
        amount: '',
        envelope: '',
        frequency: 'monthly',
        type: 'expense',
        paymentMethod: ''
      });
      setShowForm(false);
      loadRecurring();
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>🔄 Recurring Transactions</h3>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Recurring'}
        </button>
      </div>
      <div className="card-content">
        
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
              <select
                value={formData.envelope}
                onChange={(e) => setFormData({...formData, envelope: e.target.value})}
                required
              >
                <option value="">Select Envelope</option>
                {Object.entries(envelopes).map(([key, envelope]) => (
                  <option key={key} value={key}>{envelope.name}</option>
                ))}
              </select>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Create Recurring
            </button>
          </form>
        )}

        <div className="table-container">
          <table className="envelope-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Envelope</th>
                <th>Frequency</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recurring.map(item => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>₹{item.amount}</td>
                  <td>{envelopes[item.envelope]?.name || item.envelope}</td>
                  <td>{item.frequency}</td>
                  <td>{item.type === 'income' ? '💰 Income' : '💸 Expense'}</td>
                  <td>
                    <span style={{ 
                      color: item.isActive ? 'var(--success)' : 'var(--danger)',
                      fontWeight: '600'
                    }}>
                      {item.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {recurring.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--gray-600)' }}>
                    No recurring transactions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecurringManager;