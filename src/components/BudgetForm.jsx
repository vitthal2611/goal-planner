import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';

const BudgetForm = ({ budgets }) => {
  const { allocateBudget } = useBudget();
  const [form, setForm] = useState({ envelope: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.envelope || !form.amount) return;

    setSubmitting(true);
    const success = await allocateBudget(form.envelope, form.amount);
    setSubmitting(false);

    if (success) {
      setForm({ envelope: '', amount: '' });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Envelope (Category)</label>
          <input
            type="text"
            placeholder="e.g., DMART, EMI, EATOUT"
            value={form.envelope}
            onChange={(e) => setForm({ ...form, envelope: e.target.value })}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Budget Amount</label>
          <input
            type="number"
            placeholder="Enter budget amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={submitting} style={styles.submitButton}>
          {submitting ? 'Allocating...' : 'Allocate Budget'}
        </button>
      </form>

      {budgets.length > 0 && (
        <div style={styles.budgetsList}>
          <h4 style={styles.listTitle}>Current Budgets</h4>
          {budgets.map((budget, idx) => (
            <div key={idx} style={styles.budgetItem}>
              <div style={styles.budgetHeader}>
                <span style={styles.budgetName}>{budget.envelope}</span>
                <span style={styles.budgetAmount}>₹{budget.budgeted.toLocaleString()}</span>
              </div>
              <div style={styles.budgetBar}>
                <div
                  style={{
                    ...styles.budgetProgress,
                    width: `${Math.min((budget.spent / budget.budgeted) * 100, 100)}%`,
                    backgroundColor: budget.spent > budget.budgeted ? '#dc3545' : '#28a745',
                  }}
                />
              </div>
              <div style={styles.budgetStats}>
                <span>Spent: ₹{budget.spent.toLocaleString()}</span>
                <span style={{ color: budget.remaining >= 0 ? '#28a745' : '#dc3545' }}>
                  Remaining: ₹{budget.remaining.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
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
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
  budgetsList: {
    marginTop: '24px',
  },
  listTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  budgetItem: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  budgetName: {
    fontWeight: 'bold',
    color: '#333',
  },
  budgetAmount: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  budgetBar: {
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  budgetProgress: {
    height: '100%',
    transition: 'width 0.3s',
  },
  budgetStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#666',
  },
};

export default BudgetForm;
