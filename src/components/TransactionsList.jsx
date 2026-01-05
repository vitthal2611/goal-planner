import React, { useState, useMemo } from 'react';
import { sanitizeInput } from '../utils/sanitize';

const TransactionsList = ({ 
  transactions, 
  onDeleteTransaction, 
  onUpdatePaymentMethod,
  customPaymentMethods,
  title = "📅 Today's Expenses",
  filterDate = null 
}) => {
  const [editingPayment, setEditingPayment] = useState({ id: null, method: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ id: null, name: '' });

  // Memoize filtered transactions for performance
  const filteredTransactions = useMemo(() => {
    if (!filterDate) return transactions;
    return transactions.filter(t => t.date === filterDate);
  }, [transactions, filterDate]);

  const handlePaymentUpdate = (transactionId, newPaymentMethod) => {
    const sanitizedMethod = sanitizeInput(newPaymentMethod);
    onUpdatePaymentMethod(transactionId, sanitizedMethod);
    setEditingPayment({ id: null, method: '' });
  };

  const handleDelete = (transaction) => {
    setDeleteConfirm({ 
      id: transaction.id, 
      name: sanitizeInput(transaction.description) 
    });
  };

  const confirmDelete = () => {
    onDeleteTransaction(deleteConfirm.id);
    setDeleteConfirm({ id: null, name: '' });
  };

  return (
    <>
      <div className="card mobile-optimized">
        <div className="card-header">
          <h3>{title}</h3>
          <span className="transaction-count">
            {filteredTransactions.length} transactions
          </span>
        </div>
        <div className="card-content">
          <div className="table-container">
            {/* Desktop Table View */}
            <table className="envelope-table desktop-only">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Description</th>
                  <th>Envelope</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.reverse().map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td>#{index + 1}</td>
                    <td>{sanitizeInput(transaction.description)}</td>
                    <td style={{textTransform: 'uppercase'}}>
                      {transaction.envelope.replace('.', ' - ')}
                    </td>
                    <td style={{fontWeight: '600', color: 'var(--danger)'}}>
                      ₹{transaction.amount.toLocaleString()}
                    </td>
                    <td 
                      onDoubleClick={() => setEditingPayment({ 
                        id: transaction.id, 
                        method: transaction.paymentMethod || '' 
                      })}
                      style={{ cursor: 'pointer' }}
                    >
                      {editingPayment.id === transaction.id ? (
                        <select
                          value={editingPayment.method}
                          onChange={(e) => setEditingPayment({ 
                            ...editingPayment, 
                            method: e.target.value 
                          })}
                          onBlur={() => handlePaymentUpdate(transaction.id, editingPayment.method)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePaymentUpdate(transaction.id, editingPayment.method)}
                          autoFocus
                          style={{ width: '100%' }}
                        >
                          {customPaymentMethods.sort((a, b) => a.localeCompare(b)).map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      ) : (
                        transaction.paymentMethod || 'UPI'
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-delete touch-optimized"
                        onClick={() => handleDelete(transaction)}
                        title="Delete transaction"
                        aria-label={`Delete transaction ${transaction.description}`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', color: 'var(--gray-600)', padding: '20px'}}>
                      No expenses on selected date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="mobile-card-view mobile-only">
              {filteredTransactions.reverse().map((transaction, index) => (
                <div key={transaction.id} className="mobile-transaction-card touch-optimized">
                  <div className="mobile-card-header">
                    <span>#{index + 1} - {sanitizeInput(transaction.description)}</span>
                    <button
                      className="btn-delete touch-optimized"
                      onClick={() => handleDelete(transaction)}
                      title="Delete transaction"
                      aria-label={`Delete transaction ${transaction.description}`}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="mobile-card-content">
                    <div className="mobile-card-field">
                      <span className="mobile-card-label">Envelope</span>
                      <span className="mobile-card-value" style={{textTransform: 'uppercase'}}>
                        {transaction.envelope.replace('.', ' - ')}
                      </span>
                    </div>
                    <div className="mobile-card-field">
                      <span className="mobile-card-label">Amount</span>
                      <span className="mobile-card-value" style={{fontWeight: '600', color: 'var(--danger)'}}>
                        ₹{transaction.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mobile-card-field">
                      <span className="mobile-card-label">Payment</span>
                      <span className="mobile-card-value">
                        {transaction.paymentMethod || 'UPI'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <div className="empty-text">No expenses on selected date</div>
                  <div className="empty-subtext">Add your first expense using the form above</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.id && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ id: null, name: '' })}>
          <div className="modal mobile-optimized" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close touch-optimized"
              onClick={() => setDeleteConfirm({ id: null, name: '' })}
              aria-label="Close modal"
            >
              ×
            </button>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete transaction "{deleteConfirm.name}"?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary touch-optimized" 
                onClick={() => setDeleteConfirm({ id: null, name: '' })}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger touch-optimized" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionsList;