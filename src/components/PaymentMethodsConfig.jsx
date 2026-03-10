import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService.js';

const PaymentMethodsConfig = ({ onClose, onUpdate }) => {
  const [methods, setMethods] = useState([]);
  const [newMethod, setNewMethod] = useState({ name: '', type: 'card' });
  const [loading, setLoading] = useState(false);

  const dataService = new DataService();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      await dataService.initialize();
      const result = await dataService.loadData();
      if (result.success) {
        setMethods(result.data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!newMethod.name.trim()) return;

    setLoading(true);
    try {
      const result = await dataService.savePaymentMethod({
        name: newMethod.name.trim(),
        type: newMethod.type,
        active: true
      });

      if (result.success) {
        const updatedMethods = [...methods, newMethod.name.trim()];
        setMethods(updatedMethods);
        setNewMethod({ name: '', type: 'card' });
        onUpdate(updatedMethods);
      }
    } catch (error) {
      console.error('Failed to add payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px' }}>💳 Payment Methods</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Current Methods */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#666' }}>
            Current Methods
          </h4>
          {methods.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              No payment methods configured
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {methods.map((method, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: '500' }}>{method}</span>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Method */}
        <div>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#666' }}>
            Add New Method
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Method name (e.g., HDFC, SBI Credit Card)"
              value={newMethod.name}
              onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <select
              value={newMethod.type}
              onChange={(e) => setNewMethod(prev => ({ ...prev, type: e.target.value }))}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="card">Credit/Debit Card</option>
              <option value="bank">Bank Account</option>
              <option value="wallet">Digital Wallet</option>
              <option value="cash">Cash</option>
            </select>
            <button
              onClick={handleAddMethod}
              disabled={loading || !newMethod.name.trim()}
              style={{
                padding: '12px',
                backgroundColor: loading || !newMethod.name.trim() ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: loading || !newMethod.name.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding...' : 'Add Method'}
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0066cc'
        }}>
          💡 <strong>Tip:</strong> Payment methods are saved to your Google Sheet and will be available across all your devices.
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsConfig;