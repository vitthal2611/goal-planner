export class Habit {
  constructor({
    id,
    name,
    goalIds = [],
    trigger,
    time,
    location,
    frequency = 'daily',
    isActive = true,
    startYear,
    createdAt = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.goalIds = goalIds;
    this.trigger = trigger;
    this.time = time;
    this.location = location;
    this.frequency = frequency;
    this.isActive = isActive;
    this.startYear = startYear || new Date(createdAt).getFullYear();
    this.createdAt = createdAt;
  }

  linkToGoal(goalId) {
    if (!this.goalIds.includes(goalId)) {
      this.goalIds.push(goalId);
    }
  }

  unlinkFromGoal(goalId) {
    this.goalIds = this.goalIds.filter(id => id !== goalId);
  }

  deactivate() {
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
  }
}

export const createHabit = (data) => new Habit(data);
