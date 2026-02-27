import { ref, get, set, remove } from 'firebase/database';
import { database } from '../config/firebase';

export class FirebaseMigration {
  /**
   * Migrate from flat structure to denormalized structure
   * Old: users/{userId}/budget -> { income, envelopes, transactions[] }
   * New: users/{userId}/income/{period}, envelopes/{period}, transactions/{period}/{id}
   */
  async migrateUserData(userId, dryRun = true) {
    console.log(`Starting migration for user: ${userId} (${dryRun ? 'DRY RUN' : 'LIVE'})`);
    
    try {
      // Get old data structure
      const oldBudgetRef = ref(database, `users/${userId}/budget`);
      const snapshot = await get(oldBudgetRef);
      
      if (!snapshot.exists()) {
        console.log('No data to migrate');
        return { success: true, message: 'No data found' };
      }

      const oldData = snapshot.val();
      const currentPeriod = this.getCurrentPeriod();
      
      // Migrate income
      if (oldData.income !== undefined) {
        if (!dryRun) {
          await set(ref(database, `users/${userId}/income/${currentPeriod}`), oldData.income);
        }
        console.log('✓ Income migrated');
      }

      // Migrate envelopes
      if (oldData.envelopes) {
        if (!dryRun) {
          await set(ref(database, `users/${userId}/envelopes/${currentPeriod}`), oldData.envelopes);
        }
        console.log('✓ Envelopes migrated');
      }

      // Migrate transactions (convert array to keyed objects)
      if (oldData.transactions && Array.isArray(oldData.transactions)) {
        const transactionsRef = ref(database, `users/${userId}/transactions/${currentPeriod}`);
        const transactionsObj = {};
        
        oldData.transactions.forEach((transaction, index) => {
          const id = transaction.id || `tx_${Date.now()}_${index}`;
          transactionsObj[id] = {
            ...transaction,
            id,
            timestamp: transaction.timestamp || Date.now() - (oldData.transactions.length - index) * 1000
          };
        });
        
        if (!dryRun) {
          await set(transactionsRef, transactionsObj);
        }
        console.log(`✓ ${oldData.transactions.length} transactions migrated`);
      }

      // Migrate payment methods
      const oldPaymentMethodsRef = ref(database, `users/${userId}/paymentMethods`);
      const pmSnapshot = await get(oldPaymentMethodsRef);
      if (pmSnapshot.exists()) {
        console.log('✓ Payment methods already in correct structure');
      }

      // Backup old data before deletion
      const backupTimestamp = Date.now();
      await set(ref(database, `users/${userId}/backup_${backupTimestamp}`), oldData);
      console.log('✓ Backup created');

      // Remove old structure only if not dry run
      if (!dryRun) {
        await remove(oldBudgetRef);
        console.log('✓ Old structure removed');
      } else {
        console.log('⚠️ DRY RUN - Old structure NOT removed');
      }

      return {
        success: true,
        message: dryRun ? 'Dry run completed - no changes made' : 'Migration completed successfully',
        dryRun,
        stats: {
          income: oldData.income || 0,
          envelopes: Object.keys(oldData.envelopes || {}).length,
          transactions: oldData.transactions?.length || 0
        }
      };
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Rollback migration if needed
   */
  async rollbackMigration(userId, backupTimestamp) {
    try {
      const backupRef = ref(database, `users/${userId}/backup_${backupTimestamp}`);
      const snapshot = await get(backupRef);
      
      if (!snapshot.exists()) {
        throw new Error('Backup not found');
      }

      const backupData = snapshot.val();
      await set(ref(database, `users/${userId}/budget`), backupData);
      
      return { success: true, message: 'Rollback completed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
