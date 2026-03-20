import { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import './HabitCalendar.css';

export default function HabitCalendar({ onDateClick }) {
  const { habits, habitCheckins, getHabitColor } = useHabitStore();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getToday = () => new Date().toISOString().split('T')[0];

  const shiftMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = getToday();
    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="cal-cell-empty"></div>);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(currentMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${mm}-${dd}`;
      const isToday = dateStr === today;

      // Get colored dots for each checked habit
      const checkedHabits = habits.filter(h =>
        habitCheckins.some(c => c.habitId === h.id && c.date === dateStr)
      );

      const dots = checkedHabits.map(h => {
        const color = getHabitColor(h.id);
        return (
          <span
            key={h.id}
            className="cal-dot"
            style={{ background: color }}
          />
        );
      });

      cells.push(
        <div
          key={dateStr}
          className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${dots.length > 0 ? 'cal-cell-has-data' : ''}`}
          onClick={() => onDateClick && onDateClick(dateStr)}
        >
          <span className="cal-day-num">{d}</span>
          <div className="cal-dots">{dots}</div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="habit-calendar">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={() => shiftMonth(-1)}>
          ‹
        </button>
        <div className="cal-month-label">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button className="cal-nav-btn" onClick={() => shiftMonth(1)}>
          ›
        </button>
      </div>

      <div className="cal-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="cal-weekday">{day}</div>
        ))}
      </div>

      <div className="cal-grid">
        {renderCalendar()}
      </div>

      {habits.length > 0 && (
        <div className="cal-legend">
          {habits.map(h => {
            const color = getHabitColor(h.id);
            return (
              <div key={h.id} className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: color }} />
                <span className="cal-legend-text">{h.routineAction || h.identity}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
