import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import HabitList from './HabitList';
import HabitForm from './HabitForm';
import HabitMetrics from './HabitMetrics';
import './HabitsTab.css';

const HabitsTab = () => {
  const { habits, setHabits } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handleAddHabit = () => {
    setEditingHabit(null);
    setShowForm(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === -1) return 'Tomorrow';
    
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  if (showForm) {
    return (
      <HabitForm
        habit={editingHabit}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="habits-tab">
      <div className="habits-header">
        <div className="habits-title-section">
          <h2 className="habits-title">Habits</h2>
          <button className="add-habit-btn" onClick={handleAddHabit}>
            + Add Habit
          </button>
        </div>
        
        <div className="date-selector">
          <button className="date-nav-btn" onClick={handlePrevDay}>
            ←
          </button>
          <div className="date-display">
            {formatDateDisplay(selectedDate)}
          </div>
          <button className="date-nav-btn" onClick={handleNextDay}>
            →
          </button>
        </div>
      </div>

      <HabitMetrics selectedDate={selectedDate} />

      <HabitList
        selectedDate={selectedDate}
        onEditHabit={handleEditHabit}
      />
    </div>
  );
};

export default HabitsTab;
