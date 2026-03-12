// Milestone management functions
function addMilestoneField() {
  const milestonesList = document.getElementById('milestonesList');
  const newMilestone = document.createElement('div');
  newMilestone.className = 'milestone-item';
  newMilestone.style.cssText = 'display: flex; gap: 8px; align-items: center; padding: 12px; background: #dbeafe; border-radius: 12px; border: 2px solid #3b82f6;';
  newMilestone.innerHTML = `
    <span style="font-size: 16px; font-weight: 600; color: #1e40af;">Day</span>
    <input type="number" class="milestone-days" placeholder="7" min="1" style="width: 60px; padding: 8px 12px; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; background: white;" />
    <span style="font-size: 16px; font-weight: 600; color: #1e40af;">-</span>
    <input type="text" class="milestone-text" placeholder="milestone description" style="flex: 1; padding: 8px 12px; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; background: white;" />
    <button type="button" class="remove-milestone" onclick="removeMilestone(this)" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">×</button>
  `;
  milestonesList.appendChild(newMilestone);
}

function removeMilestone(btn) {
  btn.parentElement.remove();
}

// Progression management functions
function addProgressionField() {
  const progressionList = document.getElementById('progressionList');
  const newProgression = document.createElement('div');
  newProgression.className = 'progression-item';
  newProgression.style.cssText = 'display: flex; gap: 8px; align-items: center; padding: 12px; background: #fef3c7; border-radius: 12px; border: 2px solid #f59e0b;';
  newProgression.innerHTML = `
    <span style="font-size: 16px; font-weight: 600; color: #92400e;">Day</span>
    <input type="number" class="progression-days" placeholder="30" min="1" style="width: 60px; padding: 8px 12px; border: 2px solid #f59e0b; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; background: white;" />
    <span style="font-size: 16px; font-weight: 600; color: #92400e;">-</span>
    <input type="text" class="progression-text" placeholder="progression description" style="flex: 1; padding: 8px 12px; border: 2px solid #f59e0b; border-radius: 8px; font-size: 14px; background: white;" />
    <button type="button" class="remove-progression" onclick="removeProgression(this)" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">×</button>
  `;
  progressionList.appendChild(newProgression);
}

function removeProgression(btn) {
  btn.parentElement.remove();
}

// Updated habit form submission aligned with James Clear's Atomic Habits
function submitAtomicHabit(e) {
  e.preventDefault();

  const identity = 'I am ' + document.getElementById('identity').value.trim();
  const triggerCue = document.getElementById('triggerCue').value.trim();
  const triggerTime = document.getElementById('triggerTime').value;
  const routineAction = document.getElementById('routineAction').value.trim();
  const routineLocation = document.getElementById('routineLocation').value.trim();
  const immediateReward = document.getElementById('immediateReward').value.trim();

  if (!identity || !triggerCue || !routineAction || !routineLocation || !immediateReward) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const milestones = [];
  document.querySelectorAll('.milestone-item').forEach(item => {
    const days = item.querySelector('.milestone-days').value;
    const milestone = item.querySelector('.milestone-text').value.trim();
    if (days && milestone) {
      milestones.push({ days: parseInt(days), milestone });
    }
  });

  const progressions = [];
  document.querySelectorAll('.progression-item').forEach(item => {
    const days = item.querySelector('.progression-days').value;
    const progression = item.querySelector('.progression-text').value.trim();
    if (days && progression) {
      progressions.push({ days: parseInt(days), progression });
    }
  });

  const habit = {
    id: Date.now().toString(),
    identity,
    triggerCue,
    triggerTime,
    routineAction,
    routineLocation,
    immediateReward,
    milestones: milestones.sort((a, b) => a.days - b.days),
    progressions: progressions.sort((a, b) => a.days - b.days),
    createdAt: new Date().toISOString()
  };

  habits.push(habit);
  saveHabits();
  updateTimelineView();
  updateHabitStacks();
  showToast(`Atomic habit created: ${identity}`, 'success');
  document.getElementById('atomicHabitForm').reset();
}
