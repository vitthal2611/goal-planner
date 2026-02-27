import { ref, get, set, runTransaction } from 'firebase/database';
import { database } from '../config/firebase';

export class SafeWriteService {
  async safeWrite(path, newData, userId) {
    const dataRef = ref(database, path);
    
    try {
      // 1. Read current data
      const snapshot = await get(dataRef);
      const oldData = snapshot.exists() ? snapshot.val() : null;

      // 2. Create snapshot backup
      if (oldData) {
        const backupPath = `snapshots/${userId}/${Date.now()}`;
        await set(ref(database, backupPath), {
          path,
          data: oldData,
          timestamp: Date.now()
        });
      }

      // 3. Write new data
      await set(dataRef, newData);

      // 4. Verify write
      const verifySnapshot = await get(dataRef);
      if (!verifySnapshot.exists() || JSON.stringify(verifySnapshot.val()) !== JSON.stringify(newData)) {
        // Rollback on verification failure
        if (oldData) await set(dataRef, oldData);
        throw new Error('Write verification failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Safe write failed:', error);
      throw error;
    }
  }

  async transactionalUpdate(path, updateFn) {
    const dataRef = ref(database, path);
    
    return runTransaction(dataRef, (current) => {
      if (current === null) return null;
      return updateFn(current);
    });
  }

  async cleanupSnapshots(userId, olderThanDays = 7) {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const snapshotsRef = ref(database, `snapshots/${userId}`);
    const snapshot = await get(snapshotsRef);

    if (!snapshot.exists()) return;

    const snapshots = snapshot.val();
    const toDelete = Object.keys(snapshots).filter(ts => parseInt(ts) < cutoff);

    for (const ts of toDelete) {
      await set(ref(database, `snapshots/${userId}/${ts}`), null);
    }

    console.log(`✓ Cleaned ${toDelete.length} old snapshots`);
  }
}

export const safeWrite = new SafeWriteService();
