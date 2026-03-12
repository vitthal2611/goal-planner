import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext.jsx';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const { 
    paymentMethods, 
    addPaymentMethod, 
    deletePaymentMethod,
    getEnvelopeNames,
  } = useBudget();

  const [activeSection, setActiveSection] = useState('payment');
  const [newPayment, setNewPayment] = useState({ name: '', type: 'Bank' });

  const envelopeNames = getEnvelopeNames();

  const handleAddPayment = async (e) => {
    e.preventDefault();
    await addPaymentMethod(newPayment);
    setNewPayment({ name: '', type: 'Bank' });
  };

  const handleDeletePayment = async (id) => {
    if (confirm('Delete this payment method?')) {
      await deletePaymentMethod(id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={activeSection === 'payment' ? 'active' : ''}
            onClick={() => setActiveSection('payment')}
          >
            💳 Payment Methods
          </button>
          <button 
            className={activeSection === 'envelope' ? 'active' : ''}
            onClick={() => setActiveSection('envelope')}
          >
            📁 Envelopes
          </button>
        </div>

        <div className="modal-body">
          {activeSection === 'payment' && (
            <div className="section">
              <form onSubmit={handleAddPayment} className="add-form">
                <input
                  type="text"
                  placeholder="Payment Method Name"
                  value={newPayment.name}
                  onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                  required
                />
                <select
                  value={newPayment.type}
                  onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                >
                  <option value="Bank">Bank</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Cash">Cash</option>
                </select>
                <button type="submit" className="btn-primary">Add</button>
              </form>

              <div className="items-list">
                {paymentMethods.map(pm => (
                  <div key={pm.id} className="item-card">
                    <div>
                      <div className="item-name">{pm.name}</div>
                      <div className="item-type">{pm.type}</div>
                    </div>
                    <button onClick={() => handleDeletePayment(pm.id)} className="btn-delete">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'envelope' && (
            <div className="section">
              <p className="info-text">
                Envelopes are created automatically when you allocate budgets. 
                Current envelopes:
              </p>
              <div className="envelope-list">
                {envelopeNames.length === 0 ? (
                  <p className="empty-text">No envelopes yet. Add a budget to create one.</p>
                ) : (
                  envelopeNames.map(name => (
                    <div key={name} className="envelope-tag">
                      📁 {name}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
