/**
 * habit-dashboard.js — Habit Dashboard display module
 *
 * Responsibilities:
 *  - HabitDashboard.update()  — render list view, metrics, date label
 *  - HabitDashboard.init()    — wire prevDay/nextDay/habitDate/groupByIdentity buttons
 *
 * Globals exposed (called from inline onclick in HTML):
 *  - window.toggleHabitCheckIn(habitId, date)
 *  - window.deleteHabit(habitId)
 *  - window.toggleGroupByIdentity()
 *  - window.switchHabitView(view)
 *  - window.shiftCalMonth(delta)
 *  - window.saveHabits()
 *  - window.escapeHtml(str)       — also used by notification modal
 *  - window.getToday()
 *  - window.getStreak(habitId, upToDate)
 *  - window.isCheckedOnDate(habitId, date)
 *  - window.isScheduledOnDate(habit, dateStr)
 *  - window.renderCalendar()
 *  - window.formatDateDisplay(dateStr)
 *  - window.getHabitColor(habitId)
 *  - window.renderHabitCard(habit, date)
 *
 * Depends on globals (main habit script):
 *  - habits, habitCheckins  (let vars — read via localStorage)
 *  - showToast()
 *  - saveUserData()
 *  - openHabitSheet(habitId)
 */

(function () {

  // ── Module state ──────────────────────────────────────────────
  let selectedDate  = new Date().toISOString().split('T')[0];
  let groupByIdentity = false;
  let calYear  = new Date().getFullYear();
  let calMonth = new Date().getMonth(); // 0-indexed

  // ── Storage helpers ───────────────────────────────────────────
  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  // ── Date helpers ──────────────────────────────────────────────

  window.getToday = function () {
    return new Date().toISOString().split('T')[0];
  };

  window.formatDateDisplay = function (dateStr) {
    const date  = new Date(dateStr + 'T00:00:00');
    const today = new Date(window.getToday() + 'T00:00:00');
    const diff  = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff === 0)  return 'Today';
    if (diff === 1)  return 'Yesterday';
    if (diff === -1) return 'Tomorrow';
    if (diff > 1  && diff <= 7)  return `${diff} days ago`;
    if (diff < -1 && diff >= -7) return `In ${Math.abs(diff)} days`;
    return date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  window.escapeHtml = function (str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // ── Habit data helpers ────────────────────────────────────────

  window.saveHabits = function () {
    // Sync in-memory arrays from main script block to localStorage if accessible
    if (typeof habits        !== 'undefined') localStorage.setItem('habits',        JSON.stringify(habits));
    if (typeof habitCheckins !== 'undefined') localStorage.setItem('habitCheckins', JSON.stringify(habitCheckins));
    if (typeof milestones    !== 'undefined') localStorage.setItem('milestones',    JSON.stringify(milestones));
    if (typeof progressions  !== 'undefined') localStorage.setItem('progressions',  JSON.stringify(progressions));
    if (typeof saveUserData  === 'function')  saveUserData();
  };

  window.getStreak = function (habitId, upToDate) {
    const habitCheckins = fromStorage('habitCheckins');
    const endDate = upToDate || window.getToday();
    let streak = 0;
    let checkDate = new Date(endDate);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (!habitCheckins.some(c => c.habitId === habitId && c.date === dateStr)) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  window.isCheckedOnDate = function (habitId, date) {
    return fromStorage('habitCheckins').some(c => c.habitId === habitId && c.date === date);
  };

  function getDayName(dateStr) {
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(dateStr).getDay()];
  }

  window.isScheduledOnDate = function (habit, dateStr) {
    const freq = habit.frequency || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return freq.includes(getDayName(dateStr));
  };

  // ── Palette ───────────────────────────────────────────────────

  const HABIT_PALETTE = [
    ['#6366f1', '#eef2ff', '#4f46e5', '#eef2ff', '#4f46e5'],
    ['#f59e0b', '#fffbeb', '#b45309', '#fef3c7', '#92400e'],
    ['#10b981', '#ecfdf5', '#059669', '#d1fae5', '#065f46'],
    ['#ef4444', '#fff1f2', '#dc2626', '#fee2e2', '#991b1b'],
    ['#8b5cf6', '#f5f3ff', '#7c3aed', '#ede9fe', '#5b21b6'],
    ['#06b6d4', '#ecfeff', '#0891b2', '#cffafe', '#164e63'],
    ['#f97316', '#fff7ed', '#ea580c', '#ffedd5', '#9a3412'],
    ['#ec4899', '#fdf2f8', '#db2777', '#fce7f3', '#831843'],
  ];

  window.getHabitColor = function (habitId) {
    let hash = 0;
    for (let i = 0; i < habitId.length; i++) hash = habitId.charCodeAt(i) + ((hash << 5) - hash);
    return HABIT_PALETTE[Math.abs(hash) % HABIT_PALETTE.length];
  };

  // ── Habit Card renderer ───────────────────────────────────────

  window.renderHabitCard = function (habit, date) {
    const habitCheckins = fromStorage('habitCheckins');
    const checked  = window.isCheckedOnDate(habit.id, date);
    const streak   = window.getStreak(habit.id, date);
    const identityLabel = habit.identity ? window.escapeHtml(habit.identity) : '';
    const timeAnchor    = habit.triggerTime ? window.escapeHtml(habit.triggerTime) : '';
    const location      = habit.routineLocation ? window.escapeHtml(habit.routineLocation) : '';
    const voteCount     = habitCheckins.filter(c => c.habitId === habit.id).length;

    const [border, bgLight, identityColor, badgeBg, badgeColor] = window.getHabitColor(habit.id);

    let triggerParts = [`After I ${window.escapeHtml(habit.triggerCue)}`];
    if (location) triggerParts.push(location);
    const triggerLine = triggerParts.join(' · ');

    const cardBg     = checked ? '#f0fdf4' : bgLight;
    const cardBorder = checked ? '#22c55e' : border;

    return `
      <div class="hc ${checked ? 'hc--done' : ''}"
        onclick="openHabitSheet('${window.escapeHtml(habit.id)}')"
        style="border-left-color:${cardBorder}; background:${cardBg};">
        <button
          class="hc-check ${checked ? 'hc-check--done' : ''}"
          onclick="event.stopPropagation(); toggleHabitCheckIn('${window.escapeHtml(habit.id)}', '${window.escapeHtml(date)}')"
          aria-label="${checked ? 'Mark incomplete' : 'Mark complete'}: ${window.escapeHtml(habit.routineAction)}"
          style="${checked ? '' : `border-color:${border};`}"
        >${checked ? '✓' : '○'}</button>
        <div class="hc-body">
          ${identityLabel ? `<div class="hc-identity" style="color:${checked ? '#16a34a' : identityColor};">${identityLabel} <span style="font-weight:500;opacity:0.65;">· ${voteCount} vote${voteCount !== 1 ? 's' : ''}</span></div>` : ''}
          <div class="hc-action">${window.escapeHtml(habit.routineAction)}</div>
          <div class="hc-trigger">${triggerLine}</div>
        </div>
        ${timeAnchor ? `<div class="hc-time-badge" style="background:${checked ? '#dcfce7' : badgeBg}; color:${checked ? '#15803d' : badgeColor};">${timeAnchor}</div>` : ''}
        <div class="hc-streak ${checked ? 'hc-streak--done' : ''}" style="border-left-color:${checked ? '#bbf7d0' : border}20;">
          <span class="hc-streak-num">${streak}</span>
          <span class="hc-streak-label">streak</span>
        </div>
      </div>
    `;
  };

  // ── Metric Dashboard ──────────────────────────────────────────

  function _renderMetricDashboard(done, total, week7, bestStreak, votes, month30) {
    const el = document.getElementById('habitDashboard');
    if (!el) return;
    const habits = fromStorage('habits');
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
        <div class="metric-streak-num">${bestStreak > 0 ? '🔥' : '💤'}${bestStreak}</div>
        <div class="metric-label">Best Streak</div>
        <div class="metric-sub">${votes} votes cast</div>
      </div>
    `;
  }

  // ── Main update (replaces updateTimelineView) ─────────────────

  function update() {
    const habits        = fromStorage('habits');
    const habitCheckins = fromStorage('habitCheckins');

    const listContainer = document.getElementById('listView');
    const dateDisplay   = document.getElementById('habitDate');
    const habitStats    = document.getElementById('habitStats');

    if (!listContainer || !dateDisplay || !habitStats) return;

    dateDisplay.value = selectedDate;
    _updateDateLabel();

    if (habits.length === 0) {
      listContainer.innerHTML = '<div style="padding: 32px 16px; text-align: center; color: #9ca3af; font-size: 15px;">✨ No habits yet. Create one to get started!</div>';
      habitStats.textContent = '0/0';
      _renderMetricDashboard(0, 0, 0, 0, 0, 0);
      return;
    }

    const sortedHabits = [...habits]
      .filter(h => window.isScheduledOnDate(h, selectedDate))
      .sort((a, b) => (a.triggerTime || '23:59').localeCompare(b.triggerTime || '23:59'));

    const completedCount = sortedHabits.filter(h => window.isCheckedOnDate(h.id, selectedDate)).length;
    const totalToday     = sortedHabits.length;
    habitStats.textContent = `${completedCount}/${totalToday}`;

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

    // ── Metrics ──
    const today = window.getToday();

    let slots7 = 0, done7 = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      habits.forEach(h => {
        if (window.isScheduledOnDate(h, ds)) {
          slots7++;
          if (window.isCheckedOnDate(h.id, ds)) done7++;
        }
      });
    }
    const consistency7 = slots7 > 0 ? Math.round((done7 / slots7) * 100) : 0;

    let slots30 = 0, done30 = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      habits.forEach(h => {
        if (window.isScheduledOnDate(h, ds)) {
          slots30++;
          if (window.isCheckedOnDate(h.id, ds)) done30++;
        }
      });
    }
    const consistency30 = slots30 > 0 ? Math.round((done30 / slots30) * 100) : 0;

    const bestStreak = habits.reduce((max, h) => Math.max(max, window.getStreak(h.id, today)), 0);
    const totalVotes = habitCheckins.length;

    _renderMetricDashboard(completedCount, totalToday, consistency7, bestStreak, totalVotes, consistency30);

    // Never Miss Twice banner
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const trulyMissed = habits.filter(h =>
      window.isScheduledOnDate(h, yesterdayStr) && !window.isCheckedOnDate(h.id, yesterdayStr)
    );
    const neverMissTwiceBanner = (selectedDate === today && trulyMissed.length > 0)
      ? `<div style="display:flex;align-items:center;gap:10px;background:#fff7ed;border:2px solid #fb923c;border-radius:14px;padding:12px 14px;margin-bottom:12px;">
          <span style="font-size:20px;">⚠️</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:#c2410c;">Never Miss Twice</div>
            <div style="font-size:12px;color:#9a3412;margin-top:2px;">You missed ${trulyMissed.length} habit${trulyMissed.length > 1 ? 's' : ''} yesterday. Don't let it become a new habit.</div>
          </div>
         </div>`
      : '';

    if (groupByIdentity) {
      const habitsByIdentity = {};
      sortedHabits.forEach(habit => {
        const identity = habit.identity || 'No Identity';
        if (!habitsByIdentity[identity]) habitsByIdentity[identity] = [];
        habitsByIdentity[identity].push(habit);
      });

      const listHTML = Object.entries(habitsByIdentity).map(([identity, groupHabits]) => {
        const identityName = identity.replace('I am ', '');
        const habitsHTML   = groupHabits.map(habit => window.renderHabitCard(habit, selectedDate)).join('');
        return `
          <div class="identity-group">
            <div class="identity-header">✨ ${identityName}</div>
            <div class="identity-habits">${habitsHTML}</div>
          </div>`;
      }).join('');

      listContainer.innerHTML = neverMissTwiceBanner + (listHTML || '<div style="padding: 32px 16px; text-align: center; color: #64748b; font-size: 16px;">✨ No habits scheduled for today.</div>');
    } else {
      const listHTML = sortedHabits.map(habit => window.renderHabitCard(habit, selectedDate)).join('');
      listContainer.innerHTML = neverMissTwiceBanner + (listHTML || '<div style="padding: 32px 16px; text-align: center; color: #64748b; font-size: 16px;">✨ No habits scheduled for today.</div>');
    }
  }

  // ── Date label ────────────────────────────────────────────────

  function _updateDateLabel() {
    const dateLabel = document.getElementById('dateLabel');
    if (dateLabel) dateLabel.textContent = window.formatDateDisplay(selectedDate);
  }

  // ── Globals: check-in / delete / group ───────────────────────

  window.toggleHabitCheckIn = function (habitId, date) {
    // Mutate in-memory arrays if accessible, else mutate localStorage directly
    if (typeof habitCheckins !== 'undefined') {
      const index = habitCheckins.findIndex(c => c.habitId === habitId && c.date === date);
      if (index > -1) {
        habitCheckins.splice(index, 1);
        window.saveHabits();
        update();
        const calSection = document.getElementById('calendarHabitsSection');
        if (calSection && calSection.style.display !== 'none') window.renderCalendar();
        if (typeof showToast === 'function') showToast('Habit unchecked', 'success');
      } else {
        habitCheckins.push({ habitId, date });
        window.saveHabits();
        update();
        const calSection = document.getElementById('calendarHabitsSection');
        if (calSection && calSection.style.display !== 'none') window.renderCalendar();
        if (typeof showToast === 'function') showToast('Habit completed! 🎉', 'success');
      }
    } else {
      // Fallback: mutate localStorage directly
      const checkins = JSON.parse(localStorage.getItem('habitCheckins') || '[]');
      const index = checkins.findIndex(c => c.habitId === habitId && c.date === date);
      if (index > -1) {
        checkins.splice(index, 1);
        if (typeof showToast === 'function') showToast('Habit unchecked', 'success');
      } else {
        checkins.push({ habitId, date });
        if (typeof showToast === 'function') showToast('Habit completed! 🎉', 'success');
      }
      localStorage.setItem('habitCheckins', JSON.stringify(checkins));
      if (typeof saveUserData === 'function') saveUserData();
      update();
      const calSection = document.getElementById('calendarHabitsSection');
      if (calSection && calSection.style.display !== 'none') window.renderCalendar();
    }
  };

  window.deleteHabit = function (habitId) {
    if (typeof habits !== 'undefined' && typeof habitCheckins !== 'undefined') {
      habits.splice(0, habits.length, ...habits.filter(h => h.id !== habitId));
      habitCheckins.splice(0, habitCheckins.length, ...habitCheckins.filter(c => c.habitId !== habitId));
      window.saveHabits();
    } else {
      const hs = JSON.parse(localStorage.getItem('habits') || '[]').filter(h => h.id !== habitId);
      const cs = JSON.parse(localStorage.getItem('habitCheckins') || '[]').filter(c => c.habitId !== habitId);
      localStorage.setItem('habits', JSON.stringify(hs));
      localStorage.setItem('habitCheckins', JSON.stringify(cs));
      if (typeof saveUserData === 'function') saveUserData();
    }
    update();
    if (typeof showToast === 'function') showToast('Habit deleted', 'error');
  };

  window.toggleGroupByIdentity = function () {
    groupByIdentity = !groupByIdentity;
    const btn = document.getElementById('groupByIdentityBtn');
    if (btn) {
      if (groupByIdentity) {
        btn.style.background   = 'linear-gradient(135deg, #4f46e5, #6366f1)';
        btn.style.color        = 'white';
        btn.style.borderColor  = '#4f46e5';
      } else {
        btn.style.background   = 'transparent';
        btn.style.color        = '#6b7280';
        btn.style.borderColor  = '#e5e7eb';
      }
    }
    update();
  };

  // ── View switching ────────────────────────────────────────────

  window.switchHabitView = function (view) {
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
      window.renderCalendar();
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
  };

  // ── Calendar ──────────────────────────────────────────────────

  window.shiftCalMonth = function (delta) {
    calMonth += delta;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0)  { calMonth = 11; calYear--; }
    window.renderCalendar();
  };

  window.renderCalendar = function () {
    const habits        = fromStorage('habits');
    const habitCheckins = fromStorage('habitCheckins');
    const grid   = document.getElementById('calGrid');
    const label  = document.getElementById('calMonthLabel');
    const legend = document.getElementById('calLegend');
    if (!grid) return;

    const today = window.getToday();
    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    label.textContent = `${monthNames[calMonth]} ${calYear}`;

    const firstDay    = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    grid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) grid.insertAdjacentHTML('beforeend', '<div></div>');

    for (let d = 1; d <= daysInMonth; d++) {
      const mm      = String(calMonth + 1).padStart(2, '0');
      const dd      = String(d).padStart(2, '0');
      const dateStr = `${calYear}-${mm}-${dd}`;
      const isToday = dateStr === today;

      const dots = habits
        .filter(h => habitCheckins.some(c => c.habitId === h.id && c.date === dateStr))
        .map(h => {
          const [color] = window.getHabitColor(h.id);
          return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;"></span>`;
        }).join('');

      const hasAny  = dots.length > 0;
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

    legend.innerHTML = habits.map(h => {
      const [color] = window.getHabitColor(h.id);
      const name = window.escapeHtml(h.routineAction || h.identity || 'Habit');
      return `<div style="display:flex;align-items:center;gap:5px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
        <span style="font-size:11px;color:#6b7280;font-weight:500;">${name}</span>
      </div>`;
    }).join('');
  };

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    const prevDayBtn     = document.getElementById('prevDay');
    const nextDayBtn     = document.getElementById('nextDay');
    const habitDateInput = document.getElementById('habitDate');

    if (prevDayBtn) {
      prevDayBtn.classList.add('day-nav-btn');
      prevDayBtn.addEventListener('click', () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        selectedDate = date.toISOString().split('T')[0];
        update();
      });
    }

    if (nextDayBtn) {
      nextDayBtn.classList.add('day-nav-btn');
      nextDayBtn.addEventListener('click', () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        selectedDate = date.toISOString().split('T')[0];
        update();
      });
    }

    if (habitDateInput) {
      habitDateInput.addEventListener('change', e => {
        selectedDate = e.target.value;
        update();
      });
    }
  }

  // ── Public API ────────────────────────────────────────────────

  window.HabitDashboard = {
    update,
    init,
    getSelectedDate: () => selectedDate,
    setSelectedDate: (d) => { selectedDate = d; },
  };

  // updateTimelineView alias — habit-form.js calls this after save
  window.updateTimelineView = function () { update(); };

})();
