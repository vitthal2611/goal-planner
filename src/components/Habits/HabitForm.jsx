import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import './HabitForm.css';

const HabitForm = ({ habit, onClose }) => {
  const { habits, setHabits } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    time: '',
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        time: habit.time || '',
      });
    }
  }, [habit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a habit name');
      return;
    }

    if (habit) {
      // Update existing habit
      const updatedHabits = habits.map(h =>
        h.id === habit.id
          ? { ...h, ...formData }
          : h
      );
      setHabits(updatedHabits);
    } else {
      // Create new habit
      const newHabit = {
        id: Date.now().toString(),
        ...formData,
        checkins: [],
        createdAt: new Date().toISOString(),
      };
      setHabits([...habits, newHabit]);
    }

    onClose();
  };

  return (
    <div className="habit-form-container">
      <div className="habit-form-header">
        <h2 className="habit-form-title">
          {habit ? 'Edit Habit' : 'Create New Habit'}
        </h2>
        <button className="habit-form-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <form className="habit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Habit Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Read 10 pages"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Why is this habit important to you?"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="time" className="form-label">
            Time
          </label>
          <input
            type="time"
            id="time"
            name="time"
            className="form-input"
            value={formData.time}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="form-btn form-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="form-btn form-btn-submit"
          >
            {habit ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitForm;
