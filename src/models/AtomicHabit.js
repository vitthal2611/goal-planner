/**
 * Atomic Habit Model
 * Inspired by James Clear's Atomic Habits methodology
 */

export class AtomicHabit {
  constructor({
    id = Date.now().toString(),
    name = '',
    trigger = '',
    time = '09:00',
    location = '',
    frequency = 'daily', // 'daily' | 'weekly'
    weeklyDays = [], // [1,2,3,4,5] for Mon-Fri if weekly
    startDate = new Date().toISOString().split('T')[0],
    isActive = true,
    createdAt = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.name = name;
    this.trigger = trigger;
    this.time = time;
    this.location = location;
    this.frequency = frequency;
    this.weeklyDays = weeklyDays;
    this.startDate = startDate;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  // Check if habit is scheduled for a specific date
  isScheduledForDate(date) {
    const targetDate = new Date(date);
    const startDate = new Date(this.startDate);
    
    if (targetDate < startDate) return false;
    if (!this.isActive) return false;

    if (this.frequency === 'daily') {
      return true;
    }

    if (this.frequency === 'weekly') {
      const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      return this.weeklyDays.includes(dayOfWeek);
    }

    return false;
  }

  // Get time category for grouping
  getTimeCategory() {
    const hour = parseInt(this.time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  // Validate habit data
  static validate(habitData) {
    const errors = [];
    
    if (!habitData.name?.trim()) {
      errors.push('Habit name is required');
    }
    
    if (habitData.name?.length > 100) {
      errors.push('Habit name should be under 100 characters');
    }

    if (!habitData.trigger?.trim()) {
      errors.push('Trigger is required');
    }

    if (habitData.frequency === 'weekly' && (!habitData.weeklyDays || habitData.weeklyDays.length === 0)) {
      errors.push('Weekly habits need at least one day selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create identity-based habit suggestion
  static createIdentityBasedSuggestion(action) {
    return `I am a person who ${action}`;
  }
}

export default AtomicHabit;