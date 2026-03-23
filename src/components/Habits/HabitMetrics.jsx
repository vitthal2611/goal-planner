import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import './HabitMetrics.css';

const HabitMetrics = ({ selectedDate }) => {
  const { habits } = useApp();

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's habits
    const todayHabits = habits.filter(h => {
      const checkins = h.checkins || [];
      return true; // All habits are scheduled for today (simplified)
    });

    const completedToday = todayHabits.filter(h => {
      const checkins = h.checkins || [];
      return checkins.includes(selectedDate);
    }).length;

    const totalToday = todayHabits.length;
    const todayPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    // 7-day consistency
    let completed7 = 0;
    let total7 = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      habits.forEach(h => {
        total7++;
        const checkins = h.checkins || [];
        if (checkins.includes(dateStr)) {
          completed7++;
        }
      });
    }
    const consistency7 = total7 > 0 ? Math.round((completed7 / total7) * 100) : 0;

    // Best streak
    let bestStreak = 0;
    habits.forEach(h => {
      const checkins = h.checkins || [];
      let currentStreak = 0;
      let checkDate = new Date(today);
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (!checkins.includes(dateStr)) break;
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      bestStreak = Math.max(bestStreak, currentStreak);
    });

    return {
      todayPercent,
      completedToday,
      totalToday,
      consistency7,
      bestStreak,
    };
  }, [habits, selectedDate]);

  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="habit-metrics">
      <div className="metric-card">
        <div className="metric-icon">📊</div>
        <div className="metric-info">
          <div className="metric-label">Today</div>
          <div className="metric-value">{metrics.todayPercent}%</div>
          <div className="metric-sub">
            {metrics.completedToday}/{metrics.totalToday} done
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">📈</div>
        <div className="metric-info">
          <div className="metric-label">7-Day</div>
          <div className="metric-value">{metrics.consistency7}%</div>
          <div className="metric-sub">Consistency</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">{metrics.bestStreak > 0 ? '🔥' : '💤'}</div>
        <div className="metric-info">
          <div className="metric-label">Best Streak</div>
          <div className="metric-value">{metrics.bestStreak}</div>
          <div className="metric-sub">days</div>
        </div>
      </div>
    </div>
  );
};

export default HabitMetrics;
