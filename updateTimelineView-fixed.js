// FIXED updateTimelineView() function with Milestone and Progression Display
// Replace the existing updateTimelineView() function in quick-track-demo.html with this code

function updateTimelineView() {
  const listContainer = document.getElementById('listView');
  const dateDisplay = document.getElementById('habitDate');
  dateDisplay.value = selectedDate;
  updateDateLabel();
  
  if (habits.length === 0) {
    listContainer.innerHTML = '<div style="padding: 32px; text-align: center; color: #64748b; font-size: 16px;">✨ No habits yet. Create your first atomic habit to get started!</div>';
    document.getElementById('habitStats').textContent = '0/0';
    return;
  }

  const completedCount = habits.filter(h => isCheckedOnDate(h.id, selectedDate)).length;
  document.getElementById('habitStats').textContent = completedCount + '/' + habits.length;
  
  const statsEl = document.getElementById('habitStats');
  if (completedCount === habits.length && habits.length > 0) {
    statsEl.style.background = '#d1fae5';
    statsEl.style.color = '#059669';
  } else if (completedCount > 0) {
    statsEl.style.background = '#fef3c7';
    statsEl.style.color = '#92400e';
  } else {
    statsEl.style.background = '#f3f4f6';
    statsEl.style.color = '#6b7280';
  }

  const sortedHabits = habits.slice().sort(function(a, b) {
    const timeA = a.triggerTime || '23:59';
    const timeB = b.triggerTime || '23:59';
    return timeA.localeCompare(timeB);
  });

  // Build habit cards with milestones and progressions
  const habitCards = sortedHabits.map(function(habit) {
    const checked = isCheckedOnDate(habit.id, selectedDate);
    const streak = getStreak(habit.id, selectedDate);
    const timeDisplay = habit.triggerTime ? ' at ' + habit.triggerTime : '';
    
    const milestones = habit.milestones || [];
    const progressions = habit.progressions || [];
    
    let nextMilestone = null;
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].days > streak) {
        nextMilestone = milestones[i];
        break;
      }
    }
    
    let nextProgression = null;
    for (let i = 0; i < progressions.length; i++) {
      if (progressions[i].days > streak) {
        nextProgression = progressions[i];
        break;
      }
    }
    
    let milestoneBadge = '';
    if (nextMilestone) {
      milestoneBadge = '<div style="flex: 1; min-width: 140px; padding: 6px 10px; background: #dbeafe; border-radius: 8px; font-size: 12px; color: #1e40af; font-weight: 600;">📈 Day ' + nextMilestone.days + ': ' + nextMilestone.milestone + '</div>';
    }
    
    let progressionBadge = '';
    if (nextProgression) {
      progressionBadge = '<div style="flex: 1; min-width: 140px; padding: 6px 10px; background: #e0e7ff; border-radius: 8px; font-size: 12px; color: #4f46e5; font-weight: 600;">🚀 Day ' + nextProgression.days + ': ' + nextProgression.progression + '</div>';
    }
    
    const identityName = habit.identity ? habit.identity.replace('I am ', '') : '';
    const rewardBadge = habit.immediateReward ? '<div style="flex: 1; min-width: 120px; padding: 6px 10px; background: #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; font-weight: 600;">🎁 ' + habit.immediateReward + '</div>' : '';
    const locationDisplay = habit.routineLocation ? '<span>📍 ' + habit.routineLocation + '</span>' : '';
    
    const bgColor = checked ? '#f0fdf4' : '#ffffff';
    const borderColor = checked ? '#86efac' : '#e5e7eb';
    const checkBgColor = checked ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'white';
    const checkBorderColor = checked ? '#22c55e' : '#e5e7eb';
    const checkText = checked ? '✓' : '';
    const checkColor = checked ? 'white' : '#6b7280';
    
    return '<div style="display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; background: ' + bgColor + '; border: 2px solid ' + borderColor + '; border-radius: 12px; transition: all 0.2s;">' +
      '<div style="display: flex; align-items: center; gap: 12px;">' +
        '<button class="check-btn ' + (checked ? 'checked' : '') + '" onclick="toggleHabitCheckIn(\'' + habit.id + '\', \'' + selectedDate + '\')" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ' + checkBorderColor + '; background: ' + checkBgColor + '; color: ' + checkColor + '; cursor: pointer; font-size: 18px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">' + checkText + '</button>' +
        '<div style="flex: 1;">' +
          '<div style="font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">✨ ' + identityName + '</div>' +
          '<div style="font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 4px;">' + habit.routineAction + '</div>' +
          '<div style="font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 8px;">' +
            '<span>🔔 After I ' + habit.triggerCue + timeDisplay + '</span>' +
            locationDisplay +
          '</div>' +
        '</div>' +
        '<div style="text-align: center; padding: 0 12px;">' +
          '<div style="font-size: 20px; font-weight: 800; color: #f59e0b;">' + streak + '</div>' +
          '<div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600;">🔥 Streak</div>' +
        '</div>' +
      '</div>' +
      '<div style="display: flex; gap: 6px; padding-top: 8px; border-top: 1px solid ' + borderColor + '; flex-wrap: wrap;">' +
        rewardBadge +
        milestoneBadge +
        progressionBadge +
        '<button onclick="editHabit(\'' + habit.id + '\')" style="padding: 6px 10px; background: #dbeafe; color: #2563eb; border: none; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; white-space: nowrap;" onmouseover="this.style.background=\'#bfdbfe\'" onmouseout="this.style.background=\'#dbeafe\'">✏️ Edit</button>' +
        '<button onclick="deleteHabit(\'' + habit.id + '\')" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; white-space: nowrap;" onmouseover="this.style.background=\'#fecaca\'" onmouseout="this.style.background=\'#fee2e2\'">🗑️ Delete</button>' +
      '</div>' +
    '</div>';
  }).join('');

  listContainer.innerHTML = habitCards || '<div style="padding: 32px 16px; text-align: center; color: #64748b; font-size: 16px;">✨ No habits scheduled for today.</div>';
}
