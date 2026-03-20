    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let habitCheckins = JSON.parse(localStorage.getItem('habitCheckins')) || [];
    let milestones = JSON.parse(localStorage.getItem('milestones')) || [];
    let progressions = JSON.parse(localStorage.getItem('progressions')) || [];
    let selectedDate = new Date().toISOString().split('T')[0];

    function saveHabits() {
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('habitCheckins', JSON.stringify(habitCheckins));
      localStorage.setItem('milestones', JSON.stringify(milestones));
      localStorage.setItem('progressions', JSON.stringify(progressions));
      saveUserData(); // Save to Firebase
    }

    function getToday() {
      return new Date().toISOString().split('T')[0];
    }

    function getStreak(habitId, upToDate = null) {
      const endDate = upToDate || getToday();
      let streak = 0;
      let checkDate = new Date(endDate);
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const checked = habitCheckins.some(c => c.habitId === habitId && c.date === dateStr);
        if (!checked) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      return streak;
    }

    function isCheckedOnDate(habitId, date) {
      return habitCheckins.some(c => c.habitId === habitId && c.date === date);
    }

    function getDayName(dateStr) {
      return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(dateStr).getDay()];
    }

    function isScheduledOnDate(habit, dateStr) {
      const freq = habit.frequency || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      return freq.includes(getDayName(dateStr));
    }

    function toggleHabitCheckIn(habitId, date) {
      const index = habitCheckins.findIndex(c => c.habitId === habitId && c.date === date);
      
      if (index > -1) {
        habitCheckins.splice(index, 1);
        saveHabits();
        updateTimelineView();
        if (document.getElementById('calendarHabitsSection').style.display !== 'none') renderCalendar();
        showToast('Habit unchecked', 'success');
      } else {
        habitCheckins.push({ habitId, date });
        saveHabits();
        updateTimelineView();
        if (document.getElementById('calendarHabitsSection').style.display !== 'none') renderCalendar();
        showToast('Habit completed! ðŸŽ‰', 'success');
      }
    }

    function deleteHabit(habitId) {
      habits = habits.filter(h => h.id !== habitId);
      habitCheckins = habitCheckins.filter(c => c.habitId !== habitId);
      saveHabits();
      updateTimelineView();
      showToast('Habit deleted', 'error');
    }

    function toggleSection(header) {
      const content = header.nextElementSibling;
      const toggle = header.querySelector('.section-toggle');
      content.style.display = content.style.display === 'none' ? 'flex' : 'none';
      toggle.style.transform = content.style.display === 'none' ? 'rotate(-90deg)' : 'rotate(0deg)';
    }

    function addRewardField() {
      const rewardsList = document.getElementById('rewardsList');
      const newReward = document.createElement('div');
      newReward.className = 'reward-item';
      newReward.style.cssText = 'display: flex; gap: 8px; align-items: center; padding: 12px; background: #fef3c7; border-radius: 12px; border: 2px solid #f59e0b;';
      newReward.innerHTML = `
        <span style="font-size: 16px; font-weight: 600; color: #92400e;">After</span>
        <input type="number" class="reward-days" placeholder="30" min="1" style="width: 60px; padding: 8px 12px; border: 2px solid #f59e0b; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; background: white;" />
        <span style="font-size: 16px; font-weight: 600; color: #92400e;">Streak, I will</span>
        <input type="text" class="reward-text" placeholder="purchase new shoes" style="flex: 1; padding: 8px 12px; border: 2px solid #f59e0b; border-radius: 8px; font-size: 14px; background: white;" />
        <button type="button" class="remove-reward" onclick="removeReward(this)" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Ã—</button>
      `;
      rewardsList.appendChild(newReward);
    }

    function removeReward(btn) {
      btn.parentElement.remove();
    }

    function addProgressionField() {
      const progressionList = document.getElementById('progressionList');
      const newProgression = document.createElement('div');
      newProgression.className = 'progression-item';
      newProgression.style.cssText = 'display: flex; gap: 8px; align-items: center; padding: 12px; background: #dbeafe; border-radius: 12px; border: 2px solid #3b82f6;';
      newProgression.innerHTML = `
        <span style="font-size: 16px; font-weight: 600; color: #1e40af;">After</span>
        <input type="number" class="progression-days" placeholder="30" min="1" style="width: 60px; padding: 8px 12px; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; background: white;" />
        <span style="font-size: 16px; font-weight: 600; color: #1e40af;">days, I will</span>
        <input type="text" class="progression-text" placeholder="increase to 45 minutes" style="flex: 1; padding: 8px 12px; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; background: white;" />
        <button type="button" class="remove-progression" onclick="removeProgression(this)" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Ã—</button>
      `;
      progressionList.appendChild(newProgression);
    }

    function removeProgression(btn) {
      btn.parentElement.remove();
    }



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
        <button type="button" class="remove-milestone" onclick="removeMilestone(this)" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Ã—</button>
      `;
      milestonesList.appendChild(newMilestone);
    }

    function removeMilestone(btn) {
      btn.parentElement.remove();
    }

    let groupByIdentity = false;

    function toggleGroupByIdentity() {
      groupByIdentity = !groupByIdentity;
      const btn = document.getElementById('groupByIdentityBtn');
      if (groupByIdentity) {
        btn.style.background = 'linear-gradient(135deg, #4f46e5, #6366f1)';
        btn.style.color = 'white';
        btn.style.borderColor = '#4f46e5';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = '#6b7280';
        btn.style.borderColor = '#e5e7eb';
      }
      updateTimelineView();
    }

    let editingHabitId = null;

    function editHabit(habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      editingHabitId = habitId;
      
      // Clear and prefill form fields
      document.getElementById('identity').value = habit.identity ? habit.identity.replace('I am ', '') : '';
      document.getElementById('triggerCue').value = habit.triggerCue || '';
      document.getElementById('triggerTime').value = habit.triggerTime || '';
      document.getElementById('routineAction').value = habit.routineAction || '';
      document.getElementById('routineLocation').value = habit.routineLocation || '';
      document.getElementById('immediateReward').value = habit.immediateReward || '';
      document.getElementById('twoMinuteVersion').value = habit.twoMinuteVersion || '';

      // Restore frequency in wizard day grid
      const freqDays = habit.frequency || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      document.querySelectorAll('.wiz-day').forEach(el => {
        el.classList.toggle('sel', freqDays.includes(el.dataset.day));
      });

      // Clear and repopulate milestones
      const milestonesList = document.getElementById('milestonesList');
      milestonesList.innerHTML = '';
      const milestonesContent = document.querySelector('#milestonesList').closest('.section-content');
      if (habit.milestones && habit.milestones.length > 0) {
        milestonesContent.style.display = 'flex';
        const milestonesToggle = milestonesContent.previousElementSibling.querySelector('.section-toggle');
        if (milestonesToggle) milestonesToggle.style.transform = 'rotate(0deg)';
        habit.milestones.forEach(m => {
          const div = document.createElement('div');
          div.className = 'milestone-item';
          div.style.cssText = 'display: flex; gap: 8px; align-items: center; padding: 12px; background: #dbeafe; border-radius: 12px; border: 2px solid #3b82f6;';
          div.innerHTML = `
            <span style="font-size: 16px; font-weight: 600; color: #1e40af;">Day</span>
            <input type="number" class="milestone-days" value="${m.days}" min="1" style="width: 60px; padding: 8px 12px; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; background: white;" />
            <span style="font-size: 16px; font-weight: 600; color: #1e40af;">-</span>
            <input type="text" class="milestone-text" value="${m.milestone}" style="flex: 1; padding: 8px 12px; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; background: white;" />
            <button type="button" class="remove-milestone" onclick="removeMilestone(this)" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Ã—</button>
          `;
          milestonesList.appendChild(div);
        });
      } else {
        milestonesContent.style.display = 'none';
        const milestonesToggle = milestonesContent.previousElementSibling.querySelector('.section-toggle');
        if (milestonesToggle) milestonesToggle.style.transform = 'rotate(-90deg)';
      }

      // Clear and repopulate progressions
      const progressionList = document.getElementById('progressionList');
      progressionList.innerHTML = '';
      const progressionContent = document.querySelector('#progressionList').closest('.section-content');
      if (habit.progressions && habit.progressions.length > 0) {
        progressionContent.style.display = 'flex';
        const progressionToggle = progressionContent.previousElementSibling.querySelector('.section-toggle');
        if (progressionToggle) progressionToggle.style.transform = 'rotate(0deg)';
        habit.progressions.forEach(p => {
          const div = document.createElement('div');
          div.className = 'progression-item';
          div.style.cssText = 'display: flex; gap: 8px; align-items: center; padding: 12px; background: #dbeafe; border-radius: 12px; border: 2px solid #4f46e5;';
          div.innerHTML = `
            <span style="font-size: 16px; font-weight: 600; color: #1e40af;">After</span>
            <input type="number" class="progression-days" value="${p.days}" min="1" style="width: 60px; padding: 8px 12px; border: 2px solid #4f46e5; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; background: white;" />
            <span style="font-size: 16px; font-weight: 600; color: #1e40af;">days, I will</span>
            <input type="text" class="progression-text" value="${p.progression}" style="flex: 1; padding: 8px 12px; border: 2px solid #4f46e5; border-radius: 8px; font-size: 14px; background: white;" />
            <button type="button" class="remove-progression" onclick="removeProgression(this)" style="padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Ã—</button>
          `;
          progressionList.appendChild(div);
        });
      } else {
        progressionContent.style.display = 'none';
        const progressionToggle = progressionContent.previousElementSibling.querySelector('.section-toggle');
        if (progressionToggle) progressionToggle.style.transform = 'rotate(-90deg)';
      }

      // Update submit button
      const submitBtn = document.getElementById('submitHabitBtn');
      submitBtn.textContent = 'ðŸ’¾ Update Atomic Habit';
      submitBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';

      // Show create habit section (wizard step 1)
      document.getElementById('createHabitSection').style.display = 'block';
      document.getElementById('viewHabitsSection').style.display = 'none';
      document.getElementById('viewHabitsTab').classList.remove('active');
      document.getElementById('viewHabitsTab').style.color = '#6b7280';
      document.getElementById('viewHabitsTab').style.borderBottomColor = 'transparent';
      wizSetStep(1);
      // Focus on first field
      document.getElementById('identity').focus();
    }

    function formatDateDisplay(dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      const today = new Date(getToday() + 'T00:00:00');
      const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) return 'Today';
      if (diff === 1) return 'Yesterday';
      if (diff === -1) return 'Tomorrow';
      if (diff > 1 && diff <= 7) return `${diff} days ago`;
      if (diff < -1 && diff >= -7) return `In ${Math.abs(diff)} days`;
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    }

    function updateDateLabel() {
      const dateLabel = document.getElementById('dateLabel');
      if (dateLabel) {
        dateLabel.textContent = formatDateDisplay(selectedDate);
      }
    }

    function escapeHtml(str) {
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Palette: [border, bg-light, identity-color, badge-bg, badge-color]
    const HABIT_PALETTE = [
      ['#6366f1', '#eef2ff', '#4f46e5', '#eef2ff', '#4f46e5'], // indigo
      ['#f59e0b', '#fffbeb', '#b45309', '#fef3c7', '#92400e'], // amber
      ['#10b981', '#ecfdf5', '#059669', '#d1fae5', '#065f46'], // emerald
      ['#ef4444', '#fff1f2', '#dc2626', '#fee2e2', '#991b1b'], // red
      ['#8b5cf6', '#f5f3ff', '#7c3aed', '#ede9fe', '#5b21b6'], // violet
      ['#06b6d4', '#ecfeff', '#0891b2', '#cffafe', '#164e63'], // cyan
      ['#f97316', '#fff7ed', '#ea580c', '#ffedd5', '#9a3412'], // orange
      ['#ec4899', '#fdf2f8', '#db2777', '#fce7f3', '#831843'], // pink
    ];

    function getHabitColor(habitId) {
      let hash = 0;
      for (let i = 0; i < habitId.length; i++) hash = habitId.charCodeAt(i) + ((hash << 5) - hash);
      return HABIT_PALETTE[Math.abs(hash) % HABIT_PALETTE.length];
    }

    function renderHabitCard(habit, date) {
      const checked = isCheckedOnDate(habit.id, date);
      const streak  = getStreak(habit.id, date);
      const identityLabel = habit.identity ? escapeHtml(habit.identity) : '';
      const timeAnchor = habit.triggerTime ? escapeHtml(habit.triggerTime) : '';
      const location = habit.routineLocation ? escapeHtml(habit.routineLocation) : '';
      const voteCount = habitCheckins.filter(c => c.habitId === habit.id).length;

      const [border, bgLight, identityColor, badgeBg, badgeColor] = getHabitColor(habit.id);

      let triggerParts = [`After I ${escapeHtml(habit.triggerCue)}`];
      if (location) triggerParts.push(location);
      const triggerLine = triggerParts.join(' Â· ');

      const cardBg   = checked ? '#f0fdf4' : bgLight;
      const cardBorder = checked ? '#22c55e' : border;

      return `
        <div class="hc ${checked ? 'hc--done' : ''}"
          onclick="openHabitSheet('${escapeHtml(habit.id)}')"
          style="border-left-color:${cardBorder}; background:${cardBg};">
          <button
            class="hc-check ${checked ? 'hc-check--done' : ''}"
            onclick="event.stopPropagation(); toggleHabitCheckIn('${escapeHtml(habit.id)}', '${escapeHtml(date)}')"
            aria-label="${checked ? 'Mark incomplete' : 'Mark complete'}: ${escapeHtml(habit.routineAction)}"
            style="${checked ? '' : `border-color:${border};`}"
          >${checked ? 'âœ“' : 'â—‹'}</button>
          <div class="hc-body">
            ${identityLabel ? `<div class="hc-identity" style="color:${checked ? '#16a34a' : identityColor};">${identityLabel} <span style="font-weight:500;opacity:0.65;">Â· ${voteCount} vote${voteCount !== 1 ? 's' : ''}</span></div>` : ''}
            <div class="hc-action">${escapeHtml(habit.routineAction)}</div>
            <div class="hc-trigger">${triggerLine}</div>
          </div>
          ${timeAnchor ? `<div class="hc-time-badge" style="background:${checked ? '#dcfce7' : badgeBg}; color:${checked ? '#15803d' : badgeColor};">${timeAnchor}</div>` : ''}
          <div class="hc-streak ${checked ? 'hc-streak--done' : ''}" style="border-left-color:${checked ? '#bbf7d0' : border}20;">
            <span class="hc-streak-num">${streak}</span>
            <span class="hc-streak-label">streak</span>
          </div>
        </div>
      `;
    }

    function updateTodayHabits() {
      const container = document.getElementById('todayHabitsList');
      const dateDisplay = document.getElementById('habitDate');
      dateDisplay.value = selectedDate;
      
      if (habits.length === 0) {
        container.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">No habits yet. Create one to get started!</div>';
        return;
      }

      const isToday = selectedDate === getToday();
      const dateLabel = formatDateDisplay(selectedDate);
      
      container.innerHTML = habits.map(habit => {
        const streak = getStreak(habit.id, selectedDate);
        const checked = isCheckedOnDate(habit.id, selectedDate);
        const timeDisplay = habit.triggerTime ? ` at ${habit.triggerTime}` : '';
        
        return `
          <div class="habit-card ${checked ? 'completed' : ''}">
            <div class="habit-info">
              <div class="habit-title">${habit.routineAction}</div>
              <div class="habit-cue">ðŸ“Œ ${habit.triggerCue}${timeDisplay}</div>
            </div>
            <div class="habit-streak">
              <div class="streak-number">${streak}</div>
              <div class="streak-label">ðŸ”¥ Streak</div>
            </div>
            <button class="check-btn ${checked ? 'checked' : ''}" onclick="toggleHabitCheckIn('${habit.id}', '${selectedDate}')">âœ“</button>
          </div>
        `;
      }).join('');
    }

    function updateTimelineView() {
      const listContainer = document.getElementById('listView');
      const dateDisplay = document.getElementById('habitDate');
      const habitStats = document.getElementById('habitStats');
      
      if (!listContainer || !dateDisplay || !habitStats) {
        return; // Elements not ready yet
      }
      
      dateDisplay.value = selectedDate;
      updateDateLabel();
      
      if (habits.length === 0) {
        listContainer.innerHTML = '<div style="padding: 32px 16px; text-align: center; color: #9ca3af; font-size: 15px;">âœ¨ No habits yet. Create one to get started!</div>';
        habitStats.textContent = '0/0';
        renderHabitDashboard(0, 0, 0, 0, 0);
        return;
      }

      // Generate List View - Sort by time
      const sortedHabits = [...habits]
        .filter(h => isScheduledOnDate(h, selectedDate))
        .sort((a, b) => {
          const timeA = a.triggerTime || '23:59';
          const timeB = b.triggerTime || '23:59';
          return timeA.localeCompare(timeB);
        });

      // Count completed habits (only scheduled ones)
      const completedCount = sortedHabits.filter(h => isCheckedOnDate(h.id, selectedDate)).length;
      const totalToday = sortedHabits.length;
      habitStats.textContent = `${completedCount}/${totalToday}`;
      
      // Update stats color
      if (completedCount === totalToday && totalToday > 0) {
        habitStats.style.background = '#d1fae5';
        habitStats.style.color = '#059669';
      } else if (completedCount > 0) {
        habitStats.style.background = '#fef3c7';
        habitStats.style.color = '#92400e';
      } else {
        habitStats.style.background = '#f3f4f6';
        habitStats.style.color = '#6b7280';
      }

      // â”€â”€ Atomic Habits Metrics â”€â”€
      const today = getToday();

      // 7-day consistency: % of (habit Ã— day) slots completed over last 7 days
      let slots7 = 0, done7 = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        habits.forEach(h => {
          if (isScheduledOnDate(h, ds)) {
            slots7++;
            if (isCheckedOnDate(h.id, ds)) done7++;
          }
        });
      }
      const consistency7 = slots7 > 0 ? Math.round((done7 / slots7) * 100) : 0;

      // 30-day consistency
      let slots30 = 0, done30 = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        habits.forEach(h => {
          if (isScheduledOnDate(h, ds)) {
            slots30++;
            if (isCheckedOnDate(h.id, ds)) done30++;
          }
        });
      }
      const consistency30 = slots30 > 0 ? Math.round((done30 / slots30) * 100) : 0;

      // Best current streak across all habits
      const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.id, today)), 0);

      // Total identity votes (all-time completions)
      const totalVotes = habitCheckins.length;

      renderHabitDashboard(completedCount, totalToday, consistency7, bestStreak, totalVotes, consistency30);

      // Never Miss Twice â€” any habit scheduled yesterday that was not checked
      const yesterday = new Date(selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const trulyMissed = habits.filter(h =>
        isScheduledOnDate(h, yesterdayStr) && !isCheckedOnDate(h.id, yesterdayStr)
      );
      const neverMissTwiceBanner = (selectedDate === getToday() && trulyMissed.length > 0)
        ? `<div style="display:flex;align-items:center;gap:10px;background:#fff7ed;border:2px solid #fb923c;border-radius:14px;padding:12px 14px;margin-bottom:12px;">
            <span style="font-size:20px;">âš ï¸</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:#c2410c;">Never Miss Twice</div>
              <div style="font-size:12px;color:#9a3412;margin-top:2px;">You missed ${trulyMissed.length} habit${trulyMissed.length > 1 ? 's' : ''} yesterday. Don't let it become a new habit.</div>
            </div>
           </div>`
        : '';

      if (groupByIdentity) {
        // Group by Identity when toggled
        const habitsByIdentity = {};
        sortedHabits.forEach(habit => {
          const identity = habit.identity || 'No Identity';
          if (!habitsByIdentity[identity]) {
            habitsByIdentity[identity] = [];
          }
          habitsByIdentity[identity].push(habit);
        });

        const listHTML = Object.entries(habitsByIdentity).map(([identity, groupHabits]) => {
          const identityName = identity.replace('I am ', '');
          const habitsHTML = groupHabits.map(habit => renderHabitCard(habit, selectedDate)).join('');

          return `
            <div class="identity-group">
              <div class="identity-header">âœ¨ ${identityName}</div>
              <div class="identity-habits">${habitsHTML}</div>
            </div>
          `;
        }).join('');

        listContainer.innerHTML = neverMissTwiceBanner + (listHTML || '<div style="padding: 32px 16px; text-align: center; color: #64748b; font-size: 16px;">âœ¨ No habits scheduled for today.</div>');
      } else {
        // Default view - no grouping
        const listHTML = sortedHabits.map(habit => renderHabitCard(habit, selectedDate)).join('');
        listContainer.innerHTML = neverMissTwiceBanner + (listHTML || '<div style="padding: 32px 16px; text-align: center; color: #64748b; font-size: 16px;">âœ¨ No habits scheduled for today.</div>');
      }
    }

    function renderHabitDashboard(done, total, week7, bestStreak, votes, month30) {
      const el = document.getElementById('habitDashboard');
      if (!el) return;
      if (habits.length === 0) { el.innerHTML = ''; return; }

      const todayPct = total > 0 ? Math.round((done / total) * 100) : 0;

      function ring(pct, color, trackColor) {
        const r = 20, circ = 2 * Math.PI * r;
        const dash = (pct / 100) * circ;
        return `<svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="${r}" fill="none" stroke="${trackColor}" stroke-width="5"/>
          <circle cx="26" cy="26" r="${r}" fill="none" stroke="${color}" stroke-width="5"
            stroke-dasharray="${dash} ${circ}" stroke-linecap="round"/>
        </svg>`;
      }

      const todayColor  = todayPct === 100 ? '#059669' : todayPct >= 50 ? '#d97706' : '#94a3b8';
      const weekColor   = week7 >= 80 ? '#059669' : week7 >= 50 ? '#d97706' : '#ef4444';
      const streakColor = bestStreak >= 7 ? '#059669' : bestStreak >= 3 ? '#f59e0b' : '#94a3b8';

      el.innerHTML = `
        <div class="metric-card metric-card--today">
          <div class="metric-ring">
            ${ring(todayPct, todayColor, '#e5e7eb')}
            <div class="metric-ring-val" style="color:${todayColor};">${todayPct}%</div>
          </div>
          <div class="metric-label">Today</div>
          <div class="metric-sub">${done}/${total} done</div>
        </div>
        <div class="metric-card metric-card--week">
          <div class="metric-ring">
            ${ring(week7, weekColor, '#e5e7eb')}
            <div class="metric-ring-val" style="color:${weekColor};">${week7}%</div>
          </div>
          <div class="metric-label">7-Day</div>
          <div class="metric-sub">${month30}% / 30d</div>
        </div>
        <div class="metric-card metric-card--streak">
          <div class="metric-streak-num">${bestStreak > 0 ? 'ðŸ”¥' : 'ðŸ’¤'}${bestStreak}</div>
          <div class="metric-label">Best Streak</div>
          <div class="metric-sub">${votes} votes cast</div>
        </div>
      `;
    }

    function updateHabitStacks() {
      // Habit stacks functionality removed - now integrated into habit cards
    }

    const prevDayBtn = document.getElementById('prevDay');
    const nextDayBtn = document.getElementById('nextDay');
    const habitDateInput = document.getElementById('habitDate');
    const listView = document.getElementById('listView');

    // Add CSS classes to navigation buttons
    prevDayBtn.classList.add('day-nav-btn');
    nextDayBtn.classList.add('day-nav-btn');

    prevDayBtn.addEventListener('click', () => {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() - 1);
      selectedDate = date.toISOString().split('T')[0];
      updateTimelineView();
    });

    nextDayBtn.addEventListener('click', () => {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + 1);
      selectedDate = date.toISOString().split('T')[0];
      updateTimelineView();
    });

    habitDateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      updateTimelineView();
    });

    const atomicHabitForm = document.getElementById('atomicHabitForm');
    atomicHabitForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const identity = 'I am ' + document.getElementById('identity').value.trim();
      const triggerCue = document.getElementById('triggerCue').value.trim();
      const triggerTime = document.getElementById('triggerTime').value;
      const routineAction = document.getElementById('routineAction').value.trim();
      const routineLocation = document.getElementById('routineLocation').value.trim();
      const immediateReward = document.getElementById('immediateReward').value.trim();
      const twoMinuteVersion = document.getElementById('twoMinuteVersion').value.trim();
      const freqDays = [...document.querySelectorAll('.wiz-day.sel')].map(el => el.dataset.day);
      const frequency = freqDays.length > 0 ? freqDays : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

      if (!identity || !triggerCue || !routineAction || !routineLocation || !immediateReward) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      const milestones = [];
      document.querySelectorAll('.milestone-item').forEach(item => {
        const days = item.querySelector('.milestone-days').value;
        const milestone = item.querySelector('.milestone-text').value.trim();
        console.log('Milestone:', days, milestone); if (days && milestone) {
          milestones.push({ days: parseInt(days), milestone });
        }
      });

      const progressions = [];
      document.querySelectorAll('.progression-item').forEach(item => {
        const days = item.querySelector('.progression-days').value;
        const progression = item.querySelector('.progression-text').value.trim();
        console.log('Progression:', days, progression); if (days && progression) {
          progressions.push({ days: parseInt(days), progression });
        }
      });

      if (editingHabitId) {
        // Update existing habit
        const habitIndex = habits.findIndex(h => h.id === editingHabitId);
        if (habitIndex > -1) {
          habits[habitIndex] = {
            ...habits[habitIndex],
            identity,
            triggerCue,
            triggerTime,
            routineAction,
            routineLocation,
            immediateReward,
            twoMinuteVersion,
            frequency,
            milestones: milestones.sort((a, b) => a.days - b.days),
            progressions: progressions.sort((a, b) => a.days - b.days)
          };
          saveHabits();
          updateTimelineView();
          showToast(`Habit updated: ${identity}`, 'success');
          editingHabitId = null;
        }
      } else {
        // Create new habit
        const habit = {
          id: Date.now().toString(),
          identity,
          triggerCue,
          triggerTime,
          routineAction,
          routineLocation,
          immediateReward,
          twoMinuteVersion,
          frequency,
          milestones: milestones.length > 0 ? milestones.sort((a, b) => a.days - b.days) : [],
          progressions: progressions.length > 0 ? progressions.sort((a, b) => a.days - b.days) : [],
          createdAt: new Date().toISOString()
        };
        habits.push(habit);
        saveHabits();
        updateTimelineView();
        showToast(`Atomic habit created: ${identity}`, 'success');
      }

      // Reset form and UI
      atomicHabitForm.reset();
      document.getElementById('milestonesList').innerHTML = '';
      document.getElementById('progressionList').innerHTML = '';
      document.getElementById('submitHabitBtn').textContent = 'âœ“ Save Habit';
      document.getElementById('submitHabitBtn').style.background = '';
      wizReset();
      document.getElementById('createHabitSection').style.display = 'none';
      document.getElementById('viewHabitsSection').style.display = 'block';
      document.getElementById('viewHabitsTab').classList.add('active');
      document.getElementById('viewHabitsTab').style.color = '#3b82f6';
      document.getElementById('viewHabitsTab').style.borderBottomColor = '#3b82f6';
    });

    // â”€â”€ Bottom Sheet â”€â”€
    let sheetHabitId = null;

    function openHabitSheet(habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      sheetHabitId = habitId;

      const checked = isCheckedOnDate(habitId, selectedDate);
      const streak  = getStreak(habitId, selectedDate);
      const total   = habitCheckins.filter(c => c.habitId === habitId).length;
      const milestones = habit.milestones || [];
      const nextMilestone = milestones.find(m => m.days > streak);

      // Apply palette color to hero
      const [border] = getHabitColor(habitId);
      const hero = document.getElementById('sheetHero');
      if (!checked) {
        hero.style.background = `linear-gradient(135deg, ${border} 0%, ${border}cc 100%)`;
      }

      document.getElementById('sheetIdentity').textContent = habit.identity || '';
      document.getElementById('sheetAction').textContent   = habit.routineAction;
      document.getElementById('sheetStreak').textContent   = streak;
      document.getElementById('sheetTotal').textContent    = total;

      let triggerText = `After I ${habit.triggerCue}`;
      if (habit.triggerTime) triggerText += ` at ${habit.triggerTime}`;
      document.getElementById('sheetTrigger').textContent = triggerText;

      const locationRow  = document.getElementById('sheetLocationRow');
      const rewardRow    = document.getElementById('sheetRewardRow');
      const milestoneRow = document.getElementById('sheetMilestoneRow');

      if (habit.routineLocation) {
        document.getElementById('sheetLocation').textContent = habit.routineLocation;
        locationRow.style.display = 'flex';
      } else { locationRow.style.display = 'none'; }

      if (habit.immediateReward) {
        document.getElementById('sheetReward').textContent = habit.immediateReward;
        rewardRow.style.display = 'flex';
      } else { rewardRow.style.display = 'none'; }

      if (nextMilestone) {
        document.getElementById('sheetMilestone').textContent = `Day ${nextMilestone.days}: ${nextMilestone.milestone}`;
        milestoneRow.style.display = 'flex';
      } else { milestoneRow.style.display = 'none'; }

      const twoMinRow = document.getElementById('sheetTwoMinRow');
      if (habit.twoMinuteVersion) {
        document.getElementById('sheetTwoMin').textContent = habit.twoMinuteVersion;
        twoMinRow.style.display = 'flex';
      } else { twoMinRow.style.display = 'none'; }

      const freqRow = document.getElementById('sheetFreqRow');
      const freq = habit.frequency || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const isDaily = freq.length === 7;
      document.getElementById('sheetFreq').textContent = isDaily ? 'Every day' : freq.join(', ');
      freqRow.style.display = 'flex';

      const btn = document.getElementById('sheetCheckBtn');
      btn.textContent = checked ? 'âœ“' : 'â—‹';
      btn.classList.toggle('done', checked);
      document.getElementById('sheetHero').classList.toggle('done', checked);

      document.getElementById('habitSheet').classList.add('open');
      if (typeof updateSheetNotifRow === 'function') updateSheetNotifRow(habitId);
    }

    function closeHabitSheet(e) {
      if (e && e.target !== document.getElementById('habitSheet')) return;
      document.getElementById('habitSheet').classList.remove('open');
      sheetHabitId = null;
    }

    function sheetToggleCheck() {
      if (!sheetHabitId) return;
      toggleHabitCheckIn(sheetHabitId, selectedDate);
      openHabitSheet(sheetHabitId);
    }

    function sheetEdit() {
      document.getElementById('habitSheet').classList.remove('open');
      editHabit(sheetHabitId);
    }

    function sheetDelete() {
      document.getElementById('habitSheet').classList.remove('open');
      deleteHabit(sheetHabitId);
    }

    // â”€â”€ Calendar State â”€â”€
    let calYear = new Date().getFullYear();
    let calMonth = new Date().getMonth(); // 0-indexed

    function switchHabitView(view) {
      const listSection = document.getElementById('viewHabitsSection');
      const calSection  = document.getElementById('calendarHabitsSection');
      const listTab     = document.getElementById('viewHabitsTab');
      const calTab      = document.getElementById('calendarHabitsTab');

      if (view === 'calendar') {
        listSection.style.display = 'none';
        calSection.style.display  = 'block';
        listTab.classList.remove('active');
        listTab.style.color = '#6b7280';
        listTab.style.borderBottomColor = 'transparent';
        calTab.classList.add('active');
        calTab.style.color = '#3b82f6';
        calTab.style.borderBottomColor = '#3b82f6';
        renderCalendar();
      } else {
        calSection.style.display  = 'none';
        listSection.style.display = 'block';
        calTab.classList.remove('active');
        calTab.style.color = '#6b7280';
        calTab.style.borderBottomColor = 'transparent';
        listTab.classList.add('active');
        listTab.style.color = '#3b82f6';
        listTab.style.borderBottomColor = '#3b82f6';
      }
    }

    function shiftCalMonth(delta) {
      calMonth += delta;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      if (calMonth < 0)  { calMonth = 11; calYear--; }
      renderCalendar();
    }

    function renderCalendar() {
      const grid   = document.getElementById('calGrid');
      const label  = document.getElementById('calMonthLabel');
      const legend = document.getElementById('calLegend');
      if (!grid) return;

      const today = getToday();
      const monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];
      label.textContent = `${monthNames[calMonth]} ${calYear}`;

      const firstDay   = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

      grid.innerHTML = '';

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        grid.insertAdjacentHTML('beforeend', '<div></div>');
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const mm      = String(calMonth + 1).padStart(2, '0');
        const dd      = String(d).padStart(2, '0');
        const dateStr = `${calYear}-${mm}-${dd}`;
        const isToday = dateStr === today;

        // Colored dots for each checked habit
        const dots = habits
          .filter(h => habitCheckins.some(c => c.habitId === h.id && c.date === dateStr))
          .map(h => {
            const [color] = getHabitColor(h.id);
            return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;"></span>`;
          }).join('');

        const hasAny = dots.length > 0;
        const bgColor = isToday ? '#eef2ff' : (hasAny ? '#f8fafc' : 'transparent');

        grid.insertAdjacentHTML('beforeend', `
          <div onclick="calDayClick('${dateStr}')"
               style="min-height:44px;border-radius:10px;padding:4px 3px 3px;cursor:pointer;
                      background:${bgColor};border:${isToday ? '2px solid #4f46e5' : '2px solid transparent'};
                      display:flex;flex-direction:column;align-items:center;gap:2px;transition:background 0.15s;">
            <span style="font-size:12px;font-weight:${isToday ? '800' : '500'};color:${isToday ? '#4f46e5' : '#374151'};">${d}</span>
            <div style="display:flex;flex-wrap:wrap;gap:2px;justify-content:center;">${dots}</div>
          </div>
        `);
      }

      // Legend
      legend.innerHTML = habits.map(h => {
        const [color] = getHabitColor(h.id);
        const name = escapeHtml(h.routineAction || h.identity || 'Habit');
        return `<div style="display:flex;align-items:center;gap:5px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
          <span style="font-size:11px;color:#6b7280;font-weight:500;">${name}</span>
        </div>`;
      }).join('');
    }

    function calDayClick(dateStr) {
      selectedDate = dateStr;
      switchHabitView('list');
      updateTimelineView();
    }

    // â”€â”€ Per-Habit Calendar Modal â”€â”€
    let habitCalId = null;
    let habitCalYear = new Date().getFullYear();
    let habitCalMonth = new Date().getMonth();

    function openHabitCal() {
      if (!sheetHabitId) return;
      habitCalId = sheetHabitId;
      habitCalYear = new Date().getFullYear();
      habitCalMonth = new Date().getMonth();
      const habit = habits.find(h => h.id === habitCalId);
      document.getElementById('habitCalHabitName').textContent = habit ? (habit.routineAction || 'Habit') : 'Habit';
      document.getElementById('habitCalIdentity').textContent = habit ? (habit.identity || '') : '';
      renderHabitCal();
      const modal = document.getElementById('habitCalModal');
      modal.style.display = 'flex';
      requestAnimationFrame(() => modal.style.opacity = '1');
    }

    function closeHabitCal(e) {
      if (e && e.target !== document.getElementById('habitCalModal')) return;
      document.getElementById('habitCalModal').style.display = 'none';
    }

    function shiftHabitCalMonth(delta) {
      habitCalMonth += delta;
      if (habitCalMonth > 11) { habitCalMonth = 0; habitCalYear++; }
      if (habitCalMonth < 0)  { habitCalMonth = 11; habitCalYear--; }
      renderHabitCal();
    }

    function renderHabitCal() {
      const grid   = document.getElementById('habitCalGrid');
      const label  = document.getElementById('habitCalMonthLabel');
      const stats  = document.getElementById('habitCalStats');
      if (!grid || !habitCalId) return;

      const today = getToday();
      const habit = habits.find(h => h.id === habitCalId);
      const [accentColor] = habit ? getHabitColor(habit.id) : ['#4f46e5'];

      const monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];
      label.textContent = `${monthNames[habitCalMonth]} ${habitCalYear}`;

      const firstDay    = new Date(habitCalYear, habitCalMonth, 1).getDay();
      const daysInMonth = new Date(habitCalYear, habitCalMonth + 1, 0).getDate();

      // Count completions this month
      let monthCount = 0;

      grid.innerHTML = '';

      // Empty leading cells
      for (let i = 0; i < firstDay; i++) {
        grid.insertAdjacentHTML('beforeend', '<div></div>');
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const mm      = String(habitCalMonth + 1).padStart(2, '0');
        const dd      = String(d).padStart(2, '0');
        const dateStr = `${habitCalYear}-${mm}-${dd}`;
        const isToday = dateStr === today;
        const checked = habitCheckins.some(c => c.habitId === habitCalId && c.date === dateStr);
        const scheduled = habit ? isScheduledOnDate(habit, dateStr) : true;

        if (checked) monthCount++;

        let bg, border, numColor, numWeight;
        if (checked) {
          bg = accentColor; border = accentColor; numColor = '#fff'; numWeight = '700';
        } else if (isToday) {
          bg = '#eef2ff'; border = '#4f46e5'; numColor = '#4f46e5'; numWeight = '800';
        } else if (scheduled) {
          bg = '#f8fafc'; border = '#e5e7eb'; numColor = '#374151'; numWeight = '500';
        } else {
          bg = 'transparent'; border = 'transparent'; numColor = '#d1d5db'; numWeight = '400';
        }

        grid.insertAdjacentHTML('beforeend', `
          <div style="aspect-ratio:1;border-radius:10px;background:${bg};border:2px solid ${border};
                      display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity 0.15s;"
               onclick="habitCalDayClick('${dateStr}')"
               title="${dateStr}">
            <span style="font-size:13px;font-weight:${numWeight};color:${numColor};">${d}</span>
          </div>
        `);
      }

      // Stats strip
      const totalCheckins = habitCheckins.filter(c => c.habitId === habitCalId).length;
      const streak = getStreak(habitCalId, today);
      stats.innerHTML = `
        <div style="flex:1;background:#f8fafc;border-radius:14px;padding:12px 8px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:${accentColor};">${monthCount}</div>
          <div style="font-size:11px;color:#6b7280;font-weight:600;margin-top:2px;">This Month</div>
        </div>
        <div style="flex:1;background:#f8fafc;border-radius:14px;padding:12px 8px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#f59e0b;">${streak}</div>
          <div style="font-size:11px;color:#6b7280;font-weight:600;margin-top:2px;">ðŸ”¥ Streak</div>
        </div>
        <div style="flex:1;background:#f8fafc;border-radius:14px;padding:12px 8px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#10b981;">${totalCheckins}</div>
          <div style="font-size:11px;color:#6b7280;font-weight:600;margin-top:2px;">âœ… Total</div>
        </div>
      `;
    }

    function habitCalDayClick(dateStr) {
      // Toggle check-in directly from calendar
      toggleHabitCheckIn(habitCalId, dateStr);
      renderHabitCal();
    }

    // â”€â”€ Wizard suggestions â”€â”€
    const WIZ_SUGGESTIONS = {
      identity: [
        'a reader', 'a runner', 'an athlete', 'a meditator',
        'a healthy eater', 'a writer', 'an early riser',
        'someone who exercises daily', 'a lifelong learner',
        'a minimalist', 'a journaler', 'someone who drinks more water',
        'a focused worker', 'a grateful person', 'a strong person'
      ],
      action: [
        'read 10 pages', 'meditate for 5 minutes', 'do 10 push-ups',
        'drink a glass of water', 'go for a 20-min walk', 'write 200 words',
        'stretch for 5 minutes', 'review my goals', 'practice gratitude',
        'do 15 minutes of exercise', 'plan tomorrow\'s tasks',
        'learn one new thing', 'call a friend or family member',
        'cook a healthy meal', 'sleep by 10 pm'
      ],
      cue: [
        'wake up', 'finish my morning coffee', 'brush my teeth',
        'eat lunch', 'finish work for the day', 'sit down at my desk',
        'arrive home', 'eat dinner', 'get into bed',
        'put on my workout clothes', 'open my laptop',
        'finish my commute', 'make tea or coffee', 'take a shower'
      ]
    };

    function wizInitSuggestions() {
      function setup(inputId, chipsId, suggestions) {
        const input = document.getElementById(inputId);
        const chips = document.getElementById(chipsId);
        if (!input || !chips) return;

        // Render all chips once
        chips.innerHTML = suggestions.map(s =>
          `<div class="wiz-chip" onclick="wizPickChip('${inputId}','${chipsId}',this)">${s}</div>`
        ).join('');

        input.addEventListener('focus', () => {
          wizFilterChips(input, chips, suggestions);
          chips.classList.add('open');
        });
        input.addEventListener('input', () => wizFilterChips(input, chips, suggestions));
        input.addEventListener('blur', () => {
          // Small delay so chip click fires first
          setTimeout(() => chips.classList.remove('open'), 180);
        });
      }

      setup('identity',      'identityChips', WIZ_SUGGESTIONS.identity);
      setup('routineAction', 'actionChips',   WIZ_SUGGESTIONS.action);
      setup('triggerCue',    'cueChips',      WIZ_SUGGESTIONS.cue);
    }

    function wizFilterChips(input, chips, suggestions) {
      const q = input.value.toLowerCase();
      const filtered = q
        ? suggestions.filter(s => s.toLowerCase().includes(q))
        : suggestions;
      chips.innerHTML = filtered.map(s =>
        `<div class="wiz-chip" onclick="wizPickChip('${input.id}','${chips.id}',this)">${s}</div>`
      ).join('');
    }

    function wizPickChip(inputId, chipsId, el) {
      document.getElementById(inputId).value = el.textContent;
      document.getElementById(chipsId).classList.remove('open');
    }

    wizInitSuggestions();

    updateTimelineView();
    function wizSetStep(step) {
      [1,2,3].forEach(i => {
        document.getElementById(`wizStep${i}`).classList.toggle('active', i === step);
        const dot = document.getElementById(`wdot${i}`);
        dot.className = 'wizard-step-dot ' + (i < step ? 'done' : i === step ? 'active' : 'idle');
        dot.textContent = i < step ? 'âœ“' : String(i);
      });
      [1,2].forEach(i => {
        const line = document.getElementById(`wline${i}`);
        if (line) line.classList.toggle('done', i < step);
      });
    }

    function wizNext(fromStep) {
      if (fromStep === 1) {
        const identity = document.getElementById('identity').value.trim();
        const action   = document.getElementById('routineAction').value.trim();
        if (!identity || !action) { showToast('Fill in identity and habit action', 'error'); return; }
      }
      if (fromStep === 2) {
        const cue = document.getElementById('triggerCue').value.trim();
        if (!cue) { showToast('Add a trigger cue to stack your habit', 'error'); return; }
      }
      wizSetStep(fromStep + 1);
    }

    function wizBack(fromStep) { wizSetStep(fromStep - 1); }

    function wizReset() {
      wizSetStep(1);
      document.querySelectorAll('.wiz-day').forEach(el => el.classList.remove('sel'));
    }

    // Day toggle in wizard
    document.querySelectorAll('.wiz-day').forEach(el => {
      el.addEventListener('click', () => el.classList.toggle('sel'));
    });

    updateTimelineView();
</script>
