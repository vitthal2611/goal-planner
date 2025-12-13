export class DailyLog {
  constructor({
    id,
    habitId,
    date,
    status,
    notes = '',
    loggedAt = new Date()
  }) {
    this.id = id;
    this.habitId = habitId;
    this.date = date;
    this.status = status;
    this.notes = notes;
    this.loggedAt = loggedAt;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.loggedAt = new Date();
  }

  addNotes(notes) {
    this.notes = notes;
  }

  isDone() {
    return this.status === 'done';
  }

  isSkipped() {
    return this.status === 'skipped';
  }
}

export const createDailyLog = (data) => new DailyLog(data);
