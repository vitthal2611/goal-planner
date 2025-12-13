import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { breakdownGoalTargets } from '../utils/goalUtils';

const getCollection = (userId, collectionName) => collection(db, 'users', userId, collectionName);

const toFirestoreDate = (date) => date instanceof Date ? Timestamp.fromDate(date) : date;
const fromFirestoreDate = (timestamp) => timestamp?.toDate ? timestamp.toDate() : timestamp;

export const firestoreService = {
  // Goals
  async getGoals(userId) {
    const q = query(getCollection(userId, 'goals'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: fromFirestoreDate(data.startDate),
        endDate: fromFirestoreDate(data.endDate),
        createdAt: fromFirestoreDate(data.createdAt)
      };
    });
  },

  async addGoal(userId, goalData) {
    const targets = breakdownGoalTargets(goalData);
    const goal = {
      ...goalData,
      targets,
      actualProgress: goalData.actualProgress || 0,
      startDate: toFirestoreDate(goalData.startDate),
      endDate: toFirestoreDate(goalData.endDate),
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(getCollection(userId, 'goals'), goal);
    return docRef.id;
  },

  async updateGoal(userId, goalId, updates) {
    const updateData = { ...updates };
    if (updates.startDate) updateData.startDate = toFirestoreDate(updates.startDate);
    if (updates.endDate) updateData.endDate = toFirestoreDate(updates.endDate);
    if (updates.yearlyTarget) {
      const goalDoc = await getDoc(doc(db, 'users', userId, 'goals', goalId));
      const goalData = goalDoc.data();
      updateData.targets = breakdownGoalTargets({ ...goalData, ...updates });
    }
    await updateDoc(doc(db, 'users', userId, 'goals', goalId), updateData);
  },

  async deleteGoal(userId, goalId) {
    await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
  },

  // Habits
  async getHabits(userId) {
    const q = query(getCollection(userId, 'habits'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: fromFirestoreDate(data.createdAt)
      };
    });
  },

  async addHabit(userId, habitData) {
    const habit = {
      ...habitData,
      goalIds: habitData.goalIds || [],
      isActive: habitData.isActive !== false,
      frequency: habitData.frequency || 'daily',
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(getCollection(userId, 'habits'), habit);
    return docRef.id;
  },

  async updateHabit(userId, habitId, updates) {
    await updateDoc(doc(db, 'users', userId, 'habits', habitId), updates);
  },

  async deleteHabit(userId, habitId) {
    await deleteDoc(doc(db, 'users', userId, 'habits', habitId));
  },

  // Daily Logs
  async getLogs(userId, habitId = null, startDate = null) {
    let q = query(getCollection(userId, 'logs'), orderBy('date', 'desc'));
    if (habitId) {
      q = query(getCollection(userId, 'logs'), where('habitId', '==', habitId), orderBy('date', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async addLog(userId, logData) {
    const log = {
      habitId: logData.habitId,
      date: logData.date,
      status: logData.status,
      notes: logData.notes || '',
      loggedAt: Timestamp.now()
    };
    const docRef = await addDoc(getCollection(userId, 'logs'), log);
    return docRef.id;
  },

  async updateLog(userId, logId, updates) {
    await updateDoc(doc(db, 'users', userId, 'logs', logId), updates);
  },

  async deleteLog(userId, logId) {
    await deleteDoc(doc(db, 'users', userId, 'logs', logId));
  },

  async getLogByHabitAndDate(userId, habitId, date) {
    const q = query(
      getCollection(userId, 'logs'),
      where('habitId', '==', habitId),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
};
