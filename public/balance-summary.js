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

  function getPrevMonth(selectedMonth, selectedYear) {
    if (selectedMonth === 'ALL') return null;
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1); // subtract 1 month
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

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
    const { income, expense, net } = calcNet(allTx, selectedMonth, selectedYear);

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

    // ── Net savings card ──────────────────────────────────────
    const banner = el('netBalanceBanner');
    if (!banner) return;

    if (income === 0 && expense === 0) {
      banner.innerHTML = '';
      return;
    }

    // Month-over-month comparison
    let momHTML = '';
    if (selectedMonth !== 'ALL') {
      const prevPeriod = getPrevMonth(selectedMonth, selectedYear);
      if (prevPeriod) {
        const prevYear = prevPeriod.split('-')[0];
        const { net: prevNet } = calcNet(allTx, prevPeriod, prevYear);
        if (prevNet !== 0) {
          const diff = net - prevNet;
          const pct  = Math.round(Math.abs(diff / prevNet) * 100);
          const sign = diff >= 0 ? '+' : '-';
          momHTML = `<span class="net-card-mom">${sign}${pct}% vs last month</span>`;
        }
      }
    }

    // Savings goal
    const goalKey  = 'savingsGoal';
    let   goal     = parseFloat(localStorage.getItem(goalKey) || '0');
    let   goalHTML = '';
    if (net > 0) {
      const goalPct  = goal > 0 ? Math.min(Math.round((net / goal) * 100), 100) : 0;
      const goalFmt  = goal > 0 ? `₹${goal.toLocaleString('en-IN')}` : 'Set goal';
      const overGoal = goal > 0 && net >= goal;
      goalHTML = `
        <div class="net-card-goal">
          <div class="net-card-goal-row">
            <span class="net-card-goal-label">
              ${goal > 0
                ? (overGoal ? `Goal reached — ₹${goal.toLocaleString('en-IN')}` : `${goalPct}% of ${goalFmt} goal`)
                : 'No savings goal set'}
            </span>
            <button class="net-card-goal-edit" onclick="BalanceSummary.editGoal()">${goal > 0 ? 'Edit' : '+ Set goal'}</button>
          </div>
          ${goal > 0 ? `
          <div class="net-goal-track">
            <div class="net-goal-fill${overGoal ? ' over' : ''}" style="width:${goalPct}%"></div>
          </div>` : ''}
        </div>`;
    }

    // Render
    const absNet = Math.abs(net);
    const fmt    = `₹${absNet.toLocaleString('en-IN')}`;
    let cls, trend, amount;

    if (net > 0)      { cls = 'positive'; trend = '📈'; amount = `+${fmt}`; }
    else if (net < 0) { cls = 'negative'; trend = '📉'; amount = `-${fmt}`; }
    else              { cls = 'neutral';  trend = '➡️'; amount = `₹0`; }

    banner.innerHTML = `
      <div class="net-card ${cls}">
        <div class="net-card-top">
          <span class="net-card-label">Net Savings</span>
          ${momHTML}
        </div>
        <div class="net-card-main">
          <span class="net-card-trend">${trend}</span>
          <span class="net-card-amount">${amount}</span>
        </div>
        ${goalHTML}
      </div>`;
  }

  // ── Edit savings goal ─────────────────────────────────────────

  function editGoal() {
    const current = localStorage.getItem('savingsGoal') || '';
    const val = prompt('Set monthly savings goal (₹):', current);
    if (val === null) return;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num >= 0) {
      localStorage.setItem('savingsGoal', num);
      update();
    }
  }

  // ── Init ─────────────────────────────────────────────────────

  function init() {
    // collapse and switch-view removed — both panels always visible
  }

  // ── Public API ────────────────────────────────────────────────

  window.BalanceSummary = { update, init, editGoal };

})();
