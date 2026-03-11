import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';

const IncomeForm = ({ paymentMethods }) => {
  const { addIncome } = useBudget();
  const [form, setForm] = useState({ amount: '', description: '', paymentMethod: paymentMethods[0]?.name || '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.paymentMethod) return;

    setSubmitting(true);
    const success = await addIncome(form.amount, form.description, form.paymentMethod);
    setSubmitting(false);

    if (success) {
      setForm({ amount: '', description: '', paymentMethod: paymentMethods[0]?.name || '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Amount</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <input
          type="text"
          placeholder="e.g., Salary, Bonus"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Payment Method</label>
        <select
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          style={styles.input}
          required
        >
          {paymentMethods.map(method => (
            <option key={method.name} value={method.name}>{method.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={submitting} style={styles.submitButton}>
        {submitting ? 'Adding...' : 'Add Income'}
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default IncomeForm;
