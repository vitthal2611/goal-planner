// Add this function to display milestones and progressions in habit cards

function renderHabitCard(habit, selectedDate, checked, streak) {
  const timeDisplay = habit.triggerTime ? ` at ${habit.triggerTime}` : '';
  const milestones = habit.milestones || [];
  const progressions = habit.progressions || [];
  
  // Find next milestone
  const nextMilestone = milestones.length > 0 ? milestones.find(m => m.days > streak) : null;
  
  // Find next progression
  const nextProgression = progressions.length > 0 ? progressions.find(p => p.days > streak) : null;
  
  // Build milestone display
  let milestoneHTML = '';
  if (nextMilestone) {
    milestoneHTML = `<div style="flex: 1; padding: 6px 10px; background: #dbeafe; border-radius: 8px; font-size: 12px; color: #1e40af; font-weight: 600;">📈 Day ${nextMilestone.days}: ${nextMilestone.milestone}</div>`;
  }
  
  // Build progression display
  let progressionHTML = '';
  if (nextProgression) {
    progressionHTML = `<div style="flex: 1; padding: 6px 10px; background: #e0e7ff; border-radius: 8px; font-size: 12px; color: #4f46e5; font-weight: 600;">🚀 Day ${nextProgression.days}: ${nextProgression.progression}</div>`;
  }
  
  // Build complete card HTML
  const cardHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; background: ${checked ? '#f0fdf4' : '#ffffff'}; border: 2px solid ${checked ? '#86efac' : '#e5e7eb'}; border-radius: 12px; transition: all 0.2s;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="check-btn ${checked ? 'checked' : ''}" onclick="toggleHabitCheckIn('${habit.id}', '${selectedDate}')" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${checked ? '#22c55e' : '#e5e7eb'}; background: ${checked ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'white'}; color: ${checked ? 'white' : '#6b7280'}; cursor: pointer; font-size: 18px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${checked ? '✓' : ''}</button>
        <div style="flex: 1;">
          <div style="font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">✨ ${habit.identity ? habit.identity.replace('I am ', '') : ''}</div>
          <div style="font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 4px;">${habit.routineAction}</div>
          <div style="font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 8px;">
            <span>🔔 After I ${habit.triggerCue}${timeDisplay}</span>
            ${habit.routineLocation ? `<span>📍 ${habit.routineLocation}</span>` : ''}
          </div>
        </div>
        <div style="text-align: center; padding: 0 12px;">
          <div style="font-size: 20px; font-weight: 800; color: #f59e0b;">${streak}</div>
          <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600;">🔥 Streak</div>
        </div>
      </div>
      <div style="display: flex; gap: 6px; padding-top: 8px; border-top: 1px solid ${checked ? '#86efac' : '#e5e7eb'}; flex-wrap: wrap;">
        ${habit.immediateReward ? `<div style="flex: 1; min-width: 120px; padding: 6px 10px; background: #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; font-weight: 600;">🎁 ${habit.immediateReward}</div>` : ''}
        ${milestoneHTML}
        ${progressionHTML}
        <button onclick="editHabit('${habit.id}')" style="padding: 6px 10px; background: #dbeafe; color: #2563eb; border: none; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; white-space: nowrap;" onmouseover="this.style.background='#bfdbfe'" onmouseout="this.style.background='#dbeafe'">✏️ Edit</button>
        <button onclick="deleteHabit('${habit.id}')" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; white-space: nowrap;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">🗑️ Delete</button>
      </div>
    </div>
  `;
  
  return cardHTML;
}

// Usage in updateTimelineView():
// Replace the habit card rendering with:
// listContainer.innerHTML = sortedHabits.map(habit => {
//   const checked = isCheckedOnDate(habit.id, selectedDate);
//   const streak = getStreak(habit.id, selectedDate);
//   return renderHabitCard(habit, selectedDate, checked, streak);
// }).join('');
