import React, { useContext, useState } from 'react';
import { BudgetContext } from '../contexts/AppContext.jsx';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { addEnvelope, addPaymentMethod, envelopes, paymentMethods } = useContext(BudgetContext);
  const [envelopeName, setEnvelopeName] = useState('');
  const [paymentName, setPaymentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddEnvelope = async (e) => {
    e.preventDefault();
    if (!envelopeName.trim()) {
      setError('Envelope name required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addEnvelope(envelopeName);
      setEnvelopeName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!paymentName.trim()) {
      setError('Payment method name required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addPaymentMethod(paymentName);
      setPaymentName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <h2>Profile Settings</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="settings-section">
        <h3>Envelopes (Categories)</h3>
        <form onSubmit={handleAddEnvelope} className="add-form">
          <input
            type="text"
            value={envelopeName}
            onChange={(e) => setEnvelopeName(e.target.value)}
            placeholder="New envelope name"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Envelope'}
          </button>
        </form>
        <div className="items-list">
          {envelopes.map(env => (
            <div key={env.name} className="item">
              {env.name}
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Payment Methods</h3>
        <form onSubmit={handleAddPaymentMethod} className="add-form">
          <input
            type="text"
            value={paymentName}
            onChange={(e) => setPaymentName(e.target.value)}
            placeholder="New payment method"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Payment Method'}
          </button>
        </form>
        <div className="items-list">
          {paymentMethods.map(pm => (
            <div key={pm.name} className="item">
              {pm.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
