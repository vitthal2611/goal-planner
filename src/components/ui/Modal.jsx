import React from 'react';

export const Modal = ({ isOpen, onClose, title, children, actions, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizeStyles = {
    small: { maxWidth: '400px' },
    medium: { maxWidth: '600px' },
    large: { maxWidth: '900px' }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal mobile-optimized" style={sizeStyles[size]} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {title && <h3>{title}</h3>}
        <div className="modal-content">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
        <button className={`btn ${isDangerous ? 'btn-danger' : 'btn-success'}`} onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  );
};
