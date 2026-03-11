import React, { useContext, useState } from 'react';
import { BudgetContext } from '../contexts/BudgetContext.jsx';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { addNewEnvelope, addNewPaymentMethod, envelopes, paymentMethods, refresh } = useContext(BudgetContext);
  const [envelopeInput, setEnvelopeInput] = useState('');
  const [paymentInput, setPaymentInput] = useState('');
  const [paymentType, setPaymentType] = useState('Bank');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddEnvelope = async (e) => {
    e.preventDefault();
    if (!envelopeInput.trim()) {
      setMessage('Please enter envelope name');
      return;
    }

    if (envelopes.includes(envelopeInput)) {
      setMessage('Envelope already exists');
      return;
    }

    try {
      setLoading(true);
      await addNewEnvelope(envelopeInput);
      setEnvelopeInput('');
      setMessage('Envelope added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!paymentInput.trim()) {
      setMessage('Please enter payment method name');
      return;
    }

    if (paymentMethods.find(m => m.name === paymentInput)) {
      setMessage('Payment method already exists');
      return;
    }

    try {
      setLoading(true);
      await addNewPaymentMethod(paymentInput, paymentType);
      setPaymentInput('');
      setPaymentType('Bank');
      setMessage('Payment method added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="settings-section">
        <h3>📁 Manage Envelopes (Categories)</h3>
        <form onSubmit={handleAddEnvelope} className="settings-form">
          <div className="form-group">
            <input
              type="text"
              value={envelopeInput}
              onChange={(e) => setEnvelopeInput(e.target.value)}
              placeholder="e.g., EMI, Groceries, Entertainment"
              maxLength="50"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Envelope'}
            </button>
          </div>
        </form>

        {envelopes.length > 0 && (
          <div className="items-list">
            <h4>Current Envelopes:</h4>
            <div className="items-grid">
              {envelopes.map(envelope => (
                <div key={envelope} className="item-badge">
                  📁 {envelope}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>💳 Manage Payment Methods</h3>
        <form onSubmit={handleAddPaymentMethod} className="settings-form">
          <div className="form-group">
            <input
              type="text"
              value={paymentInput}
              onChange={(e) => setPaymentInput(e.target.value)}
              placeholder="e.g., HDFC Bank, SBI Credit Card"
              maxLength="50"
            />
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
              <option value="Bank">Bank</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Wallet">Wallet</option>
              <option value="Cash">Cash</option>
            </select>
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Method'}
            </button>
          </div>
        </form>

        {paymentMethods.length > 0 && (
          <div className="items-list">
            <h4>Current Payment Methods:</h4>
            <div className="payment-methods-grid">
              {paymentMethods.map(method => (
                <div key={method.name} className="payment-item">
                  <div className="payment-name">💳 {method.name}</div>
                  <div className="payment-type">{method.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
