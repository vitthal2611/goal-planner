/**
 * Habit Completion Model
 * Tracks daily completions for habits
 */

export class HabitCompletion {
  constructor({
    id = Date.now().toString(),
    habitId = '',
    date = new Date().toISOString().split('T')[0],
    completed = false,
    completedAt = null
  } = {}) {
    this.id = id;
    this.habitId = habitId;
    this.date = date;
    this.completed = completed;
    this.completedAt = completedAt;
  }

  // Mark as completed
  markCompleted() {
    this.completed = true;
    this.completedAt = new Date().toISOString();
  }

  // Mark as not completed
  markIncomplete() {
    this.completed = false;
    this.completedAt = null;
  }

  // Toggle completion status
  toggle() {
    if (this.completed) {
      this.markIncomplete();
    } else {
      this.markCompleted();
    }
  }
}

export default HabitCompletion;