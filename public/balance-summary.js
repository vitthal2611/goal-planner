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

    // ── Net balance banner ────────────────────────────────────
    const banner = el('netBalanceBanner');
    if (banner) {
      const net = income - expense;
      const absNet = Math.abs(net);
      const fmt = `₹${absNet.toLocaleString('en-IN')}`;

      let cls, icon, amount, msg;

      if (income === 0 && expense === 0) {
        banner.className = 'net-balance-banner';
        banner.innerHTML = '';
        return;
      } else if (net > 0) {
        cls    = 'positive';
        icon   = '🟢';
        amount = `+${fmt}`;
        msg    = net / (income || 1) >= 0.2
          ? 'Great job — you\'re saving well this month!'
          : 'You\'re in the green. Keep it up!';
      } else if (net < 0) {
        cls    = 'negative';
        icon   = '🔴';
        amount = `-${fmt}`;
        msg    = expense > income * 1.5
          ? 'Spending is significantly over income!'
          : 'You are overspending this month.';
      } else {
        cls    = 'neutral';
        icon   = '⚪';
        amount = `₹0`;
        msg    = 'Income and expenses are balanced.';
      }

      banner.className = `net-balance-banner ${cls}`;
      banner.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <span>${icon}</span>
          <span class="net-balance-amount">Net ${amount}</span>
        </div>
        <span class="net-balance-msg">${msg}</span>
      `;
    }
  }

  // ── Init: collapse toggle + switch view ───────────────────────

  function init() {
    // collapse and switch-view removed — both panels always visible
  }

  // ── Public API ────────────────────────────────────────────────

  window.BalanceSummary = { update, init };

})();
