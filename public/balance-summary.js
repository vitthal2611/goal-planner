/**
 * balance-summary.js — Income / Expense dashboard summary module
 *
 * Responsibilities:
 *  - BalanceSummary.update()  — recalculate income/expense for selected period and update DOM
 *  - BalanceSummary.init()    — wire collapse toggle and Switch-view button
 *
 * Depends on:
 *  - globals: transactions, monthSelect, yearSelect  (set by main script)
 *  - DOM ids: totalIncome, totalExpense, balanceSummaryWrapper, paymentBalancesWrapper,
 *             balanceHeader, balanceSummary, balanceToggleIcon,
 *             toggleViewBtn, toggleViewBtn2
 */

(function () {

  // ── Helpers ───────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  function filterByPeriod(transactions, selectedMonth, selectedYear) {
    if (selectedMonth === 'ALL') {
      return transactions.filter(t => {
        if (!t.date) return false;
        try { return new Date(t.date).getFullYear().toString() === selectedYear; }
        catch { return false; }
      });
    }
    return transactions.filter(t => {
      if (!t.date) return false;
      try {
        const d = new Date(t.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === selectedMonth;
      } catch { return false; }
    });
  }

  // ── Core update ───────────────────────────────────────────────

  function update() {
    const totalIncomeEl  = el('totalIncome');
    const totalExpenseEl = el('totalExpense');
    if (!totalIncomeEl || !totalExpenseEl) return;

    const monthSelect = el('monthSelect');
    const yearSelect  = el('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
    const selectedYear  = yearSelect  ? yearSelect.value  : String(new Date().getFullYear());

    // transactions is a global defined in the main script
    const allTx = (typeof transactions !== 'undefined') ? transactions : [];
    const filtered = filterByPeriod(allTx, selectedMonth, selectedYear);

    const income  = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    totalIncomeEl.textContent  = `₹${income.toLocaleString('en-IN')}`;
    totalExpenseEl.textContent = `₹${expense.toLocaleString('en-IN')}`;
  }

  // ── Init: collapse toggle + switch view ───────────────────────

  function init() {
    const balanceHeader         = el('balanceHeader');
    const balanceSummaryEl      = el('balanceSummary');
    const balanceToggleIcon     = el('balanceToggleIcon');
    const balanceSummaryWrapper = el('balanceSummaryWrapper');
    const paymentBalancesWrapper= el('paymentBalancesWrapper');
    const toggleViewBtn         = el('toggleViewBtn');
    const toggleViewBtn2        = el('toggleViewBtn2');
    const paymentHeader         = el('paymentHeader');
    const paymentBalancesEl     = el('paymentBalances');
    const toggleIcon            = el('toggleIcon');

    // Collapse / expand income-expense panel
    if (balanceHeader) {
      balanceHeader.addEventListener('click', e => {
        if (e.target.id === 'toggleViewBtn') return;
        balanceSummaryEl.classList.toggle('collapsed');
        balanceToggleIcon.classList.toggle('collapsed');
      });
    }

    // Collapse / expand payment methods panel
    if (paymentHeader) {
      paymentHeader.addEventListener('click', e => {
        if (e.target.id === 'toggleViewBtn2') return;
        paymentBalancesEl.classList.toggle('collapsed');
        toggleIcon.classList.toggle('collapsed');
      });
    }

    // Switch between Income/Expense view and Payment Methods view
    function switchView() {
      const showingBalance = balanceSummaryWrapper.style.display !== 'none';
      balanceSummaryWrapper.style.display  = showingBalance ? 'none'  : 'block';
      paymentBalancesWrapper.style.display = showingBalance ? 'block' : 'none';
    }

    if (toggleViewBtn)  toggleViewBtn.addEventListener('click',  switchView);
    if (toggleViewBtn2) toggleViewBtn2.addEventListener('click', switchView);
  }

  // ── Public API ────────────────────────────────────────────────

  window.BalanceSummary = { update, init };

})();
