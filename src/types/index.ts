export interface Goal {
  id: string;
  title: string;
  yearlyTarget: number;
  actualProgress: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface Habit {
  id: string;
  name: string;
  goalIds: string[];
  trigger: string;
  time: string;
  location: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: 'done' | 'skipped';
  loggedAt: Date;
}

export interface GoalProgress {
  yearlyProgress: number;
  quarterlyProgress: number;
  monthlyProgress: number;
  onTrack: boolean;
  targets: {
    yearly: number;
    quarterly: number;
    monthly: number;
    expected: number;
  };
}

export interface HabitConsistency {
  consistency: number;
  completed: number;
  expected: number;
  currentStreak: number;
  longestStreak: number;
}