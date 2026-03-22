// ─── Firebase Configuration & Initialization ───────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyDkVbVhmFA301ZERkgNuxzfkjxzmlpe7Uk",
  authDomain: "goal-planner-b604e.firebaseapp.com",
  databaseURL: "https://goal-planner-b604e-default-rtdb.firebaseio.com",
  projectId: "goal-planner-b604e",
  storageBucket: "goal-planner-b604e.firebasestorage.app",
  messagingSenderId: "82233624728",
  appId: "1:82233624728:web:49b5d083a39237d987e8ed",
  measurementId: "G-ZJRQEGH25W"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ─── Safe Firebase Operations — NEVER OVERRIDE DATA ────────────────────────

class SafeFirebaseOps {

  // Add new transaction (never overrides)
  static async addTransaction(transactionData) {
    try {
      const docRef = await db.collection('transactions').add({
        ...transactionData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: auth.currentUser?.uid
      });
      console.log('Transaction added safely:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Update existing transaction (only specified fields)
  static async updateTransaction(docId, updates) {
    try {
      const docRef = db.collection('transactions').doc(docId);
      const doc = await docRef.get();

      if (!doc.exists) throw new Error('Transaction does not exist');

      // Only update allowed fields, never override entire document
      const allowedFields = ['amount', 'description', 'envelope', 'paymentMethod'];
      const safeUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) safeUpdates[key] = updates[key];
      });

      safeUpdates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      await docRef.update(safeUpdates);
      console.log('Transaction updated safely');
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Add payment method to user (never overrides array)
  static async addPaymentMethod(methodName) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    try {
      await db.collection('users').doc(userId).update({
        paymentMethods: firebase.firestore.FieldValue.arrayUnion(methodName),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Payment method added safely');
    } catch (error) {
      if (error.code === 'not-found') {
        await db.collection('users').doc(userId).set({
          paymentMethods: [methodName],
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } else {
        throw error;
      }
    }
  }

  // Remove payment method (never overrides array)
  static async removePaymentMethod(methodName) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await db.collection('users').doc(userId).update({
        paymentMethods: firebase.firestore.FieldValue.arrayRemove(methodName),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Payment method removed safely');
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Update budget (increment only, never override)
  static async updateBudget(envelopeId, spentAmount) {
    try {
      await db.runTransaction(async (transaction) => {
        const budgetRef = db.collection('budgets').doc(envelopeId);
        const budgetDoc = await transaction.get(budgetRef);

        if (budgetDoc.exists) {
          transaction.update(budgetRef, {
            spent: firebase.firestore.FieldValue.increment(spentAmount),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          transaction.set(budgetRef, {
            spent: spentAmount,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userId: auth.currentUser?.uid
          });
        }
      });
      console.log('Budget updated safely');
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // Add habit completion (never overrides)
  static async addHabitCompletion(habitId, date) {
    try {
      const completionRef = db.collection('habitCompletions').doc(`${habitId}_${date}`);
      const doc = await completionRef.get();

      if (!doc.exists) {
        await completionRef.set({
          habitId,
          date,
          completedAt: firebase.firestore.FieldValue.serverTimestamp(),
          userId: auth.currentUser?.uid
        });
        await this.updateHabitStreak(habitId, 1);
        console.log('Habit completion added safely');
      }
    } catch (error) {
      console.error('Error adding habit completion:', error);
      throw error;
    }
  }

  // Update habit streak (increment only)
  static async updateHabitStreak(habitId, increment) {
    try {
      await db.collection('habits').doc(habitId).update({
        currentStreak: firebase.firestore.FieldValue.increment(increment),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating habit streak:', error);
      throw error;
    }
  }

  // Get transactions (read-only)
  static async getTransactions(limit = 10) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];

      const snapshot = await db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Listen to real-time transaction updates (read-only)
  static listenToTransactions(callback) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    return db.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(callback);
  }
}
