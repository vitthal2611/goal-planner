import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { firestoreService } from '../services/firestore';

const fromFirestoreDate = (timestamp) => timestamp?.toDate ? timestamp.toDate() : timestamp;

export const useFirestoreGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'goals'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          startDate: fromFirestoreDate(d.startDate),
          endDate: fromFirestoreDate(d.endDate),
          createdAt: fromFirestoreDate(d.createdAt)
        };
      });
      setGoals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goalData) => {
    return await firestoreService.addGoal(user.uid, goalData);
  };

  const updateGoal = async (goalId, updates) => {
    await firestoreService.updateGoal(user.uid, goalId, updates);
  };

  const deleteGoal = async (goalId) => {
    await firestoreService.deleteGoal(user.uid, goalId);
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal };
};

export const useFirestoreHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'habits'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: fromFirestoreDate(doc.data().createdAt)
      }));
      setHabits(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addHabit = async (habitData) => {
    return await firestoreService.addHabit(user.uid, habitData);
  };

  const updateHabit = async (habitId, updates) => {
    await firestoreService.updateHabit(user.uid, habitId, updates);
  };

  const deleteHabit = async (habitId) => {
    await firestoreService.deleteHabit(user.uid, habitId);
  };

  return { habits, loading, addHabit, updateHabit, deleteHabit };
};

export const useFirestoreLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'logs'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addLog = async (logData) => {
    return await firestoreService.addLog(user.uid, logData);
  };

  const updateLog = async (logId, updates) => {
    await firestoreService.updateLog(user.uid, logId, updates);
  };

  const deleteLog = async (logId) => {
    await firestoreService.deleteLog(user.uid, logId);
  };

  const toggleHabitStatus = async (habitId, date, currentStatus) => {
    const existingLog = await firestoreService.getLogByHabitAndDate(user.uid, habitId, date);
    if (existingLog) {
      const newStatus = currentStatus === 'done' ? 'skipped' : 'done';
      await updateLog(existingLog.id, { status: newStatus });
    } else {
      await addLog({ habitId, date, status: 'done' });
    }
  };

  return { logs, loading, addLog, updateLog, deleteLog, toggleHabitStatus };
};
