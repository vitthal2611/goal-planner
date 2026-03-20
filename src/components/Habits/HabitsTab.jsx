import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import HabitCalendar from './HabitCalendar';
import toast from 'react-hot-toast';
import './HabitsTab.css';

export default function HabitsTab() {
  const { user } = useAuthStore();
  const { habits, addHabit, deleteHabit, toggleCheckin, isChecked, getStreak } = useHabitStore();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];

  // Form state
  const [identity, setIdentity] = useState('');
  const [triggerCue, setTriggerCue] = useState('');
  const [triggerTime, setTriggerTime] = useState('');
  const [routineAction, setRoutineAction] = useState('');
  const [routineLocation, setRoutineLocation] = useState('');
  const [immediateReward, setImmediateReward] = useState('');
  const [twoMinuteVersion, setTwoMinuteVersion] = useState('');
  const [frequency, setFrequency] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [milestones, setMilestones] = useState([]);
  const [progressions, setProgressions] = useState([]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day) => {
    setFrequency(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleNext = () => {
    if (wizardStep === 1) {
      if (!identity.trim() || !routineAction.trim()) {
        toast.error('Fill in identity and habit action');
        return;
      }
    }
    if (wizardStep === 2) {
      if (!triggerCue.trim()) {
        toast.error('Add a trigger cue to stack your habit');
        return;
      }
    }
    setWizardStep(wizardStep + 1);
  };

  const handleBack = () => {
    setWizardStep(wizardStep - 1);
  };

  const resetForm = () => {
    setIdentity('');
    setTriggerCue('');
    setTriggerTime('');
    setRoutineAction('');
    setRoutineLocation('');
    setImmediateReward('');
    setTwoMinuteVersion('');
    setFrequency(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setMilestones([]);
    setProgressions([]);
    setWizardStep(1);
  };

  const handleSubmit = () => {
    if (!identity.trim() || !triggerCue.trim() || !routineAction.trim() || 
        !routineLocation.trim() || !immediateReward.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    const habit = {
      identity: `I am ${identity.trim()}`,
      triggerCue: triggerCue.trim(),
      triggerTime,
      routineAction: routineAction.trim(),
      routineLocation: routineLocation.trim(),
      immediateReward: immediateReward.trim(),
      twoMinuteVersion: twoMinuteVersion.trim(),
      frequency,
      milestones: milestones.sort((a, b) => a.days - b.days),
      progressions: progressions.sort((a, b) => a.days - b.days),
      createdAt: new Date().toISOString()
    };

    addHabit(habit, user.uid);
    toast.success(`Atomic habit created: I am ${identity.trim()}`);
    resetForm();
    setShowWizard(false);
  };

  const handleToggle = (habitId) => {
    toggleCheckin(habitId, today, user.uid);
    const checked = isChecked(habitId, today);
    toast.success(checked ? 'Habit unchecked' : 'Habit completed! 🎉');
  };

  const addMilestone = () => {
    setMilestones([...milestones, { days: '', milestone: '' }]);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const addProgression = () => {
    setProgressions([...progressions, { days: '', progression: '' }]);
  };

  const removeProgression = (index) => {
    setProgressions(progressions.filter((_, i) => i !== index));
  };

  const updateProgression = (index, field, value) => {
    const updated = [...progressions];
    updated[index][field] = value;
    setProgressions(updated);
  };

  if (showWizard) {
    return (
      <div className="habits-wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">Create Atomic Habit</h2>
          <button className="close-wizard-btn" onClick={() => { resetForm(); setShowWizard(false); }}>
            ✕
          </button>
        </div>

        <div className="wizard-progress">
          <div className="wizard-step-indicator">
            <div className={`wizard-dot ${wizardStep >= 1 ? 'active' : ''}`}>
              {wizardStep > 1 ? '✓' : '1'}
            </div>
            <div className={`wizard-line ${wizardStep > 1 ? 'active' : ''}`}></div>
            <div className={`wizard-dot ${wizardStep >= 2 ? 'active' : ''}`}>
              {wizardStep > 2 ? '✓' : '2'}
            </div>
            <div className={`wizard-line ${wizardStep > 2 ? 'active' : ''}`}></div>
            <div className={`wizard-dot ${wizardStep >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        {wizardStep === 1 && (
          <div className="wizard-step">
            <h3 className="step-title">Step 1: Identity & Action</h3>
            <p className="step-subtitle">Who do you want to become?</p>

            <div className="form-group">
              <label>I am...</label>
              <input
                type="text"
                placeholder="a reader, a runner, an athlete..."
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="wizard-input"
              />
            </div>

            <div className="form-group">
              <label>Habit Action *</label>
              <input
                type="text"
                placeholder="read 10 pages, meditate for 5 minutes..."
                value={routineAction}
                onChange={(e) => setRoutineAction(e.target.value)}
                className="wizard-input"
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                placeholder="in my bedroom, at my desk..."
                value={routineLocation}
                onChange={(e) => setRoutineLocation(e.target.value)}
                className="wizard-input"
              />
            </div>

            <button className="wizard-next-btn" onClick={handleNext}>
              Next →
            </button>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="wizard-step">
            <h3 className="step-title">Step 2: Trigger & Stack</h3>
            <p className="step-subtitle">When will you do it?</p>

            <div className="form-group">
              <label>After I... *</label>
              <input
                type="text"
                placeholder="wake up, finish my coffee, brush my teeth..."
                value={triggerCue}
                onChange={(e) => setTriggerCue(e.target.value)}
                className="wizard-input"
              />
            </div>

            <div className="form-group">
              <label>Time (optional)</label>
              <input
                type="time"
                value={triggerTime}
                onChange={(e) => setTriggerTime(e.target.value)}
                className="wizard-input"
              />
            </div>

            <div className="form-group">
              <label>2-Minute Version (optional)</label>
              <input
                type="text"
                placeholder="read 1 page, meditate for 1 minute..."
                value={twoMinuteVersion}
                onChange={(e) => setTwoMinuteVersion(e.target.value)}
                className="wizard-input"
              />
            </div>

            <div className="form-group">
              <label>Frequency</label>
              <div className="day-selector">
                {days.map(day => (
                  <button
                    key={day}
                    className={`day-btn ${frequency.includes(day) ? 'selected' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="wizard-buttons">
              <button className="wizard-back-btn" onClick={handleBack}>
                ← Back
              </button>
              <button className="wizard-next-btn" onClick={handleNext}>
                Next →
              </button>
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="wizard-step">
            <h3 className="step-title">Step 3: Reward & Milestones</h3>
            <p className="step-subtitle">Make it satisfying</p>

            <div className="form-group">
              <label>Immediate Reward *</label>
              <input
                type="text"
                placeholder="feel accomplished, check it off..."
                value={immediateReward}
                onChange={(e) => setImmediateReward(e.target.value)}
                className="wizard-input"
              />
            </div>

            <div className="form-group">
              <label>Milestones (optional)</label>
              {milestones.map((m, i) => (
                <div key={i} className="milestone-row">
                  <input
                    type="number"
                    placeholder="7"
                    value={m.days}
                    onChange={(e) => updateMilestone(i, 'days', e.target.value)}
                    className="milestone-days-input"
                  />
                  <input
                    type="text"
                    placeholder="milestone description"
                    value={m.milestone}
                    onChange={(e) => updateMilestone(i, 'milestone', e.target.value)}
                    className="milestone-text-input"
                  />
                  <button className="remove-btn" onClick={() => removeMilestone(i)}>✕</button>
                </div>
              ))}
              <button className="add-milestone-btn" onClick={addMilestone}>
                + Add Milestone
              </button>
            </div>

            <div className="form-group">
              <label>Progressions (optional)</label>
              {progressions.map((p, i) => (
                <div key={i} className="progression-row">
                  <input
                    type="number"
                    placeholder="30"
                    value={p.days}
                    onChange={(e) => updateProgression(i, 'days', e.target.value)}
                    className="progression-days-input"
                  />
                  <input
                    type="text"
                    placeholder="increase to 45 minutes"
                    value={p.progression}
                    onChange={(e) => updateProgression(i, 'progression', e.target.value)}
                    className="progression-text-input"
                  />
                  <button className="remove-btn" onClick={() => removeProgression(i)}>✕</button>
                </div>
              ))}
              <button className="add-progression-btn" onClick={addProgression}>
                + Add Progression
              </button>
            </div>

            <div className="wizard-buttons">
              <button className="wizard-back-btn" onClick={handleBack}>
                ← Back
              </button>
              <button className="wizard-submit-btn" onClick={handleSubmit}>
                ✓ Save Habit
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="habits-tab">
      <div className="habits-header">
        <h2 className="section-title">
          {viewMode === 'list' ? "Today's Habits" : 'Habit Calendar'}
        </h2>
        <div className="habits-header-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Calendar
            </button>
          </div>
          <button className="add-habit-btn" onClick={() => setShowWizard(true)}>
            + Create Atomic Habit
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <HabitCalendar
          onDateClick={(date) => {
            setSelectedDate(date);
            setViewMode('list');
          }}
        />
      ) : habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>No habits yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="habits-list">
          {habits.map(habit => {
            const checked = isChecked(habit.id, today);
            const streak = getStreak(habit.id);

            return (
              <div key={habit.id} className={`habit-card ${checked ? 'checked' : ''}`}>
                <button
                  className="habit-checkbox"
                  onClick={() => handleToggle(habit.id)}
                >
                  {checked ? '✓' : ''}
                </button>
                <div className="habit-info">
                  {habit.identity && (
                    <div className="habit-identity">{habit.identity}</div>
                  )}
                  <div className="habit-name">{habit.routineAction}</div>
                  <div className="habit-trigger">
                    📌 After I {habit.triggerCue}
                    {habit.triggerTime && ` at ${habit.triggerTime}`}
                  </div>
                  {habit.routineLocation && (
                    <div className="habit-location">📍 {habit.routineLocation}</div>
                  )}
                </div>
                <div className="habit-streak-box">
                  {streak > 0 && (
                    <div className="habit-streak">🔥 {streak} day streak</div>
                  )}
                </div>
                <button
                  className="habit-delete"
                  onClick={() => {
                    if (window.confirm(`Delete "${habit.routineAction}"?`)) {
                      deleteHabit(habit.id, user.uid);
                      toast.error('Habit deleted');
                    }
                  }}
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
