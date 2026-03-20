import { create } from 'zustand';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useHabitStore = create((set, get) => ({
  habits: [],
  habitCheckins: [],
  milestones: [],
  progressions: [],
  groupByIdentity: false,
  selectedDate: new Date().toISOString().split('T')[0],
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),

  loadUserData: async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          habits: data.habits || [],
          habitCheckins: data.habitCheckins || [],
          milestones: data.milestones || [],
          progressions: data.progressions || []
        });
      }
    } catch (error) {
      console.error('Error loading habit data:', error);
    }
  },

  saveUserData: async (userId) => {
    try {
      const { habits, habitCheckins, milestones, progressions } = get();
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        habits,
        habitCheckins,
        milestones,
        progressions,
        lastUpdated: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving habit data:', error);
    }
  },

  addHabit: (habit, userId) => {
    set((state) => ({
      habits: [...state.habits, { ...habit, id: Date.now() }]
    }));
    get().saveUserData(userId);
  },

  deleteHabit: (habitId, userId) => {
    set((state) => ({
      habits: state.habits.filter(h => h.id !== habitId),
      habitCheckins: state.habitCheckins.filter(c => c.habitId !== habitId)
    }));
    get().saveUserData(userId);
  },

  toggleCheckin: (habitId, date, userId) => {
    set((state) => {
      const exists = state.habitCheckins.some(c => c.habitId === habitId && c.date === date);
      
      if (exists) {
        return {
          habitCheckins: state.habitCheckins.filter(c => !(c.habitId === habitId && c.date === date))
        };
      } else {
        return {
          habitCheckins: [...state.habitCheckins, { habitId, date }]
        };
      }
    });
    get().saveUserData(userId);
  },

  isChecked: (habitId, date) => {
    return get().habitCheckins.some(c => c.habitId === habitId && c.date === date);
  },

  getStreak: (habitId, upToDate = null) => {
    const { habitCheckins } = get();
    const endDate = upToDate || new Date().toISOString().split('T')[0];
    let streak = 0;
    let checkDate = new Date(endDate);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const checked = habitCheckins.some(c => c.habitId === habitId && c.date === dateStr);
      if (!checked) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  },

  isScheduledOnDate: (habit, dateStr) => {
    const freq = habit.frequency || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[new Date(dateStr).getDay()];
    return freq.includes(dayName);
  },

  getHabitsByIdentity: () => {
    const { habits, selectedDate } = get();
    const grouped = {};
    
    habits.forEach(habit => {
      if (get().isScheduledOnDate(habit, selectedDate)) {
        const identity = habit.identity || 'No Identity';
        if (!grouped[identity]) grouped[identity] = [];
        grouped[identity].push(habit);
      }
    });
    
    return grouped;
  },

  getMissedYesterday: () => {
    const { habits, habitCheckins, selectedDate } = get();
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate !== today) return [];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return habits.filter(h => 
      get().isScheduledOnDate(h, yesterdayStr) && 
      !habitCheckins.some(c => c.habitId === h.id && c.date === yesterdayStr)
    );
  },

  getCalendarData: (habitId) => {
    const { habitCheckins, calendarYear, calendarMonth } = get();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const checked = habitCheckins.some(c => c.habitId === habitId && c.date === dateStr);
      days.push({ date: dateStr, day: d, checked });
    }
    
    return { firstDay, days };
  },

  setGroupByIdentity: (value) => set({ groupByIdentity: value }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCalendarMonth: (month) => set({ calendarMonth: month }),
  setCalendarYear: (year) => set({ calendarYear: year }),
  shiftCalendarMonth: (delta) => {
    const { calendarMonth, calendarYear } = get();
    let newMonth = calendarMonth + delta;
    let newYear = calendarYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    set({ calendarMonth: newMonth, calendarYear: newYear });
  }
}));
