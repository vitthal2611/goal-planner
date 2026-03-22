/**
 * habit-form.js — Add / Edit Habit Wizard module
 *
 * Responsibilities:
 *  - HabitForm.open()       — show wizard (add mode)
 *  - HabitForm.edit(habit)  — populate wizard for editing
 *  - HabitForm.init()       — wire addHabitBtn, form submit, day toggles, suggestions
 *
 * Globals exposed (called from inline onclick in HTML):
 *  - window.wizNext(step)
 *  - window.wizBack(step)
 *  - window.wizPickChip(inputId, chipsId, el)
 *  - window.removeReward(btn)
 *  - window.removeProgression(btn)
 *  - window.removeMilestone(btn)
 *
 * Depends on globals (main habit script):
 *  - habits, habitCheckins  (arrays, let vars in main script)
 *  - saveHabits()
 *  - updateTimelineView()
 *  - showToast()
 */

(function () {

  // ── State ─────────────────────────────────────────────────────
  let editingHabitId = null;

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  // ── Wizard step control ───────────────────────────────────────

  function wizSetStep(step) {
    [1, 2, 3].forEach(i => {
      el(`wizStep${i}`).classList.toggle('active', i === step);
      const dot = el(`wdot${i}`);
      dot.className = 'wizard-step-dot ' + (i < step ? 'done' : i === step ? 'active' : 'idle');
      dot.textContent = i < step ? '✓' : String(i);
    });
    [1, 2].forEach(i => {
      const line = el(`wline${i}`);
      if (line) line.classList.toggle('done', i < step);
    });
  }

  function wizReset() {
    wizSetStep(1);
    document.querySelectorAll('.wiz-day').forEach(d => d.classList.remove('sel'));
  }

  // ── Open / close ──────────────────────────────────────────────

  function open() {
    editingHabitId = null;
    const submitBtn = el('submitHabitBtn');
    if (submitBtn) { submitBtn.textContent = '✓ Save Habit'; submitBtn.style.background = ''; }
    wizReset();
    el('createHabitSection').style.display = 'block';
    el('viewHabitsSection').style.display  = 'none';
    _setTabActive(false);
    el('identity').focus();
  }

  function close() {
    el('createHabitSection').style.display = 'none';
    el('viewHabitsSection').style.display  = 'block';
    _setTabActive(true);
  }

  function _setTabActive(active) {
    const tab = el('viewHabitsTab');
    if (!tab) return;
    tab.classList.toggle('active', active);
    tab.style.color = active ? '#3b82f6' : '#6b7280';
    tab.style.borderBottomColor = active ? '#3b82f6' : 'transparent';
  }

  // ── Edit mode ─────────────────────────────────────────────────

  function edit(habit) {
    if (!habit) return;
    editingHabitId = habit.id;

    el('identity').value        = habit.identity ? habit.identity.replace('I am ', '') : '';
    el('triggerCue').value      = habit.triggerCue      || '';
    el('triggerTime').value     = habit.triggerTime     || '';
    el('routineAction').value   = habit.routineAction   || '';
    el('routineLocation').value = habit.routineLocation || '';
    el('immediateReward').value = habit.immediateReward || '';
    el('twoMinuteVersion').value= habit.twoMinuteVersion|| '';

    // Frequency day grid
    const freqDays = habit.frequency || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    document.querySelectorAll('.wiz-day').forEach(d => {
      d.classList.toggle('sel', freqDays.includes(d.dataset.day));
    });

    // Milestones (hidden list, kept for data compat)
    const milestonesList = el('milestonesList');
    if (milestonesList) {
      milestonesList.innerHTML = '';
      (habit.milestones || []).forEach(m => {
        milestonesList.appendChild(_makeMilestoneEl(m.days, m.milestone));
      });
    }

    // Progressions (hidden list, kept for data compat)
    const progressionList = el('progressionList');
    if (progressionList) {
      progressionList.innerHTML = '';
      (habit.progressions || []).forEach(p => {
        progressionList.appendChild(_makeProgressionEl(p.days, p.progression));
      });
    }

    const submitBtn = el('submitHabitBtn');
    if (submitBtn) {
      submitBtn.textContent = '💾 Update Atomic Habit';
      submitBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }

    el('createHabitSection').style.display = 'block';
    el('viewHabitsSection').style.display  = 'none';
    _setTabActive(false);
    wizSetStep(1);
    el('identity').focus();
  }

  // ── Form submit ───────────────────────────────────────────────

  function _handleSubmit(e) {
    e.preventDefault();

    const identity        = 'I am ' + el('identity').value.trim();
    const triggerCue      = el('triggerCue').value.trim();
    const triggerTime     = el('triggerTime').value;
    const routineAction   = el('routineAction').value.trim();
    const routineLocation = el('routineLocation').value.trim();
    const immediateReward = el('immediateReward').value.trim();
    const twoMinuteVersion= el('twoMinuteVersion').value.trim();
    const freqDays        = [...document.querySelectorAll('.wiz-day.sel')].map(d => d.dataset.day);
    const frequency       = freqDays.length > 0 ? freqDays : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    if (!identity || !triggerCue || !routineAction || !routineLocation || !immediateReward) {
      if (typeof showToast === 'function') showToast('Please fill all required fields', 'error');
      return;
    }

    const milestones = [];
    document.querySelectorAll('.milestone-item').forEach(item => {
      const days      = item.querySelector('.milestone-days')?.value;
      const milestone = item.querySelector('.milestone-text')?.value.trim();
      if (days && milestone) milestones.push({ days: parseInt(days), milestone });
    });

    const progressions = [];
    document.querySelectorAll('.progression-item').forEach(item => {
      const days        = item.querySelector('.progression-days')?.value;
      const progression = item.querySelector('.progression-text')?.value.trim();
      if (days && progression) progressions.push({ days: parseInt(days), progression });
    });

    const habitData = {
      identity, triggerCue, triggerTime, routineAction,
      routineLocation, immediateReward, twoMinuteVersion, frequency,
      milestones:   milestones.sort((a, b) => a.days - b.days),
      progressions: progressions.sort((a, b) => a.days - b.days),
    };

    if (editingHabitId) {
      const idx = habits.findIndex(h => h.id === editingHabitId);
      if (idx > -1) {
        habits[idx] = { ...habits[idx], ...habitData };
        if (typeof saveHabits        === 'function') saveHabits();
        if (typeof updateTimelineView=== 'function') updateTimelineView();
        if (typeof showToast         === 'function') showToast(`Habit updated: ${identity}`, 'success');
        editingHabitId = null;
      }
    } else {
      habits.push({
        id: Date.now().toString(),
        ...habitData,
        createdAt: new Date().toISOString(),
      });
      if (typeof saveHabits        === 'function') saveHabits();
      if (typeof updateTimelineView=== 'function') updateTimelineView();
      if (typeof showToast         === 'function') showToast(`Atomic habit created: ${identity}`, 'success');
    }

    // Reset
    el('atomicHabitForm').reset();
    if (el('milestonesList'))  el('milestonesList').innerHTML  = '';
    if (el('progressionList')) el('progressionList').innerHTML = '';
    wizReset();
    close();
  }

  // ── Wizard navigation (global, called from inline onclick) ────

  window.wizNext = function (fromStep) {
    if (fromStep === 1) {
      if (!el('identity').value.trim() || !el('routineAction').value.trim()) {
        if (typeof showToast === 'function') showToast('Fill in identity and habit action', 'error');
        return;
      }
    }
    if (fromStep === 2) {
      if (!el('triggerCue').value.trim()) {
        if (typeof showToast === 'function') showToast('Add a trigger cue to stack your habit', 'error');
        return;
      }
    }
    wizSetStep(fromStep + 1);
  };

  window.wizBack = function (fromStep) { wizSetStep(fromStep - 1); };

  // ── Suggestion chips ──────────────────────────────────────────

  const WIZ_SUGGESTIONS = {
    identity: [
      'a reader', 'a runner', 'an athlete', 'a meditator',
      'a healthy eater', 'a writer', 'an early riser',
      'someone who exercises daily', 'a lifelong learner',
      'a minimalist', 'a journaler', 'someone who drinks more water',
      'a focused worker', 'a grateful person', 'a strong person',
    ],
    action: [
      'read 10 pages', 'meditate for 5 minutes', 'do 10 push-ups',
      'drink a glass of water', 'go for a 20-min walk', 'write 200 words',
      'stretch for 5 minutes', 'review my goals', 'practice gratitude',
      'do 15 minutes of exercise', "plan tomorrow's tasks",
      'learn one new thing', 'call a friend or family member',
      'cook a healthy meal', 'sleep by 10 pm',
    ],
    cue: [
      'wake up', 'finish my morning coffee', 'brush my teeth',
      'eat lunch', 'finish work for the day', 'sit down at my desk',
      'arrive home', 'eat dinner', 'get into bed',
      'put on my workout clothes', 'open my laptop',
      'finish my commute', 'make tea or coffee', 'take a shower',
    ],
  };

  function _initSuggestions() {
    function setup(inputId, chipsId, suggestions) {
      const input = el(inputId);
      const chips = el(chipsId);
      if (!input || !chips) return;

      chips.innerHTML = suggestions.map(s =>
        `<div class="wiz-chip" onclick="wizPickChip('${inputId}','${chipsId}',this)">${s}</div>`
      ).join('');

      input.addEventListener('focus', () => {
        _filterChips(input, chips, suggestions);
        chips.classList.add('open');
      });
      input.addEventListener('input', () => _filterChips(input, chips, suggestions));
      input.addEventListener('blur',  () => setTimeout(() => chips.classList.remove('open'), 180));
    }

    setup('identity',      'identityChips', WIZ_SUGGESTIONS.identity);
    setup('routineAction', 'actionChips',   WIZ_SUGGESTIONS.action);
    setup('triggerCue',    'cueChips',      WIZ_SUGGESTIONS.cue);
  }

  function _filterChips(input, chips, suggestions) {
    const q = input.value.toLowerCase();
    const filtered = q ? suggestions.filter(s => s.toLowerCase().includes(q)) : suggestions;
    chips.innerHTML = filtered.map(s =>
      `<div class="wiz-chip" onclick="wizPickChip('${input.id}','${chips.id}',this)">${s}</div>`
    ).join('');
  }

  window.wizPickChip = function (inputId, chipsId, elRef) {
    el(inputId).value = elRef.textContent;
    el(chipsId).classList.remove('open');
  };

  // ── Dynamic field builders (hidden, kept for data compat) ─────

  function _makeMilestoneEl(days, text) {
    const div = document.createElement('div');
    div.className = 'milestone-item';
    div.style.cssText = 'display:flex;gap:8px;align-items:center;padding:12px;background:#dbeafe;border-radius:12px;border:2px solid #3b82f6;';
    div.innerHTML = `
      <span style="font-size:16px;font-weight:600;color:#1e40af;">Day</span>
      <input type="number" class="milestone-days" value="${days}" min="1" style="width:60px;padding:8px 12px;border:2px solid #3b82f6;border-radius:8px;font-size:14px;font-weight:600;text-align:center;background:white;" />
      <span style="font-size:16px;font-weight:600;color:#1e40af;">-</span>
      <input type="text" class="milestone-text" value="${text}" style="flex:1;padding:8px 12px;border:2px solid #3b82f6;border-radius:8px;font-size:14px;background:white;" />
      <button type="button" onclick="removeMilestone(this)" style="padding:6px 10px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">×</button>`;
    return div;
  }

  function _makeProgressionEl(days, text) {
    const div = document.createElement('div');
    div.className = 'progression-item';
    div.style.cssText = 'display:flex;gap:8px;align-items:center;padding:12px;background:#dbeafe;border-radius:12px;border:2px solid #4f46e5;';
    div.innerHTML = `
      <span style="font-size:16px;font-weight:600;color:#1e40af;">After</span>
      <input type="number" class="progression-days" value="${days}" min="1" style="width:60px;padding:8px 12px;border:2px solid #4f46e5;border-radius:8px;font-size:14px;font-weight:600;text-align:center;background:white;" />
      <span style="font-size:16px;font-weight:600;color:#1e40af;">days, I will</span>
      <input type="text" class="progression-text" value="${text}" style="flex:1;padding:8px 12px;border:2px solid #4f46e5;border-radius:8px;font-size:14px;background:white;" />
      <button type="button" onclick="removeProgression(this)" style="padding:6px 10px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">×</button>`;
    return div;
  }

  // Global remove helpers (called from inline onclick)
  window.removeMilestone   = btn => btn.parentElement.remove();
  window.removeProgression = btn => btn.parentElement.remove();
  window.removeReward      = btn => btn.parentElement.remove();

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    // addHabitBtn
    const addBtn = el('addHabitBtn');
    if (addBtn) addBtn.addEventListener('click', open);

    // Form submit
    const form = el('atomicHabitForm');
    if (form) form.addEventListener('submit', _handleSubmit);

    // Day toggles
    document.querySelectorAll('.wiz-day').forEach(d => {
      d.addEventListener('click', () => d.classList.toggle('sel'));
    });

    // Suggestion chips
    _initSuggestions();
  }

  // ── Public API ────────────────────────────────────────────────

  window.HabitForm = { open, close, edit, init };

  // editHabit is called from inline onclick in habit cards
  window.editHabit = function (habitId) {
    const habit = (typeof habits !== 'undefined' ? habits : []).find(h => h.id === habitId);
    if (habit) HabitForm.edit(habit);
  };

})();
