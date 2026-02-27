import React, { useState, useEffect } from 'react';
import { useDataProtection } from '../hooks/useDataProtection';

export const BackupManager = ({ userId, repository }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [backups, setBackups] = useState([]);
  const [status, setStatus] = useState(null);
  const { createBackup, restoreBackup, listBackups, checkIntegrity, getOfflineStatus, lastBackup } = useDataProtection(userId, repository);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openBackup', handleOpen);
    return () => window.removeEventListener('openBackup', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) loadBackups();
  }, [isOpen]);

  const loadBackups = async () => {
    const list = await listBackups();
    setBackups(list);
  };

  const handleBackup = async () => {
    const result = await createBackup();
    setStatus(result.success ? '✓ Backup created' : '✗ Backup failed');
    loadBackups();
  };

  const handleRestore = async (timestamp) => {
    if (!confirm('Restore this backup? Current data will be replaced.')) return;
    
    const result = await restoreBackup(timestamp);
    setStatus(result.success ? '✓ Restored' : '✗ Restore failed');
  };

  const handleIntegrityCheck = async () => {
    const result = await checkIntegrity();
    setStatus(result.healthy ? '✓ Data healthy' : `⚠️ Issues: ${result.issues.join(', ')}`);
  };

  const offlineStatus = getOfflineStatus();

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>🛡️ Data Protection</h3>
          <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
          <div><strong>Status:</strong> {navigator.onLine ? '🟢 Online' : '🔴 Offline'}</div>
          {offlineStatus.queueSize > 0 && <div>{offlineStatus.queueSize} pending syncs</div>}
          {lastBackup && <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Last backup: {new Date(lastBackup).toLocaleString()}</div>}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={handleBackup} style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Create Backup</button>
          <button onClick={handleIntegrityCheck} style={{ flex: 1, padding: '10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Check Integrity</button>
        </div>

        {status && <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '15px' }}>{status}</div>}

        <h4 style={{ marginBottom: '10px' }}>Available Backups</h4>
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {backups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No backups yet</div>
          ) : (
            backups.map(backup => (
              <div key={backup.timestamp} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div>{new Date(backup.timestamp).toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{backup.type}</div>
                </div>
                <button onClick={() => handleRestore(backup.timestamp)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
