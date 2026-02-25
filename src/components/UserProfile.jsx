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
    <div className="user-profile-modal">
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
          💳 Payment Methods
        </button>
        <button 
          className={`tab ${activeTab === 'envelopes' ? 'active' : ''}`}
          onClick={() => setActiveTab('envelopes')}
        >
          📁 Envelopes
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'payment-methods' && (
          <PaymentMethodsManager
            paymentMethods={paymentMethods}
            onAdd={onAddPaymentMethod}
            onDelete={onDeletePaymentMethod}
            transactions={transactions}
            onClose={() => {}}
          />
        )}

        {activeTab === 'envelopes' && (
          <div className="envelopes-manager">
            <h3>Manage Envelopes</h3>
            <p className="info-text">Envelopes are global and apply to all months</p>
            
            {Object.keys(envelopes).map(category => (
              <div key={category} className="envelope-category">
                <h4>
                  {category === 'needs' ? '🏠 Needs' :
                   category === 'savings' ? '💰 Savings' : '🎯 Wants'}
                </h4>
                <div className="envelope-list">
                  {Object.keys(envelopes[category]).map(name => {
                    const usage = getEnvelopeUsage(category, name);
                    return (
                      <div key={name} className="envelope-item">
                        <span className="envelope-name">{name.toUpperCase()}</span>
                        {usage > 0 && (
                          <span className="usage-badge">{usage} transactions</span>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => {
                            if (usage > 0) {
                              onShowNotification('error', `Cannot delete ${name}. It has ${usage} transactions.`);
                            } else {
                              onDeleteEnvelope(category, name);
                            }
                          }}
                          disabled={usage > 0}
                          title={usage > 0 ? 'Cannot delete - has transactions' : 'Delete envelope'}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="add-envelope-section">
              <h4>Add New Envelope</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const category = formData.get('category');
                const name = formData.get('name');
                if (category && name) {
                  onAddEnvelope(category, name);
                  e.target.reset();
                }
              }}>
                <select name="category" required>
                  <option value="">Select Category</option>
                  <option value="needs">🏠 Needs</option>
                  <option value="savings">💰 Savings</option>
                  <option value="wants">🎯 Wants</option>
                </select>
                <input
                  type="text"
                  name="name"
                  placeholder="Envelope name"
                  required
                  maxLength={30}
                />
                <button type="submit" className="btn-add">➕ Add</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-manager">
            <h3>Preferences</h3>
            
            <div className="preference-section">
              <h4>Account Information</h4>
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
              <h4>Data Management</h4>
              <div className="preference-actions">
                <button className="btn-secondary" onClick={() => onShowNotification('info', 'Export feature coming soon!')}>
                  📥 Export Data
                </button>
                <button className="btn-secondary" onClick={() => onShowNotification('info', 'Import feature coming soon!')}>
                  📤 Import Data
                </button>
                <button className="btn-secondary" onClick={() => onShowNotification('info', 'Backup feature coming soon!')}>
                  💾 Backup Data
                </button>
              </div>
            </div>

            <div className="preference-section">
              <h4>Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{paymentMethods.length}</span>
                  <span className="stat-label">Payment Methods</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {Object.values(envelopes).reduce((sum, cat) => sum + Object.keys(cat).length, 0)}
                  </span>
                  <span className="stat-label">Envelopes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{transactions.length}</span>
                  <span className="stat-label">Transactions</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
