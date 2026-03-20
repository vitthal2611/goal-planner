  // â”€â”€ Habit Notifications â”€â”€
  let habitNotifications = JSON.parse(localStorage.getItem('habitNotifications') || '{}');
  // { habitId: { enabled: true, time: "08:00" } }

  let notifTimers = {};

  function saveHabitNotifications() {
    localStorage.setItem('habitNotifications', JSON.stringify(habitNotifications));
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  function scheduleHabitNotifications() {
    // Clear existing timers
    Object.values(notifTimers).forEach(clearTimeout);
    notifTimers = {};

    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = new Date();
    Object.entries(habitNotifications).forEach(([habitId, cfg]) => {
      if (!cfg.enabled || !cfg.time) return;
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const [hh, mm] = cfg.time.split(':').map(Number);
      const fire = new Date(now);
      fire.setHours(hh, mm, 0, 0);
      if (fire <= now) fire.setDate(fire.getDate() + 1);

      const delay = fire - now;
      notifTimers[habitId] = setTimeout(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        if (isScheduledOnDate(habit, todayStr) && !isCheckedOnDate(habitId, todayStr)) {
          new Notification('Habit Reminder ðŸ””', {
            body: habit.routineAction,
            icon: '/favicon.ico',
            tag: `habit-${habitId}`
          });
        }
        // Reschedule for next day
        scheduleHabitNotifications();
      }, delay);
    });
  }

  async function openNotificationSettings() {
    const granted = await requestNotifPermission();
    const modal = document.getElementById('notifModal');
    const banner = document.getElementById('notifPermBanner');
    banner.style.display = (!('Notification' in window) || Notification.permission === 'denied') ? 'block' : 'none';

    const list = document.getElementById('notifHabitList');
    if (habits.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:24px;">No habits yet.</div>';
    } else {
      list.innerHTML = habits.map(h => {
        const cfg = habitNotifications[h.id] || { enabled: false, time: h.triggerTime || '08:00' };
        const on = cfg.enabled;
        return `
          <div style="display:flex;align-items:center;gap:12px;background:#f8fafc;border-radius:14px;padding:12px 14px;border:2px solid ${on ? '#10b981' : '#e5e7eb'};">
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:700;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(h.routineAction)}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:2px;">${escapeHtml(h.identity || '')}</div>
            </div>
            <input type="time" value="${escapeHtml(cfg.time || '08:00')}"
              onchange="setHabitNotifTime('${escapeHtml(h.id)}', this.value)"
              style="border:2px solid #e5e7eb;border-radius:8px;padding:4px 8px;font-size:13px;font-weight:600;color:#374151;background:#fff;outline:none;width:90px;${on ? '' : 'opacity:0.5;'}">
            <div onclick="toggleNotifEnabled('${escapeHtml(h.id)}')" style="width:44px;height:24px;border-radius:12px;background:${on ? '#10b981' : '#e5e7eb'};position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;">
              <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:${on ? '22px' : '2px'};transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>
            </div>
          </div>`;
      }).join('');
    }

    modal.style.display = 'flex';
  }

  function closeNotifModal(e) {
    if (e && e.target !== document.getElementById('notifModal')) return;
    document.getElementById('notifModal').style.display = 'none';
  }

  async function toggleNotifEnabled(habitId) {
    const granted = await requestNotifPermission();
    if (!granted) {
      document.getElementById('notifPermBanner').style.display = 'block';
      return;
    }
    const cfg = habitNotifications[habitId] || { enabled: false, time: '08:00' };
    cfg.enabled = !cfg.enabled;
    habitNotifications[habitId] = cfg;
    saveHabitNotifications();
    scheduleHabitNotifications();
    openNotificationSettings(); // re-render
    showToast(cfg.enabled ? 'Reminder enabled ðŸ””' : 'Reminder off', cfg.enabled ? 'success' : 'error');
  }

  function setHabitNotifTime(habitId, time) {
    const cfg = habitNotifications[habitId] || { enabled: false, time: '08:00' };
    cfg.time = time;
    habitNotifications[habitId] = cfg;
    saveHabitNotifications();
    scheduleHabitNotifications();
  }

  // Update notification toggle in habit detail sheet
  function updateSheetNotifRow(habitId) {
    const cfg = habitNotifications[habitId] || { enabled: false, time: '' };
    const on = cfg.enabled;
    const toggle = document.getElementById('sheetNotifToggle');
    const thumb = document.getElementById('sheetNotifThumb');
    const val = document.getElementById('sheetNotifValue');
    if (!toggle) return;
    toggle.style.background = on ? '#10b981' : '#e5e7eb';
    thumb.style.left = on ? '22px' : '2px';
    val.textContent = on ? `Daily at ${cfg.time}` : 'Off';
  }

  async function toggleHabitNotification() {
    if (!sheetHabitId) return;
    const granted = await requestNotifPermission();
    if (!granted) {
      showToast('Please allow notifications in browser settings', 'error');
      return;
    }
    const cfg = habitNotifications[sheetHabitId] || { enabled: false, time: '08:00' };
    cfg.enabled = !cfg.enabled;
    habitNotifications[sheetHabitId] = cfg;
    saveHabitNotifications();
    scheduleHabitNotifications();
    updateSheetNotifRow(sheetHabitId);
    showToast(cfg.enabled ? 'Reminder enabled ðŸ””' : 'Reminder off', cfg.enabled ? 'success' : 'error');
  }

  // Kick off scheduling on load
  scheduleHabitNotifications();
