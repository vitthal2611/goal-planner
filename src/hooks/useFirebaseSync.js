import { useEffect, useState } from 'react';
import { doc, setDoc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase';

const serializeData = (data) => {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(serializeData);
  if (typeof data === 'object' && data.constructor === Object) {
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value);
    }
    return serialized;
  }
  return data;
};

export const useFirebaseSync = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const saveData = async (goals, habits, logs, reviews, envelopes, transactions, monthlyBudgets, selectedMonth) => {
    if (!user) return;
    setSyncing(true);
    try {
      const dataToSave = {
        updatedAt: Timestamp.now()
      };
      
      if (envelopes && envelopes.length > 0) dataToSave.envelopes = serializeData(envelopes);
      if (transactions && transactions.length > 0) dataToSave.transactions = serializeData(transactions);
      if (monthlyBudgets && Object.keys(monthlyBudgets).length > 0) dataToSave.monthlyBudgets = serializeData(monthlyBudgets);
      if (selectedMonth) dataToSave.selectedMonth = selectedMonth;
      
      await setDoc(doc(db, 'users', user.uid), dataToSave, { merge: true });
    } catch (error) {
      console.error('Save error:', error);
    }
    setSyncing(false);
  };

  const loadData = async () => {
    if (!user) return null;
    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Load error:', error);
      return null;
    }
  };

  const subscribeToData = (callback) => {
    if (!user) return () => {};
    return onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  };

  return {
    user,
    loading,
    syncing,
    signIn,
    signOut: signOutUser,
    saveData,
    loadData,
    subscribeToData
  };
};
