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

    // Calculate all envelope data
    const envelopeData = envelopes.map(envelope => {
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
      const remaining = budgetAmount - actualSpent;
      const overAmount = remaining < 0 ? Math.abs(remaining) : 0;

      // Smart color system: green → orange → red
      let status = 'safe', color = '#10b981', bgColor = '#f0fdf4', borderColor = '#86efac';
      if (percentage >= 100) {
        status = 'over';
        color = '#ef4444';
        bgColor = '#fef2f2';
        borderColor = '#fca5a5';
      } else if (percentage >= 80) {
        status = 'warning';
        color = '#f59e0b';
        bgColor = '#fffbeb';
        borderColor = '#fcd34d';
      }

      return {
        envelope, budgetAmount, actualSpent, remaining, overAmount, percentage, status, color, bgColor, borderColor,
        needSpent, wantSpent, saveSpent
      };
    });

    // Sort: over → warning → safe, then by overAmount desc
    envelopeData.sort((a, b) => {
      const statusOrder = { over: 0, warning: 1, safe: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
      return b.overAmount - a.overAmount;
    });

    // Insights banner
    const totalOver = envelopeData.filter(e => e.status === 'over').reduce((s, e) => s + e.overAmount, 0);
    const overCount = envelopeData.filter(e => e.status === 'over').length;
    const warningCount = envelopeData.filter(e => e.status === 'warning').length;
    const topOverspend = envelopeData.find(e => e.status === 'over');

    let insightHTML = '';
    if (overCount > 0) {
      insightHTML = `
        <div class="env-insight env-insight--alert">
          <div class="env-insight-icon">⚠️</div>
          <div class="env-insight-text">
            <div class="env-insight-title">₹${totalOver.toLocaleString('en-IN')} overspent</div>
            <div class="env-insight-sub">${overCount} envelope${overCount > 1 ? 's' : ''} over budget${topOverspend ? ` · Top: ${topOverspend.envelope}` : ''}</div>
          </div>
        </div>`;
    } else if (warningCount > 0) {
      insightHTML = `
        <div class="env-insight env-insight--warning">
          <div class="env-insight-icon">⚡</div>
          <div class="env-insight-text">
            <div class="env-insight-title">${warningCount} envelope${warningCount > 1 ? 's' : ''} near limit</div>
            <div class="env-insight-sub">Watch your spending closely</div>
          </div>
        </div>`;
    } else {
      insightHTML = `
        <div class="env-insight env-insight--safe">
          <div class="env-insight-icon">✅</div>
          <div class="env-insight-text">
            <div class="env-insight-title">All envelopes on track</div>
            <div class="env-insight-sub">Great job managing your budget!</div>
          </div>
        </div>`;
    }

    // Render cards
    const cardsHTML = envelopeData.map(e => {
      const safeEnv = e.envelope.replace(/'/g, "\\'");
      const statusLabel = e.status === 'over' ? `₹${e.overAmount.toLocaleString('en-IN')} over`
                        : e.status === 'warning' ? `₹${e.remaining.toLocaleString('en-IN')} left`
                        : `₹${e.remaining.toLocaleString('en-IN')} left`;

      const chips = [
        e.needSpent > 0 ? `<span class="nws-chip need">🎯 ₹${e.needSpent.toLocaleString('en-IN')}</span>` : '',
        e.wantSpent > 0 ? `<span class="nws-chip want">🎉 ₹${e.wantSpent.toLocaleString('en-IN')}</span>` : '',
        e.saveSpent > 0 ? `<span class="nws-chip save">💰 ₹${e.saveSpent.toLocaleString('en-IN')}</span>` : '',
      ].filter(Boolean).join('');

      return `
        <div class="envelope-item envelope-item--${e.status}" data-envelope="${safeEnv}"
             style="border-color:${e.borderColor};background:${e.bgColor}"
             oncontextmenu="EnvelopeActions.show('${safeEnv}',this);return false;">
          <div class="envelope-header">
            <span class="envelope-name" title="${e.envelope}">${e.envelope}</span>
            <span class="envelope-status" style="color:${e.color}">${statusLabel}</span>
          </div>
          <div class="envelope-amounts">₹${e.actualSpent.toLocaleString('en-IN')} / ₹${e.budgetAmount.toLocaleString('en-IN')}</div>
          <div class="envelope-bar">
            <div class="envelope-progress" style="width:${Math.min(e.percentage, 100)}%;background:${e.color}"></div>
          </div>
          ${chips ? `<div class="nws-chips">${chips}</div>` : ''}
          <div class="env-action-strip" id="eas-${safeEnv.replace(/\s+/g,'_')}">
            <button class="env-action-btn env-action-add"      onclick="EnvelopeActions.addExpense('${safeEnv}')">➕<span>Add</span></button>
            <button class="env-action-btn env-action-details"  onclick="EnvelopeActions.viewDetails('${safeEnv}')">👁<span>Details</span></button>
            <button class="env-action-btn env-action-history"  onclick="EnvelopeActions.viewHistory('${safeEnv}')">📊<span>History</span></button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = insightHTML + cardsHTML;
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
