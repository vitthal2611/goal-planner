import { useEffect, useState } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase';

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

  const saveData = async (goals, habits, logs, reviews) => {
    if (!user) return;
    setSyncing(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        goals,
        habits,
        logs,
        reviews,
        updatedAt: new Date().toISOString()
      });
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
