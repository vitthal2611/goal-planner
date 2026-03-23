import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import './HabitCard.css';

const HabitCard = ({ habit, selectedDate, onEdit }) => {
  const { setHabits, habits } = useApp();

  const isCompleted = useMemo(() => {
    const checkins = habit.checkins || [];
    return checkins.includes(selectedDate);
  }, [habit.checkins, selectedDate]);

  const streak = useMemo(() => {
    const checkins = habit.checkins || [];
    let count = 0;
    let checkDate = new Date(selectedDate);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (!checkins.includes(dateStr)) break;
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return count;
  }, [habit.checkins, selectedDate]);

  const handleToggle = (e) => {
    e.stopPropagation();
    
    const updatedHabits = habits.map(h => {
      if (h.id === habit.id) {
        const checkins = h.checkins || [];
        const newCheckins = isCompleted
          ? checkins.filter(d => d !== selectedDate)
          : [...checkins, selectedDate];
        
        return { ...h, checkins: newCheckins };
      }
      return h;
    });
    
    setHabits(updatedHabits);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete habit "${habit.name}"?`)) {
      setHabits(habits.filter(h => h.id !== habit.id));
    }
  };

  return (
    <div
      className={`habit-card ${isCompleted ? 'completed' : ''}`}
      onClick={onEdit}
    >
      <button
        className={`habit-check ${isCompleted ? 'checked' : ''}`}
        onClick={handleToggle}
      >
        {isCompleted ? '✓' : '○'}
      </button>

      <div className="habit-body">
        <div className="habit-name">{habit.name}</div>
        {habit.description && (
          <div className="habit-description">{habit.description}</div>
        )}
        {habit.time && (
          <div className="habit-time">⏰ {habit.time}</div>
        )}
      </div>

      <div className="habit-streak">
        <div className="habit-streak-num">{streak}</div>
        <div className="habit-streak-label">streak</div>
      </div>

      <button
        className="habit-delete"
        onClick={handleDelete}
        title="Delete habit"
      >
        🗑️
      </button>
    </div>
  );
};

export default HabitCard;
