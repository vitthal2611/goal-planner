import React, { useState } from 'react';
import PaymentMethodsManager from './PaymentMethodsManager';
import './UserProfile.css';

const UserProfile = ({ 
  user,
  paymentMethods,
  envelopes,
  transactions,
  onAddPaymentMethod,
  onDeletePaymentMethod,
  onAddEnvelope,
  onDeleteEnvelope,
  onClose,
  onShowNotification
}) => {
  const [activeTab, setActiveTab] = useState('payment-methods');

  const getEnvelopeUsage = (category, name) => {
    return transactions.filter(t => t.envelope === `${category}.${name}`).length;
  };

  return (
    <div className="user-profile-modal" onClick={onClose}>
      <div className="profile-container" onClick={e => e.stopPropagation()}>
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-details">
              <h2>Profile Settings</h2>
              <p>{user?.email}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'payment-methods' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          💳 Payment
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'payment-methods' && (
          <div className="payment-methods-tab">
            <PaymentMethodsManager
              paymentMethods={paymentMethods}
              onAdd={onAddPaymentMethod}
              onDelete={onDeletePaymentMethod}
              transactions={transactions}
            />
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-manager">
            <h3>Settings</h3>
            
            <div className="preference-section">
              <h4>👤 Account</h4>
              <div className="preference-item">
                <label>Email</label>
                <input type="text" value={user?.email || ''} disabled />
              </div>
              <div className="preference-item">
                <label>User ID</label>
                <input type="text" value={user?.uid?.substring(0, 20) + '...' || ''} disabled />
              </div>
            </div>

            <div className="preference-section">
              <h4>💾 Data Management</h4>
              <div className="preference-actions">
                <button className="btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('openBackup'))}>
                  🛡️ Backup & Restore
                </button>
                <button className="btn-secondary" onClick={() => onShowNotification('info', 'Export feature coming soon!')}>
                  📥 Export Data
                </button>
                <button className="btn-secondary" onClick={() => onShowNotification('info', 'Import feature coming soon!')}>
                  📤 Import Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default UserProfile;
