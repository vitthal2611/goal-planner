// Habit Tracking - Based on Atomic Habits by James Clear
// Step 1: Identify Cue → Step 2: Create Habit → Step 3: Track Streak

let cues = JSON.parse(localStorage.getItem('cues')) || [];
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let habitLogs = JSON.parse(localStorage.getItem('habitLogs')) || [];

function saveData() {
  localStorage.setItem('cues', JSON.stringify(cues));
  localStorage.setItem('habits', JSON.stringify(habits));
  localStorage.setItem('habitLogs', JSON.stringify(habitLogs));
}

function updateCuesList() {
  const cuesList = document.getElementById('cuesList');
  if (cues.length === 0) {
    cuesList.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">No cues captured yet. Start by identifying your triggers!</div>';
    return;
  }
  
  cuesList.innerHTML = cues.map(cue => `
    <div style="background: #f9fafb; border-left: 4px solid #8b5cf6; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: start;">
      <div style="flex: 1;">
        <div style="font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 4px;">${cue.cue}</div>
        <div style="font-size: 13px; color: #6b7280;">${cue.description}</div>
      </div>
      <button onclick="deleteCue('${cue.id}')" style="background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; margin-left: 8px;">Delete</button>
    </div>
  `).join('');
  
  updateCueDropdown();
}

function updateCueDropdown() {
  const cueSelect = document.getElementById('habitCueSelect');
  const options = cues.map(cue => `<option value="${cue.id}">${cue.cue}</option>`).join('');
  cueSelect.innerHTML = '<option value="">Link to a Cue</option>' + options;
}

window.deleteCue = function(cueId) {
  if (confirm('Delete this cue?')) {
    cues = cues.filter(c => c.id !== cueId);
    saveData();
    updateCuesList();
    showToast('Cue deleted', 'error');
  }
};

function getStreak(habitId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const logged = habitLogs.find(log => log.habitId === habitId && log.date === dateStr);
    if (!logged) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  return streak;
}

function getCueName(cueId) {
  const cue = cues.find(c => c.id === cueId);
  return cue ? cue.cue : 'No cue linked';
}

function updateHabitsList() {
  const habitsList = document.getElementById('habitsList');
  if (habits.length === 0) {
    habitsList.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">No habits yet. Click the + button to create your first habit!</div>';
    return;
  }
  
  const categoryColors = {
    health: '#d1fae5',
    learning: '#dbeafe',
    productivity: '#fef3c7',
    mindfulness: '#e9d5ff',
    social: '#fce7f3',
    finance: '#f3e8ff',
    other: '#f3f4f6'
  };
  
  habitsList.innerHTML = habits.map(habit => {
    const streak = getStreak(habit.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const loggedToday = habitLogs.find(log => log.habitId === habit.id && log.date === todayStr);
    const cueName = getCueName(habit.cueId);
    
    return `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 16px; transition: all 0.2s;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div style="flex: 1;">
            <div style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 4px;">${habit.name}</div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${habit.description}</div>
            <div style="font-size: 12px; color: #8b5cf6; font-weight: 600; margin-bottom: 8px; padding: 4px 8px; background: #f3e8ff; border-radius: 6px; display: inline-block;">📌 ${cueName}</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span style="background: ${categoryColors[habit.category] || '#f3f4f6'}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #374151;">${habit.category}</span>
              <span style="background: #dbeafe; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #1e40af;">${habit.frequency}</span>
            </div>
          </div>
          <button onclick="deleteHabit('${habit.id}')" style="background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">Delete</button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-size: 24px;">🔥</div>
            <div>
              <div style="font-size: 12px; color: #6b7280;">Current Streak</div>
              <div style="font-size: 20px; font-weight: 800; color: #059669;">${streak} days</div>
            </div>
          </div>
          <button onclick="logHabit('${habit.id}')" style="background: ${loggedToday ? '#10b981' : '#3b82f6'}; color: white; border: none; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">${loggedToday ? '✓ Done Today' : 'Log Today'}</button>
        </div>
      </div>
    `;
  }).join('');
}

window.logHabit = function(habitId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const existing = habitLogs.find(log => log.habitId === habitId && log.date === todayStr);
  if (!existing) {
    habitLogs.push({habitId, date: todayStr});
    saveData();
    updateHabitsList();
    showToast('Habit logged! Keep the streak going! 🔥', 'success');
  }
};

window.deleteHabit = function(habitId) {
  if (confirm('Delete this habit?')) {
    habits = habits.filter(h => h.id !== habitId);
    habitLogs = habitLogs.filter(log => log.habitId !== habitId);
    saveData();
    updateHabitsList();
    showToast('Habit deleted', 'error');
  }
};

const captureCueBtn = document.getElementById('captureCueBtn');
const cueInput = document.getElementById('cueInput');
const cueDescription = document.getElementById('cueDescription');

captureCueBtn.addEventListener('click', () => {
  const cue = cueInput.value.trim();
  const description = cueDescription.value.trim();
  
  if (!cue || !description) {
    showToast('Please fill all cue fields', 'error');
    return;
  }
  
  cues.push({
    id: Date.now().toString(),
    cue,
    description,
    createdAt: new Date().toISOString()
  });
  
  saveData();
  updateCuesList();
  cueInput.value = '';
  cueDescription.value = '';
  showToast(`Cue "${cue}" captured! 📌`, 'success');
});

const addHabitBtn = document.getElementById('addHabitBtn');
const habitName = document.getElementById('habitName');
const habitDescription = document.getElementById('habitDescription');
const habitCategory = document.getElementById('habitCategory');
const habitFrequency = document.getElementById('habitFrequency');
const habitCueSelect = document.getElementById('habitCueSelect');

addHabitBtn.addEventListener('click', () => {
  const name = habitName.value.trim();
  const description = habitDescription.value.trim();
  const category = habitCategory.value;
  const frequency = habitFrequency.value;
  const cueId = habitCueSelect.value;
  
  if (!name || !description || !category || !frequency) {
    showToast('Please fill all habit fields', 'error');
    return;
  }
  
  if (!cueId) {
    showToast('Please link a cue to your habit', 'error');
    return;
  }
  
  habits.push({
    id: Date.now().toString(),
    name,
    description,
    category,
    frequency,
    cueId,
    createdAt: new Date().toISOString()
  });
  
  saveData();
  updateHabitsList();
  habitName.value = '';
  habitDescription.value = '';
  habitCategory.value = '';
  habitFrequency.value = '';
  habitCueSelect.value = '';
  showToast(`Habit "${name}" created and linked to cue! 🚀`, 'success');
});

// FAB Button functionality
const habitFab = document.getElementById('habitFab');
const habitTab = document.getElementById('habitTab');
const financeTab = document.getElementById('financeTab');

if (habitTab) {
  habitTab.addEventListener('click', () => {
    if (habitFab) habitFab.classList.add('show');
  });
}

if (financeTab) {
  financeTab.addEventListener('click', () => {
    if (habitFab) habitFab.classList.remove('show');
  });
}

if (habitFab) {
  habitFab.addEventListener('click', () => {
    habitName.focus();
    habitName.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

updateCuesList();
updateHabitsList();
