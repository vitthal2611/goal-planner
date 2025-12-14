export class Goal {
  constructor({
    id,
    title,
    yearlyTarget,
    actualProgress = 0,
    unit,
    startDate,
    endDate,
    year,
    createdAt = new Date(),
    monthlyData = {},
    monthlyTargets = {}
  }) {
    this.id = id;
    this.title = title;
    this.yearlyTarget = yearlyTarget;
    this.actualProgress = actualProgress;
    this.unit = unit;
    this.startDate = startDate;
    this.endDate = endDate;
    this.year = year || new Date(startDate).getFullYear();
    this.createdAt = createdAt;
    this.monthlyData = monthlyData;
    this.monthlyTargets = monthlyTargets;
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
