/**
 * date-navigation.js
 * Handles year/month dropdown generation and navigation for the Finance tab.
 * Depends on: yearSelect, monthSelect, prevYear, nextYear, prevMonth, nextMonth (DOM elements)
 * Calls: updateBalanceSummary, updatePaymentBalances, updateRecentTransactions, updateEnvelopeBudget (globals)
 */

(function () {
  // ── Element refs ──────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  // ── Dropdown generators ───────────────────────────────────────

  function generateYearDropdown() {
    const yearSelect = el('yearSelect');
    if (!yearSelect) return;
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let year = currentYear - 2; year <= currentYear + 5; year++) {
      options.push(`<option value="${year}">${year}</option>`);
    }
    yearSelect.innerHTML = options.join('');
    yearSelect.value = currentYear;
  }

  function generateMonthDropdown() {
    const yearSelect  = el('yearSelect');
    const monthSelect = el('monthSelect');
    if (!yearSelect || !monthSelect) return;

    const selectedYear = yearSelect.value;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const options = ['<option value="ALL">All Months</option>'];

    for (let i = 0; i < 12; i++) {
      const monthValue = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
      options.push(`<option value="${monthValue}">${months[i]} ${selectedYear}</option>`);
    }

    monthSelect.innerHTML = options.join('');

    // Default to current month when viewing current year
    const currentYear  = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (parseInt(selectedYear) === currentYear) {
      monthSelect.value = `${selectedYear}-${String(currentMonth).padStart(2, '0')}`;
    }
  }

  // ── Refresh helper — calls all dependent update functions ─────

  function refreshAll() {
    if (typeof updateBalanceSummary    === 'function') updateBalanceSummary();
    if (typeof updatePaymentBalances   === 'function') updatePaymentBalances();
    if (typeof updateRecentTransactions=== 'function') updateRecentTransactions();
    if (typeof updateEnvelopeBudget    === 'function') updateEnvelopeBudget();
  }

  // ── Event listeners ───────────────────────────────────────────

  function initDateNavigation() {
    const yearSelect  = el('yearSelect');
    const monthSelect = el('monthSelect');
    const prevYear    = el('prevYear');
    const nextYear    = el('nextYear');
    const prevMonth   = el('prevMonth');
    const nextMonth   = el('nextMonth');

    if (!yearSelect || !monthSelect) return;

    // Year ‹ ›
    prevYear.addEventListener('click', () => {
      if (yearSelect.selectedIndex > 0) {
        yearSelect.selectedIndex--;
        generateMonthDropdown();
        refreshAll();
      }
    });

    nextYear.addEventListener('click', () => {
      if (yearSelect.selectedIndex < yearSelect.options.length - 1) {
        yearSelect.selectedIndex++;
        generateMonthDropdown();
        refreshAll();
      }
    });

    yearSelect.addEventListener('change', () => {
      if (typeof recentTxVisibleCount !== 'undefined') recentTxVisibleCount = 10;
      generateMonthDropdown();
      refreshAll();
    });

    // Month ‹ ›
    prevMonth.addEventListener('click', () => {
      if (monthSelect.selectedIndex > 0) {
        monthSelect.selectedIndex--;
        refreshAll();
      }
    });

    nextMonth.addEventListener('click', () => {
      if (monthSelect.selectedIndex < monthSelect.options.length - 1) {
        monthSelect.selectedIndex++;
        refreshAll();
      }
    });

    monthSelect.addEventListener('change', () => {
      if (typeof recentTxVisibleCount !== 'undefined') recentTxVisibleCount = 10;
      refreshAll();
    });
  }

  // ── Public API ────────────────────────────────────────────────
  window.DateNav = {
    generateYearDropdown,
    generateMonthDropdown,
    init: initDateNavigation,
  };
})();
