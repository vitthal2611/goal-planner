import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';

const TransferForm = ({ paymentMethods }) => {
  const { addTransfer } = useBudget();
  const [form, setForm] = useState({
    from: paymentMethods[0]?.name || '',
    to: paymentMethods[1]?.name || '',
    amount: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.amount) return;
    if (form.from === form.to) {
      alert('Cannot transfer to same account');
      return;
    }

    setSubmitting(true);
    const success = await addTransfer(form.from, form.to, form.amount, form.description);
    setSubmitting(false);

    if (success) {
      setForm({
        from: paymentMethods[0]?.name || '',
        to: paymentMethods[1]?.name || '',
        amount: '',
        description: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>From Account</label>
        <select
          value={form.from}
          onChange={(e) => setForm({ ...form, from: e.target.value })}
          style={styles.input}
          required
        >
          {paymentMethods.map(method => (
            <option key={method.name} value={method.name}>{method.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>To Account</label>
        <select
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
          style={styles.input}
          required
        >
          {paymentMethods.filter(m => m.name !== form.from).map(method => (
            <option key={method.name} value={method.name}>{method.name}</option>
          ))}
        </select>
      </div>

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
        <label style={styles.label}>Description (Optional)</label>
        <input
          type="text"
          placeholder="e.g., Monthly transfer"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={styles.input}
        />
      </div>

      <button type="submit" disabled={submitting} style={styles.submitButton}>
        {submitting ? 'Transferring...' : 'Transfer Funds'}
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
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default TransferForm;
