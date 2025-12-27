/**
 * Atomic Habits Metrics Calculator
 * Implements guilt-free, consistency-focused metrics
 */

import { format, subDays, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';

export class AtomicMetrics {
  
  /**
   * Calculate Daily Completion Percentage
   * Formula: (Completed Habits Today ÷ Active Habits Scheduled Today) × 100
   */
  static calculateDailyCompletion(habits, completions, date = new Date()) {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Get habits scheduled for this date
    const scheduledHabits = habits.filter(habit => 
      habit.isActive && habit.isScheduledForDate(date)
    );

    if (scheduledHabits.length === 0) return 0;

    // Get completions for this date
    const todayCompletions = completions.filter(completion => 
      completion.date === dateStr && completion.completed
    );

    // Count completed scheduled habits
    const completedCount = scheduledHabits.filter(habit =>
      todayCompletions.some(completion => completion.habitId === habit.id)
    ).length;

    return Math.round((completedCount / scheduledHabits.length) * 100);
  }

  /**
   * Calculate Consistency Score (14-day rolling average)
   * Formula: Average of Daily Completion % over last 14 days
   */
  static calculateConsistencyScore(habits, completions, endDate = new Date()) {
    const dailyPercentages = [];
    
    // Calculate daily completion for last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = subDays(endDate, i);
      const dailyPercentage = this.calculateDailyCompletion(habits, completions, date);
      dailyPercentages.push(dailyPercentage);
    }

    // Calculate average
    const average = dailyPercentages.reduce((sum, pct) => sum + pct, 0) / 14;
    return Math.round(average);
  }

  /**
   * Get consistency label (non-punitive)
   */
  static getConsistencyLabel(score) {
    if (score >= 90) return 'Strong identity forming';
    if (score >= 70) return 'Consistent';
    if (score >= 40) return 'Building rhythm';
    return 'Getting started';
  }

  /**
   * Calculate streak for a specific habit
   * Counts consecutive scheduled days the habit was completed
   */
  static calculateHabitStreak(habit, completions, endDate = new Date()) {
    let streak = 0;
    let currentDate = new Date(endDate);
    
    // Go backwards day by day
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Check if habit was scheduled for this date
      if (!habit.isScheduledForDate(currentDate)) {
        // Skip non-scheduled days
        currentDate = subDays(currentDate, 1);
        continue;
      }

      // Check if habit was completed on this scheduled day
      const completion = completions.find(c => 
        c.habitId === habit.id && c.date === dateStr && c.completed
      );

      if (completion) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        // Streak broken
        break;
      }

      // Don't go before habit start date
      if (isBefore(currentDate, parseISO(habit.startDate))) {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate habit chain visualization data
   * Returns array of symbols for last N days
   */
  static generateHabitChain(habit, completions, days = 7, endDate = new Date()) {
    const chain = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(endDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const isScheduled = habit.frequency === 'daily' || 
        (habit.frequency === 'weekly' && habit.weeklyDays?.includes(date.getDay()));
      
      if (!isScheduled) {
        chain.push({ date: dateStr, symbol: '—', status: 'not-scheduled' });
      } else {
        const completion = completions.find(c => 
          c.habitId === habit.id && c.date === dateStr && c.completed
        );
        
        if (completion) {
          chain.push({ date: dateStr, symbol: '●', status: 'completed' });
        } else {
          chain.push({ date: dateStr, symbol: '○', status: 'missed' });
        }
      }
    }
    
    return chain;
  }

  /**
   * Get habits grouped by time category for Today view
   */
  static groupHabitsByTime(habits, completions, date = new Date()) {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Filter habits scheduled for today
    const todayHabits = habits.filter(habit => 
      habit.isActive && habit.isScheduledForDate(date)
    );

    // Group by time category
    const grouped = {
      Morning: [],
      Afternoon: [],
      Evening: []
    };

    todayHabits.forEach(habit => {
      const category = habit.getTimeCategory();
      const completion = completions.find(c => 
        c.habitId === habit.id && c.date === dateStr
      );
      
      grouped[category].push({
        ...habit,
        completed: completion?.completed || false,
        streak: this.calculateHabitStreak(habit, completions, date)
      });
    });

    // Sort by time within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  }

  /**
   * Generate dashboard summary
   */
  static generateDashboardSummary(habits, completions, date = new Date()) {
    const dailyCompletion = this.calculateDailyCompletion(habits, completions, date);
    const consistencyScore = this.calculateConsistencyScore(habits, completions, date);
    const consistencyLabel = this.getConsistencyLabel(consistencyScore);
    
    // Get active habit streaks
    const activeHabits = habits.filter(h => h.isActive);
    const habitStreaks = activeHabits.map(habit => ({
      name: habit.name,
      streak: this.calculateHabitStreak(habit, completions, date)
    }));

    // Generate gentle motivational message
    const motivationalMessage = this.getMotivationalMessage(dailyCompletion, consistencyScore);

    return {
      dailyCompletion,
      consistencyScore,
      consistencyLabel,
      habitStreaks,
      motivationalMessage,
      activeHabitsCount: activeHabits.length
    };
  }

  /**
   * Get gentle, non-pushy motivational message
   */
  static getMotivationalMessage(dailyCompletion, consistencyScore) {
    if (consistencyScore >= 90) {
      return "Your identity is taking shape beautifully.";
    }
    if (consistencyScore >= 70) {
      return "You're building something meaningful.";
    }
    if (consistencyScore >= 40) {
      return "Small steps, steady progress.";
    }
    if (dailyCompletion > 0) {
      return "Every small action counts.";
    }
    return "Today is a fresh start.";
  }
}

export default AtomicMetrics;