/**
 * date-navigation.js
 * Single ← Month Year → date picker.
 * Hidden yearSelect / monthSelect are kept in sync so all other modules
 * (balance-summary, envelope-budget, etc.) continue to work unchanged.
 */

(function () {
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function el(id) { return document.getElementById(id); }

  // ── Internal state ────────────────────────────────────────────
  let currentYear;
  let currentMonth; // 1-12, or 0 = "All Months"

  // ── Sync hidden selects so downstream modules stay happy ──────

  function syncSelects() {
    const yearSelect  = el('yearSelect');
    const monthSelect = el('monthSelect');
    if (!yearSelect || !monthSelect) return;

    // Rebuild year options if needed
    if (!yearSelect.querySelector(`option[value="${currentYear}"]`)) {
      generateYearDropdown();
    }
    yearSelect.value = currentYear;

    // Rebuild month options for this year
    generateMonthDropdown();

    if (currentMonth === 0) {
      monthSelect.value = 'ALL';
    } else {
      monthSelect.value = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    }
  }

  // ── Label renderer ────────────────────────────────────────────

  function updateLabel() {
    const label = el('dateNavLabel');
    if (!label) return;
    label.textContent = currentMonth === 0
      ? `All  ${currentYear}`
      : `${MONTHS[currentMonth - 1]} ${currentYear}`;
  }

  // ── Navigation ────────────────────────────────────────────────

  function stepMonth(delta) {
    if (currentMonth === 0) {
      // "All Months" → step year
      currentYear += delta;
    } else {
      currentMonth += delta;
      if (currentMonth < 1)  { currentYear--; currentMonth = 12; }
      if (currentMonth > 12) { currentYear++; currentMonth = 1;  }
    }
    syncSelects();
    updateLabel();
    refreshAll();
  }

  // ── Dropdown generators (kept for compatibility) ──────────────

  function generateYearDropdown() {
    const yearSelect = el('yearSelect');
    if (!yearSelect) return;
    const base = new Date().getFullYear();
    const opts = [];
    for (let y = base - 5; y <= base + 5; y++) {
      opts.push(`<option value="${y}">${y}</option>`);
    }
    yearSelect.innerHTML = opts.join('');
    yearSelect.value = currentYear;
  }

  function generateMonthDropdown() {
    const monthSelect = el('monthSelect');
    if (!monthSelect) return;
    const opts = ['<option value="ALL">All Months</option>'];
    for (let i = 1; i <= 12; i++) {
      const val = `${currentYear}-${String(i).padStart(2, '0')}`;
      opts.push(`<option value="${val}">${MONTHS[i-1]} ${currentYear}</option>`);
    }
    monthSelect.innerHTML = opts.join('');
  }

  // ── Refresh all dependent modules ─────────────────────────────

  function refreshAll() {
    if (typeof updateBalanceSummary     === 'function') updateBalanceSummary();
    if (typeof updatePaymentBalances    === 'function') updatePaymentBalances();
    if (typeof updateRecentTransactions === 'function') updateRecentTransactions();
    if (typeof updateEnvelopeBudget     === 'function') updateEnvelopeBudget();
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    const now = new Date();
    currentYear  = now.getFullYear();
    currentMonth = now.getMonth() + 1;

    generateYearDropdown();
    syncSelects();
    updateLabel();

    const prev = el('prevMonth');
    const next = el('nextMonth');
    if (prev) prev.addEventListener('click', () => stepMonth(-1));
    if (next) next.addEventListener('click', () => stepMonth(+1));

    // Clicking the label toggles "All Months" for the current year
    const label = el('dateNavLabel');
    if (label) {
      label.addEventListener('click', () => {
        currentMonth = currentMonth === 0 ? new Date().getMonth() + 1 : 0;
        syncSelects();
        updateLabel();
        refreshAll();
      });
      label.title = 'Click to toggle All Months';
    }
  }

  // ── Public API ────────────────────────────────────────────────
  window.DateNav = {
    generateYearDropdown,
    generateMonthDropdown,
    init,
  };
})();
