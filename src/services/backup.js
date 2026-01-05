import { ref, get } from 'firebase/database';
import { database } from '../config/firebase.js';

export const backupTransactions = async (userId) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const backup = {
        timestamp: new Date().toISOString(),
        userId,
        data
      };
      
      // Create downloadable backup
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      return { success: true };
    }
    return { success: false, error: 'No data found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};