// Firebase Service - Modern SDK (v9+)
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration (use environment variables in production)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkVbVhmFA301ZERkgNuxzfkjxzmlpe7Uk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "goal-planner-b604e.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://goal-planner-b604e-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "goal-planner-b604e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "goal-planner-b604e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "82233624728",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:82233624728:web:49b5d083a39237d987e8ed",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZJRQEGH25W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Auto sign-in anonymously
signInAnonymously(auth).catch(error => {
  console.error('Auth error:', error);
});

// Firebase Service Class
class FirebaseService {
  
  // ── Transactions ──────────────────────────────────────────────
  
  static async addTransaction(transactionData) {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid
      });
      console.log('Transaction added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  static async updateTransaction(docId, updates) {
    try {
      const docRef = doc(db, 'transactions', docId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('Transaction updated');
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async deleteTransaction(docId) {
    try {
      await deleteDoc(doc(db, 'transactions', docId));
      console.log('Transaction deleted');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  static async getTransactions(limitCount = 100) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];

      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static listenToTransactions(callback, limitCount = 100) {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      callback(transactions);
    });
  }

  // ── Payment Methods ───────────────────────────────────────────
  
  static async addPaymentMethod(methodName) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        paymentMethods: arrayUnion(methodName),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      if (error.code === 'not-found') {
        await setDoc(userRef, {
          paymentMethods: [methodName],
          createdAt: serverTimestamp()
        }, { merge: true });
      } else {
        throw error;
      }
    }
  }

  static async removePaymentMethod(methodName) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      paymentMethods: arrayRemove(methodName),
      updatedAt: serverTimestamp()
    });
  }

  // ── Envelopes ─────────────────────────────────────────────────
  
  static async addEnvelope(envelopeData) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const docRef = await addDoc(collection(db, 'envelopes'), {
      ...envelopeData,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async updateEnvelope(docId, updates) {
    const docRef = doc(db, 'envelopes', docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteEnvelope(docId) {
    await deleteDoc(doc(db, 'envelopes', docId));
  }

  // ── Budgets ───────────────────────────────────────────────────
  
  static async updateBudget(envelopeId, spentAmount) {
    try {
      await runTransaction(db, async (transaction) => {
        const budgetRef = doc(db, 'budgets', envelopeId);
        const budgetDoc = await transaction.get(budgetRef);

        if (budgetDoc.exists()) {
          transaction.update(budgetRef, {
            spent: increment(spentAmount),
            lastUpdated: serverTimestamp()
          });
        } else {
          transaction.set(budgetRef, {
            spent: spentAmount,
            createdAt: serverTimestamp(),
            userId: auth.currentUser?.uid
          });
        }
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // ── Auth ──────────────────────────────────────────────────────
  
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser() {
    return auth.currentUser;
  }
}

export { FirebaseService, auth, db };
export default FirebaseService;
