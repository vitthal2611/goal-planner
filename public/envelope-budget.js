/**
 * envelope-budget.js — Envelope Budget vs Actual module
 *
 * Responsibilities:
 *  - EnvelopeBudget.update()           — filter transactions & render envelope cards
 *  - EnvelopeBudget.updateBudgetList() — render budget-setting list in settings panel
 *  - EnvelopeBudget.updateFilterChips()— render envelope filter chips above recent tx
 *  - EnvelopeBudget.getFilter()        — return current selectedEnvelopeFilter value
 *  - EnvelopeBudget.init()             — wire budgetMonth change listener
 *  - window.filterByEnvelope()         — global, called from inline onclick in chips
 *  - window.saveBudget()               — global, called from inline onclick in budget list
 *
 * Depends on globals: transactions, envelopes, budgets, defaultBudgets (set by main script)
 * Depends on DOM: monthSelect, yearSelect, budgetMonth, envelopeBudgetList,
 *                 envelopeFilterChips, budgetList
 */

(function () {

  // ── Shared state ──────────────────────────────────────────────
  let selectedEnvelopeFilter = 'ALL';

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  function fromStorageObj(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  }

  function filterTransactionsByPeriod(txList, selectedMonth, selectedYear) {
    if (selectedMonth === 'ALL') {
      return txList.filter(t => {
        if (!t.date) return false;
        try { return new Date(t.date).getFullYear().toString() === selectedYear; }
        catch { return false; }
      });
    }
    return txList.filter(t => {
      if (!t.date) return false;
      try {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
      } catch { return false; }
    });
  }

  // ── Envelope Budget vs Actual ─────────────────────────────────

  function update() {
    const container = el('envelopeBudgetList');
    if (!container) return;

    const monthSelect = el('monthSelect');
    const yearSelect  = el('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
    const selectedYear  = yearSelect  ? yearSelect.value  : String(new Date().getFullYear());

    const transactions = fromStorage('transactions');
    const envelopes    = fromStorage('envelopes');
    const budgets      = fromStorage('budgets');

    const filteredTransactions = filterTransactionsByPeriod(transactions, selectedMonth, selectedYear);

    // Update NWS bar
    if (window.NWS) NWS.updateNWSSummary(filteredTransactions);

    if (envelopes.length === 0) {
      container.innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280;">No envelopes available.</div>';
      return;
    }

    container.innerHTML = envelopes.map(envelope => {
      let budgetAmount = 0, actualSpent = 0, needSpent = 0, wantSpent = 0, saveSpent = 0;

      if (selectedMonth === 'ALL') {
        budgetAmount = budgets
          .filter(b => b.envelope === envelope && b.month.startsWith(selectedYear))
          .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

        transactions
          .filter(t => t.type === 'expense' && t.envelope === envelope && t.date &&
            (() => { try { return new Date(t.date).getFullYear().toString() === selectedYear; } catch { return false; } })())
          .forEach(t => {
            const amt = parseFloat(t.amount || 0);
            actualSpent += amt;
            if (t.expenseType === 'need') needSpent += amt;
            else if (t.expenseType === 'want') wantSpent += amt;
            else if (t.expenseType === 'save') saveSpent += amt;
          });
      } else {
        const budget = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
        budgetAmount = budget ? parseFloat(budget.amount) : 0;

        filteredTransactions
          .filter(t => t.type === 'expense' && t.envelope === envelope)
          .forEach(t => {
            const amt = parseFloat(t.amount || 0);
            actualSpent += amt;
            if (t.expenseType === 'need') needSpent += amt;
            else if (t.expenseType === 'want') wantSpent += amt;
            else if (t.expenseType === 'save') saveSpent += amt;
          });
      }

      const percentage = budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0;
      let color = '#22c55e';
      if (percentage >= 100) color = '#ef4444';
      else if (percentage >= 90) color = '#f59e0b';

      const remaining = budgetAmount - actualSpent;
      const remainingText = remaining >= 0
        ? `₹${remaining.toLocaleString('en-IN')} left`
        : `₹${Math.abs(remaining).toLocaleString('en-IN')} over`;

      const chips = [
        needSpent > 0 ? `<span class="nws-chip need">🎯 ₹${needSpent.toLocaleString('en-IN')}</span>` : '',
        wantSpent > 0 ? `<span class="nws-chip want">🎉 ₹${wantSpent.toLocaleString('en-IN')}</span>` : '',
        saveSpent > 0 ? `<span class="nws-chip save">💰 ₹${saveSpent.toLocaleString('en-IN')}</span>` : '',
      ].filter(Boolean).join('');

      const safeEnv = envelope.replace(/'/g, "\\'");
      return `
        <div class="envelope-item" data-envelope="${safeEnv}"
             oncontextmenu="EnvelopeActions.show('${safeEnv}',this);return false;">
          <button class="envelope-add-btn" onclick="openExpenseForEnvelope('${safeEnv}'); event.stopPropagation();" title="Add expense to ${envelope}">+</button>
          <div class="envelope-header">
            <span class="envelope-name" title="${envelope}">${envelope}</span>
            <span class="envelope-pct-badge" style="background:${color}">${Math.round(percentage)}%</span>
          </div>
          <div class="envelope-amounts">₹${actualSpent.toLocaleString('en-IN')} / ₹${budgetAmount.toLocaleString('en-IN')} &nbsp;·&nbsp; ${remainingText}</div>
          <div class="envelope-bar">
            <div class="envelope-progress" style="width:${Math.min(percentage, 100)}%;background:${color}"></div>
          </div>
          ${chips ? `<div class="nws-chips">${chips}</div>` : ''}
          <div class="env-action-strip" id="eas-${safeEnv.replace(/\s+/g,'_')}">
            <button class="env-action-btn env-action-add"      onclick="EnvelopeActions.addExpense('${safeEnv}')">➕<span>Add</span></button>
            <button class="env-action-btn env-action-details"  onclick="EnvelopeActions.viewDetails('${safeEnv}')">👁<span>Details</span></button>
            <button class="env-action-btn env-action-history"  onclick="EnvelopeActions.viewHistory('${safeEnv}')">📊<span>History</span></button>
          </div>
        </div>`;
    }).join('');
  }

  // ── Filter Chips ──────────────────────────────────────────────

  function updateFilterChips() {
    const container = el('envelopeFilterChips');
    if (!container) return;

    const envelopes = fromStorage('envelopes');
    if (envelopes.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = ['ALL', ...envelopes].map(envelope => {
      const isActive = selectedEnvelopeFilter === envelope;
      const label = envelope === 'ALL' ? 'All' : envelope;
      return `
        <button
          onclick="filterByEnvelope('${envelope}')"
          style="
            padding: 6px 12px;
            border: 2px solid ${isActive ? '#3b82f6' : '#e5e7eb'};
            background: ${isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white'};
            color: ${isActive ? 'white' : '#6b7280'};
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          "
          onmouseover="if('${isActive}' === 'false') { this.style.borderColor='#3b82f6'; this.style.color='#3b82f6'; }"
          onmouseout="if('${isActive}' === 'false') { this.style.borderColor='#e5e7eb'; this.style.color='#6b7280'; }"
        >${label}</button>`;
    }).join('');
  }

  // ── Budget List (Settings panel) ──────────────────────────────

  function updateBudgetList() {
    const budgetMonthEl = el('budgetMonth');
    const listContainer = el('budgetList');
    if (!listContainer) return;

    const selectedMonth = budgetMonthEl ? budgetMonthEl.value : '';
    const envelopes      = fromStorage('envelopes');
    const budgets        = fromStorage('budgets');
    const defaultBudgets = fromStorageObj('defaultBudgets');

    if (!selectedMonth) {
      listContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;background:linear-gradient(135deg,#f0f9ff,#ffffff);border-radius:12px;border:2px dashed #bfdbfe;">📅 Select a month to set budgets</div>';
      return;
    }
    if (envelopes.length === 0) {
      listContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;background:linear-gradient(135deg,#fef3c7,#ffffff);border-radius:12px;border:2px dashed #fbbf24;">⚠️ No envelopes available. Add envelopes first.</div>';
      return;
    }

    listContainer.innerHTML = envelopes.map(envelope => {
      const existing = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
      const val = existing ? existing.amount : (defaultBudgets[envelope] || '');
      return `
        <div class="budget-envelope-item">
          <div class="budget-envelope-name">${envelope}</div>
          <input type="number" class="budget-input" placeholder="Enter amount"
            value="${val}" data-envelope="${envelope}" inputmode="decimal" />
          <button class="save-budget-btn" onclick="saveBudget('${envelope}')">Save</button>
        </div>`;
    }).join('');
  }

  // ── generateMonthOptions (for budgetMonth select) ─────────────

  function generateMonthOptions() {
    const budgetMonthEl = el('budgetMonth');
    if (!budgetMonthEl) return;
    const currentYear = new Date().getFullYear();
    const months = [];
    for (let year = currentYear; year <= currentYear + 4; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'short' });
        months.push(`<option value="${monthStr}">${monthName} ${year}</option>`);
      }
    }
    budgetMonthEl.innerHTML = '<option value="">Select Month</option>' + months.join('');
  }

  // ── Getters ───────────────────────────────────────────────────

  function getFilter() { return selectedEnvelopeFilter; }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    const budgetMonthEl = el('budgetMonth');
    if (budgetMonthEl) {
      generateMonthOptions();
      budgetMonthEl.addEventListener('change', updateBudgetList);
    }
  }

  // ── Public API ────────────────────────────────────────────────

  window.EnvelopeBudget = { update, updateFilterChips, updateBudgetList, generateMonthOptions, getFilter, init };

  // Global helpers called from inline onclick attributes
  window.filterByEnvelope = function (envelope) {
    selectedEnvelopeFilter = envelope;
    updateFilterChips();
    if (typeof updateRecentTransactions === 'function') updateRecentTransactions();
  };

  window.saveBudget = function (envelope) {
    const budgetMonthEl = el('budgetMonth');
    const selectedMonth = budgetMonthEl ? budgetMonthEl.value : '';
    const input = document.querySelector(`input[data-envelope="${envelope}"]`);
    const amount = input ? input.value.trim() : '';

    if (!amount) {
      if (typeof showToast === 'function') showToast('Please enter a budget amount', 'error');
      return;
    }

    // Read from localStorage, mutate, write back — then sync via main script
    const budgets = fromStorage('budgets');
    const existing = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
    if (existing) {
      existing.amount = amount;
      if (typeof showToast === 'function') showToast(`Budget updated: ${envelope}`, 'success');
    } else {
      budgets.push({ envelope, month: selectedMonth, amount });
      if (typeof showToast === 'function') showToast(`Budget saved: ${envelope}`, 'success');
    }
    localStorage.setItem('budgets', JSON.stringify(budgets));

    // Sync main script's in-memory array if accessible
    if (typeof window.budgets !== 'undefined') window.budgets = budgets;

    update();
    if (typeof syncToCloud === 'function') syncToCloud();
  };

})();
