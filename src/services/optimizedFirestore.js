import { writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const batchOperations = {
  async batchUpdateGoals(userId, updates) {
    const batch = writeBatch(db);
    updates.forEach(({ goalId, data }) => {
      const ref = doc(db, 'users', userId, 'goals', goalId);
      batch.update(ref, data);
    });
    await batch.commit();
  },

  async batchAddLogs(userId, logs) {
    const batch = writeBatch(db);
    logs.forEach(logData => {
      const ref = doc(db, 'users', userId, 'logs', logData.id);
      batch.set(ref, logData);
    });
    await batch.commit();
  },

  async batchDeleteHabits(userId, habitIds) {
    const batch = writeBatch(db);
    habitIds.forEach(habitId => {
      const ref = doc(db, 'users', userId, 'habits', habitId);
      batch.delete(ref);
    });
    await batch.commit();
  }
};

export const optimizedQueries = {
  cacheConfig: {
    source: 'cache'
  },

  serverConfig: {
    source: 'server'
  }
};
