import React from 'react';
import { useApp } from '../../contexts/AppContext';
import HabitCard from './HabitCard';
import './HabitList.css';

const HabitList = ({ selectedDate, onEditHabit }) => {
  const { habits } = useApp();

  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✨</div>
        <h3>No habits yet</h3>
        <p>Create your first habit to start building better routines.</p>
      </div>
    );
  }

  return (
    <div className="habit-list">
      <h3 className="section-title">Your Habits</h3>
      <div className="habit-cards">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            selectedDate={selectedDate}
            onEdit={() => onEditHabit(habit)}
          />
        ))}
      </div>
    </div>
  );
};

export default HabitList;
