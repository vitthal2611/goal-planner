import { format } from 'date-fns';
import { firestoreService } from './firestore';
import { breakdownGoalTargets, calculateGoalProgress } from '../utils/goalUtils';

export const goalService = {
  async createGoal(userId, { title, yearlyTarget, unit, startDate, endDate }) {
    const goalData = {
      title,
      yearlyTarget: Number(yearlyTarget),
      unit,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(new Date().getFullYear(), 11, 31),
      actualProgress: 0
    };
    return await firestoreService.addGoal(userId, goalData);
  },

  async updateGoalProgress(userId, goalId, newProgress) {
    await firestoreService.updateGoal(userId, goalId, {
      actualProgress: Number(newProgress)
    });
  },

  async incrementGoalProgress(userId, goalId, amount) {
    const goals = await firestoreService.getGoals(userId);
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      await firestoreService.updateGoal(userId, goalId, {
        actualProgress: goal.actualProgress + Number(amount)
      });
    }
  },

  getGoalWithCalculations(goal) {
    return {
      ...goal,
      targets: breakdownGoalTargets(goal),
      progress: calculateGoalProgress(goal)
    };
  }
};

export const habitService = {
  async createHabit(userId, { name, goalIds, trigger, time, location, frequency = 'daily' }) {
    const habitData = {
      name,
      goalIds: Array.isArray(goalIds) ? goalIds : [goalIds].filter(Boolean),
      trigger: trigger || '',
      time: time || '',
      location: location || '',
      frequency,
      isActive: true
    };
    return await firestoreService.addHabit(userId, habitData);
  },

  async linkHabitToGoal(userId, habitId, goalId) {
    const habits = await firestoreService.getHabits(userId);
    const habit = habits.find(h => h.id === habitId);
    if (habit && !habit.goalIds.includes(goalId)) {
      await firestoreService.updateHabit(userId, habitId, {
        goalIds: [...habit.goalIds, goalId]
      });
    }
  },

  async unlinkHabitFromGoal(userId, habitId, goalId) {
    const habits = await firestoreService.getHabits(userId);
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      await firestoreService.updateHabit(userId, habitId, {
        goalIds: habit.goalIds.filter(id => id !== goalId)
      });
    }
  }
};

export const logService = {
  async markHabitDone(userId, habitId, date = new Date()) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = await firestoreService.getLogByHabitAndDate(userId, habitId, dateStr);
    
    if (existing) {
      await firestoreService.updateLog(userId, existing.id, { status: 'done' });
    } else {
      await firestoreService.addLog(userId, {
        habitId,
        date: dateStr,
        status: 'done'
      });
    }
  },

  async markHabitSkipped(userId, habitId, date = new Date()) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = await firestoreService.getLogByHabitAndDate(userId, habitId, dateStr);
    
    if (existing) {
      await firestoreService.updateLog(userId, existing.id, { status: 'skipped' });
    } else {
      await firestoreService.addLog(userId, {
        habitId,
        date: dateStr,
        status: 'skipped'
      });
    }
  },

  async toggleHabitStatus(userId, habitId, date = new Date()) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = await firestoreService.getLogByHabitAndDate(userId, habitId, dateStr);
    
    if (existing) {
      const newStatus = existing.status === 'done' ? 'skipped' : 'done';
      await firestoreService.updateLog(userId, existing.id, { status: newStatus });
    } else {
      await firestoreService.addLog(userId, {
        habitId,
        date: dateStr,
        status: 'done'
      });
    }
  }
};
