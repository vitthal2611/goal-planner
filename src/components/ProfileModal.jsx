import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const { paymentMethods, envelopes, addPaymentMethod, removePaymentMethod } = useApp();
  const [activeTab, setActiveTab] = useState('payment');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      addPaymentMethod(newPaymentMethod.trim());
      setNewPaymentMethod('');
    }
  };

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            Payment Methods
          </button>
          <button
            className={`tab-btn ${activeTab === 'envelope' ? 'active' : ''}`}
            onClick={() => setActiveTab('envelope')}
          >
            Envelopes
          </button>
          <button
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
        </div>

        {activeTab === 'payment' && (
          <div className="tab-content active">
            <div className="modal-section">
              <h3 className="section-title">Payment Methods</h3>
              <div className="payment-method-list">
                {paymentMethods.map((method) => (
                  <div key={method} className="payment-method-item">
                    <span className="payment-method-name">💳 {method}</span>
                    <button
                      className="delete-btn"
                      onClick={() => removePaymentMethod(method)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-payment-form">
                <div className="add-payment-row">
                  <input
                    type="text"
                    className="add-payment-input"
                    placeholder="New payment method..."
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPaymentMethod()}
                  />
                  <button className="add-btn" onClick={handleAddPaymentMethod}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'envelope' && (
          <div className="tab-content active">
            <div className="modal-section">
              <h3 className="section-title">Envelopes (Categories)</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                Envelope management coming soon...
              </p>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="tab-content active">
            <div className="modal-section">
              <h3 className="section-title">Import / Export</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                Data import/export features coming soon...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
