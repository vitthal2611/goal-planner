export class Goal {
  constructor({
    id,
    title,
    yearlyTarget,
    actualProgress = 0,
    unit,
    startDate,
    endDate,
    createdAt = new Date()
  }) {
    this.id = id;
    this.title = title;
    this.yearlyTarget = yearlyTarget;
    this.actualProgress = actualProgress;
    this.unit = unit;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
  }

  updateProgress(newProgress) {
    this.actualProgress = Math.min(newProgress, this.yearlyTarget);
  }

  incrementProgress(amount) {
    this.actualProgress = Math.min(this.actualProgress + amount, this.yearlyTarget);
  }

  isCompleted() {
    return this.actualProgress >= this.yearlyTarget;
  }
}

export const createGoal = (data) => new Goal(data);
