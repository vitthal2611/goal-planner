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
    status = 'active',
    createdAt = new Date(),
    monthlyData = {},
    monthlyTargets = {}
  }) {
    this.id = id;
    this.title = title;
    this.yearlyTarget = yearlyTarget;
    this.actualProgress = actualProgress;
    this.unit = unit;
    this.startDate = startDate || new Date();
    this.endDate = endDate || new Date(year || new Date().getFullYear(), 11, 31);
    
    // Safe year calculation
    if (year) {
      this.year = year;
    } else {
      const startDateObj = new Date(this.startDate);
      this.year = isNaN(startDateObj.getTime()) ? new Date().getFullYear() : startDateObj.getFullYear();
    }
    
    this.status = status;
    this.createdAt = createdAt;
    this.monthlyData = monthlyData;
    this.monthlyTargets = monthlyTargets;
  }

  updateProgress(newProgress) {
    if (typeof newProgress !== 'number' || newProgress < 0) return;
    this.actualProgress = Math.min(newProgress, this.yearlyTarget);
  }

  incrementProgress(amount) {
    if (typeof amount !== 'number' || amount < 0) return;
    this.actualProgress = Math.min(this.actualProgress + amount, this.yearlyTarget);
  }

  isCompleted() {
    return this.actualProgress >= this.yearlyTarget;
  }
}

export const createGoal = (data) => new Goal(data);
