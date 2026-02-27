import { ref, get, set } from 'firebase/database';
import { database } from '../config/firebase';

export class AutoBackupService {
  constructor() {
    this.backupInterval = null;
    this.lastBackup = null;
  }

  // Auto-backup every 5 minutes
  startAutoBackup(userId) {
    this.stopAutoBackup();
    
    this.backupInterval = setInterval(() => {
      this.createBackup(userId, 'auto');
    }, 5 * 60 * 1000);

    // Initial backup
    this.createBackup(userId, 'initial');
  }

  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  async createBackup(userId, type = 'manual') {
    try {
      const timestamp = Date.now();
      const userDataRef = ref(database, `users/${userId}`);
      const snapshot = await get(userDataRef);

      if (!snapshot.exists()) return;

      const data = snapshot.val();
      
      // Firebase backup
      await set(ref(database, `backups/${userId}/${timestamp}`), {
        data,
        type,
        timestamp,
        date: new Date().toISOString()
      });

      // LocalStorage backup
      const localBackups = JSON.parse(localStorage.getItem('backups') || '{}');
      localBackups[timestamp] = { data, type, timestamp };
      
      // Keep last 10 backups in localStorage
      const backupKeys = Object.keys(localBackups).sort().slice(-10);
      const trimmedBackups = {};
      backupKeys.forEach(key => trimmedBackups[key] = localBackups[key]);
      
      localStorage.setItem('backups', JSON.stringify(trimmedBackups));
      this.lastBackup = timestamp;

      console.log(`✓ Backup created: ${type} at ${new Date(timestamp).toLocaleString()}`);
      return { success: true, timestamp };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  async listBackups(userId) {
    try {
      const backupsRef = ref(database, `backups/${userId}`);
      const snapshot = await get(backupsRef);
      
      if (!snapshot.exists()) return [];

      return Object.entries(snapshot.val()).map(([timestamp, backup]) => ({
        timestamp: parseInt(timestamp),
        type: backup.type,
        date: backup.date
      })).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('List backups failed:', error);
      return [];
    }
  }

  async restoreBackup(userId, timestamp) {
    try {
      const backupRef = ref(database, `backups/${userId}/${timestamp}`);
      const snapshot = await get(backupRef);

      if (!snapshot.exists()) {
        throw new Error('Backup not found');
      }

      const backup = snapshot.val();
      await set(ref(database, `users/${userId}`), backup.data);

      console.log(`✓ Restored backup from ${backup.date}`);
      return { success: true };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }

  getLocalBackups() {
    return JSON.parse(localStorage.getItem('backups') || '{}');
  }

  async restoreFromLocal(userId, timestamp) {
    const backups = this.getLocalBackups();
    const backup = backups[timestamp];

    if (!backup) throw new Error('Local backup not found');

    await set(ref(database, `users/${userId}`), backup.data);
    return { success: true };
  }
}

export const autoBackup = new AutoBackupService();
