// Milestone and Progression Persistence Fix
// Add this to quick-track-demo.html after the habits initialization

// Initialize milestones and progressions from localStorage
let milestones = JSON.parse(localStorage.getItem('milestones')) || [];
let progressions = JSON.parse(localStorage.getItem('progressions')) || [];

// Enhanced saveHabits function
function saveHabitsWithMilestones() {
  localStorage.setItem('habits', JSON.stringify(habits));
  localStorage.setItem('habitCheckins', JSON.stringify(habitCheckins));
  localStorage.setItem('milestones', JSON.stringify(milestones));
  localStorage.setItem('progressions', JSON.stringify(progressions));
}

// Add milestone
function addMilestoneToHabit(habitId, milestoneName, targetDays) {
  const milestone = {
    id: Date.now().toString(),
    habitId,
    name: milestoneName,
    target: targetDays,
    createdAt: new Date().toISOString()
  };
  milestones.push(milestone);
  saveHabitsWithMilestones();
  return milestone;
}

// Get milestones for habit
function getMilestonesForHabit(habitId) {
  return milestones.filter(m => m.habitId === habitId);
}

// Add progression
function addProgressionToMilestone(milestoneId, amount, notes = '') {
  const progression = {
    id: Date.now().toString(),
    milestoneId,
    amount,
    notes,
    date: new Date().toISOString()
  };
  progressions.push(progression);
  saveHabitsWithMilestones();
  return progression;
}

// Get progressions for milestone
function getProgressionsForMilestone(milestoneId) {
  return progressions.filter(p => p.milestoneId === milestoneId);
}

// Calculate milestone progress
function getMilestoneProgress(milestoneId) {
  const milestone = milestones.find(m => m.id === milestoneId);
  if (!milestone) return 0;
  
  const milestonProgressions = getProgressionsForMilestone(milestoneId);
  const totalAmount = milestonProgressions.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  return (totalAmount / milestone.target) * 100;
}

// Delete milestone and its progressions
function deleteMilestoneWithProgressions(milestoneId) {
  milestones = milestones.filter(m => m.id !== milestoneId);
  progressions = progressions.filter(p => p.milestoneId !== milestoneId);
  saveHabitsWithMilestones();
}

// Update habit form submission to include milestones and progressions
function enhancedHabitFormSubmit() {
  const progressionsList = [];
  document.querySelectorAll('.progression-item').forEach(item => {
    const days = item.querySelector('.progression-days').value;
    const progression = item.querySelector('.progression-text').value.trim();
    if (days && progression) {
      progressionsList.push({ days: parseInt(days), progression });
    }
  });

  const milestonesList = [];
  document.querySelectorAll('.milestone-item').forEach(item => {
    const days = item.querySelector('.milestone-days').value;
    const milestone = item.querySelector('.milestone-text').value.trim();
    if (days && milestone) {
      milestonesList.push({ days: parseInt(days), milestone });
    }
  });

  // Store in habit object
  const habit = {
    id: Date.now().toString(),
    identity: 'I am ' + document.getElementById('identity').value.trim(),
    triggerCue: document.getElementById('triggerCue').value.trim(),
    triggerTime: document.getElementById('triggerTime').value,
    routineAction: document.getElementById('routineAction').value.trim(),
    routineLocation: document.getElementById('routineLocation').value.trim(),
    immediateReward: document.getElementById('immediateReward').value.trim(),
    milestones: milestonesList,
    progressions: progressionsList,
    createdAt: new Date().toISOString()
  };

  habits.push(habit);
  
  // Also store milestones and progressions separately for tracking
  milestonesList.forEach(m => {
    addMilestoneToHabit(habit.id, m.milestone, m.days);
  });

  progressionsList.forEach(p => {
    const milestone = milestones.find(m => m.habitId === habit.id && m.target === p.days);
    if (milestone) {
      addProgressionToMilestone(milestone.id, 0, p.progression);
    }
  });

  saveHabitsWithMilestones();
}

// Retrieve and display milestone progress
function displayMilestoneProgress(habitId) {
  const habitMilestones = getMilestonesForHabit(habitId);
  return habitMilestones.map(m => {
    const progress = getMilestoneProgress(m.id);
    const progressions = getProgressionsForMilestone(m.id);
    return {
      milestone: m,
      progress: progress,
      progressions: progressions
    };
  });
}
