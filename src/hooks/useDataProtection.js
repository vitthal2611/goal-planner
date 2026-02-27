import { useEffect, useCallback } from 'react';
import { autoBackup } from '../services/autoBackup';
import { offlineQueue } from '../services/offlineQueue';
import { integrityChecker } from '../utils/dataIntegrity';

export const useDataProtection = (userId, repository) => {
  // Start auto-backup on mount
  useEffect(() => {
    if (!userId) return;

    autoBackup.startAutoBackup(userId);
    
    return () => {
      autoBackup.stopAutoBackup();
    };
  }, [userId]);

  // Manual backup
  const createBackup = useCallback(async () => {
    if (!userId) return;
    return await autoBackup.createBackup(userId, 'manual');
  }, [userId]);

  // Restore backup
  const restoreBackup = useCallback(async (timestamp) => {
    if (!userId) return;
    return await autoBackup.restoreBackup(userId, timestamp);
  }, [userId]);

  // List backups
  const listBackups = useCallback(async () => {
    if (!userId) return [];
    return await autoBackup.listBackups(userId);
  }, [userId]);

  // Check data integrity
  const checkIntegrity = useCallback(async () => {
    if (!userId || !repository) return { healthy: true, issues: [] };
    return await integrityChecker.checkDataIntegrity(userId, repository);
  }, [userId, repository]);

  // Get offline queue status
  const getOfflineStatus = useCallback(() => {
    return {
      queueSize: offlineQueue.getQueueSize(),
      isOnline: navigator.onLine
    };
  }, []);

  return {
    createBackup,
    restoreBackup,
    listBackups,
    checkIntegrity,
    getOfflineStatus,
    lastBackup: autoBackup.lastBackup
  };
};
