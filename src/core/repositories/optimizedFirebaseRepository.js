import { ref, set, get, push, query, orderByChild, limitToLast, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import { safeWrite } from '../../services/safeWrite';

export class OptimizedFirebaseRepository {
  // Income operations
  async saveIncome(userId, period, income) {
    await safeWrite.safeWrite(`users/${userId}/income/${period}`, income, userId);
  }

  async getIncome(userId, period) {
    const incomeRef = ref(database, `users/${userId}/income/${period}`);
    const snapshot = await get(incomeRef);
    return snapshot.exists() ? snapshot.val() : 0;
  }

  // Envelope operations
  async saveEnvelopes(userId, period, envelopes) {
    await safeWrite.safeWrite(`users/${userId}/envelopes/${period}`, envelopes, userId);
  }

  async getEnvelopes(userId, period) {
    const envelopesRef = ref(database, `users/${userId}/envelopes/${period}`);
    const snapshot = await get(envelopesRef);
    return snapshot.exists() ? snapshot.val() : {};
  }

  // Transaction operations - optimized with pagination
  async addTransaction(userId, period, transaction) {
    const transactionsRef = ref(database, `users/${userId}/transactions/${period}`);
    const newTransactionRef = push(transactionsRef);
    await set(newTransactionRef, {
      ...transaction,
      id: newTransactionRef.key,
      timestamp: Date.now()
    });
    return newTransactionRef.key;
  }

  async getRecentTransactions(userId, period, limit = 50) {
    const transactionsRef = ref(database, `users/${userId}/transactions/${period}`);
    const recentQuery = query(transactionsRef, orderByChild('timestamp'), limitToLast(limit));
    const snapshot = await get(recentQuery);
    
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...data
    })).reverse();
  }

  async deleteTransaction(userId, period, transactionId) {
    const transactionRef = ref(database, `users/${userId}/transactions/${period}/${transactionId}`);
    await remove(transactionRef);
  }

  // Payment methods
  async savePaymentMethods(userId, methods) {
    await safeWrite.safeWrite(`users/${userId}/paymentMethods`, methods, userId);
  }

  async getPaymentMethods(userId) {
    const methodsRef = ref(database, `users/${userId}/paymentMethods`);
    const snapshot = await get(methodsRef);
    return snapshot.exists() ? snapshot.val() : [];
  }

  // Batch save for period data
  async savePeriodData(userId, period, { income, envelopes }) {
    const updates = {};
    if (income !== undefined) updates[`users/${userId}/income/${period}`] = income;
    if (envelopes) updates[`users/${userId}/envelopes/${period}`] = envelopes;
    
    await Promise.all(
      Object.entries(updates).map(([path, data]) => set(ref(database, path), data))
    );
  }

  // Load all period data efficiently
  async loadPeriodData(userId, period) {
    const [income, envelopes, transactions] = await Promise.all([
      this.getIncome(userId, period),
      this.getEnvelopes(userId, period),
      this.getRecentTransactions(userId, period)
    ]);

    return { income, envelopes, transactions };
  }
}
