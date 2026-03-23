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

  function calcNet(allTx, period, year) {
    const filtered = filterByPeriod(allTx, period, year);
    const income  = filtered.filter(t => t.type === 'income') .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    return { income, expense, net: income - expense };
  }

  function update() {
    const totalIncomeEl  = el('totalIncome');
    const totalExpenseEl = el('totalExpense');
    if (!totalIncomeEl || !totalExpenseEl) return;

    const monthSelect   = el('monthSelect');
    const yearSelect    = el('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
    const selectedYear  = yearSelect  ? yearSelect.value  : String(new Date().getFullYear());

    const allTx = (typeof transactions !== 'undefined') ? transactions : [];
    const { income, expense } = calcNet(allTx, selectedMonth, selectedYear);

    totalIncomeEl.textContent  = `₹${income.toLocaleString('en-IN')}`;
    totalExpenseEl.textContent = `₹${expense.toLocaleString('en-IN')}`;

    // ── Expense ratio badge ───────────────────────────────────
    const ratioEl = el('expenseRatio');
    if (ratioEl) {
      ratioEl.textContent = income > 0 ? `${Math.round((expense / income) * 100)}% of income` : '';
    }

    // ── Visual comparison bar ─────────────────────────────────
    const ratioBar   = el('balanceRatioBar');
    const barIncome  = el('ratioBarIncome');
    const barExpense = el('ratioBarExpense');
    if (ratioBar && barIncome && barExpense) {
      const total = income + expense;
      if (total > 0) {
        const incPct = Math.round((income / total) * 100);
        barIncome.style.width  = `${incPct}%`;
        barExpense.style.width = `${100 - incPct}%`;
        ratioBar.style.display = 'flex';
      } else {
        ratioBar.style.display = 'none';
      }
    }

    // Net savings card removed per user request
  }

  // ── Init ─────────────────────────────────────────────────────

  function init() {
    // collapse and switch-view removed — both panels always visible
  }

  // ── Public API ────────────────────────────────────────────────

  window.BalanceSummary = { update, init };

})();
