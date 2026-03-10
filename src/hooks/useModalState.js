import { useState, useCallback } from 'react';

export const useModalState = () => {
  const [transferModal, setTransferModal] = useState({ show: false, from: '', to: '', amount: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ type: '', id: '', name: '' });

  const openTransferModal = useCallback(() => {
    setTransferModal({ show: true, from: '', to: '', amount: '' });
  }, []);

  const closeTransferModal = useCallback(() => {
    setTransferModal({ show: false, from: '', to: '', amount: '' });
  }, []);

  const updateTransferModal = useCallback((updates) => {
    setTransferModal(prev => ({ ...prev, ...updates }));
  }, []);

  const openDeleteConfirm = useCallback((type, id, name) => {
    setDeleteConfirm({ type, id, name });
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm({ type: '', id: '', name: '' });
  }, []);

  return {
    transferModal,
    openTransferModal,
    closeTransferModal,
    updateTransferModal,
    deleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm
  };
};
