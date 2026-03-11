import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';

const PaymentMethodsModal = ({ paymentMethods, onClose }) => {
  const { addPaymentMethod, removePaymentMethod } = useBudget();
  const [form, setForm] = useState({ name: '', type: 'Bank' });
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return;

    setSubmitting(true);
    const success = await addPaymentMethod(form.name, form.type);
    setSubmitting(false);

    if (success) {
      setForm({ name: '', type: 'Bank' });
    }
  };

  const handleRemove = async (name) => {
    if (window.confirm(`Remove ${name}?`)) {
      await removePaymentMethod(name);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>💳 Payment Methods</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          <form onSubmit={handleAdd} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Method Name</label>
              <input
                type="text"
                placeholder="e.g., HDFC Bank, SBI Credit Card"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={styles.input}
              >
                <option value="Bank">Bank</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Wallet">Wallet</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} style={styles.addButton}>
              {submitting ? 'Adding...' : 'Add Method'}
            </button>
          </form>

          <div style={styles.methodsList}>
            <h3 style={styles.listTitle}>Active Methods</h3>
            {paymentMethods.length === 0 ? (
              <div style={styles.empty}>No payment methods</div>
            ) : (
              paymentMethods.map((method, idx) => (
                <div key={idx} style={styles.methodItem}>
                  <div>
                    <div style={styles.methodName}>{method.name}</div>
                    <div style={styles.methodType}>{method.type}</div>
                  </div>
                  <button
                    onClick={() => handleRemove(method.name)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
  },
  content: {
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #eee',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  addButton: {
    padding: '10px',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  methodsList: {
    marginTop: '16px',
  },
  listTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontSize: '14px',
  },
  methodItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  methodName: {
    fontWeight: '500',
    color: '#333',
  },
  methodType: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  removeButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};

export default PaymentMethodsModal;
