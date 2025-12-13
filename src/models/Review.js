export class Review {
  constructor({
    id,
    type,
    date,
    goalProgress = {},
    habitStreaks = {},
    reflections = '',
    insights = [],
    createdAt = new Date()
  }) {
    this.id = id;
    this.type = type;
    this.date = date;
    this.goalProgress = goalProgress;
    this.habitStreaks = habitStreaks;
    this.reflections = reflections;
    this.insights = insights;
    this.createdAt = createdAt;
  }

  addReflection(text) {
    this.reflections = text;
  }

  addInsight(insight) {
    this.insights.push(insight);
  }

  setGoalProgress(goalId, percentage) {
    this.goalProgress[goalId] = percentage;
  }

  setHabitStreak(habitId, streak) {
    this.habitStreaks[habitId] = streak;
  }
}

export const createReview = (data) => new Review(data);
