import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import CSVImport from './CSVImport';
import DataManager from './DataManager';
import './DataManager.css';
import toast from 'react-hot-toast';

export default function SettingsModal({ onClose }) {
  const { user } = useAuthStore();
  const { paymentMethods, envelopes, addPaymentMethod, deletePaymentMethod, addEnvelope, deleteEnvelope } = useFinanceStore();
  const [newPayment, setNewPayment] = useState('');
  const [newEnvelope, setNewEnvelope] = useState('');

  const handleAddPayment = () => {
    if (!newPayment.trim()) return;
    addPaymentMethod(newPayment.trim(), user.uid);
    setNewPayment('');
    toast.success('Payment method added');
  };

  const handleAddEnvelope = () => {
    if (!newEnvelope.trim()) return;
    addEnvelope(newEnvelope.trim(), user.uid);
    setNewEnvelope('');
    toast.success('Category added');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-section">
          <h3 className="section-title">Payment Methods</h3>
          <div className="list-container">
            {paymentMethods.map(method => (
              <div key={method} className="list-item">
                <span>{method}</span>
                <button
                  className="delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete ${method}?`)) {
                      deletePaymentMethod(method, user.uid);
                      toast.error('Payment method deleted');
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="add-form">
            <input
              type="text"
              placeholder="New payment method"
              value={newPayment}
              onChange={(e) => setNewPayment(e.target.value)}
              className="add-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddPayment()}
            />
            <button className="add-btn" onClick={handleAddPayment}>Add</button>
          </div>
        </div>

        <div className="modal-section">
          <h3 className="section-title">Categories</h3>
          <div className="list-container">
            {envelopes.map(env => (
              <div key={env} className="list-item">
                <span>{env}</span>
                <button
                  className="delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete ${env}?`)) {
                      deleteEnvelope(env, user.uid);
                      toast.error('Category deleted');
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="add-form">
            <input
              type="text"
              placeholder="New category"
              value={newEnvelope}
              onChange={(e) => setNewEnvelope(e.target.value)}
              className="add-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddEnvelope()}
            />
            <button className="add-btn" onClick={handleAddEnvelope}>Add</button>
          </div>
        </div>

        <div className="modal-section">
          <CSVImport />
        </div>

        <div className="modal-section">
          <DataManager />
        </div>
      </div>
    </div>
  );
}
