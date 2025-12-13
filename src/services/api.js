const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Goals API
  getGoals() {
    return this.request('/goals');
  }

  createGoal(goal) {
    return this.request('/goals', { method: 'POST', body: goal });
  }

  updateGoalProgress(goalId, progress) {
    return this.request(`/goals/${goalId}/progress`, { 
      method: 'PUT', 
      body: { actualProgress: progress } 
    });
  }

  deleteGoal(goalId) {
    return this.request(`/goals/${goalId}`, { method: 'DELETE' });
  }

  // Habits API
  getHabits() {
    return this.request('/habits');
  }

  createHabit(habit) {
    return this.request('/habits', { method: 'POST', body: habit });
  }

  updateHabit(habitId, habit) {
    return this.request(`/habits/${habitId}`, { method: 'PUT', body: habit });
  }

  deleteHabit(habitId) {
    return this.request(`/habits/${habitId}`, { method: 'DELETE' });
  }

  // Logs API
  getHabitLogs(habitId, startDate, endDate) {
    const params = new URLSearchParams({ habitId, startDate, endDate });
    return this.request(`/logs?${params}`);
  }

  createHabitLog(log) {
    return this.request('/logs', { method: 'POST', body: log });
  }

  updateHabitLog(logId, log) {
    return this.request(`/logs/${logId}`, { method: 'PUT', body: log });
  }

  deleteHabitLog(logId) {
    return this.request(`/logs/${logId}`, { method: 'DELETE' });
  }

  // Analytics API
  getGoalAnalytics(goalId) {
    return this.request(`/analytics/goals/${goalId}/progress`);
  }

  getHabitAnalytics(habitId, days = 30) {
    return this.request(`/analytics/habits/${habitId}/consistency?days=${days}`);
  }
}

export const api = new ApiService();