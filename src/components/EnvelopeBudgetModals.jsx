import React from 'react';
import { Modal, ConfirmDialog } from './ui/Modal';
import UserProfile from './UserProfile';

export const EnvelopeBudgetModals = ({
  transferModal,
  onTransferModalClose,
  onTransferModalUpdate,
  onTransfer,
  paymentMethods,
  deleteConfirm,
  onDeleteConfirmClose,
  onDeleteEnvelope,
  showUserProfile,
  onUserProfileClose,
  user,
  paymentMethodsData,
  envelopes,
  transactions,
  onAddPaymentMethod,
  onDeletePaymentMethod,
  onAddEnvelope,
  onShowNotification
}) => {
  return (
    <>
      <Modal 
        isOpen={transferModal.show} 
        onClose={onTransferModalClose}
        title="🔄 Transfer Between Payment Methods"
        size="small"
      >
        <div style={{ margin: '20px 0' }}>
          <div style={{ marginBottom: '15px' }}>
            <label>From:</label>
            <select 
              value={transferModal.from} 
              onChange={(e) => onTransferModalUpdate({ from: e.target.value })} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select source</option>
              {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>To:</label>
            <select 
              value={transferModal.to} 
              onChange={(e) => onTransferModalUpdate({ to: e.target.value })} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select destination</option>
              {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Amount:</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="₹ Amount" 
              value={transferModal.amount} 
              onChange={(e) => onTransferModalUpdate({ amount: e.target.value })} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onTransferModalClose}>Cancel</button>
          <button className="btn btn-success" onClick={onTransfer}>Transfer</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.type === 'envelope'}
        onClose={onDeleteConfirmClose}
        title="Confirm Delete"
        message={`Delete envelope "${deleteConfirm.name}"?`}
        onConfirm={() => {
          const [cat, name] = deleteConfirm.id.split('.');
          onDeleteEnvelope(cat, name);
          onDeleteConfirmClose();
        }}
        confirmText="Delete"
        isDangerous={true}
      />

      {showUserProfile && (
        <div className="modal-overlay" onClick={onUserProfileClose}>
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfile
              user={user}
              paymentMethods={paymentMethodsData}
              envelopes={envelopes}
              transactions={transactions}
              onAddPaymentMethod={onAddPaymentMethod}
              onDeletePaymentMethod={onDeletePaymentMethod}
              onAddEnvelope={onAddEnvelope}
              onDeleteEnvelope={onDeleteEnvelope}
              onClose={onUserProfileClose}
              onShowNotification={onShowNotification}
            />
          </div>
        </div>
      )}
    </>
  );
};
