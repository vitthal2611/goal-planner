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
  let showAllChips = false;

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  function fromStorageObj(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  }

  // Helper to get envelope category
  function getEnvelopeCategory(envelopeName) {
    const envelopes = fromStorage('envelopes');
    // Handle old format (array of strings)
    const envList = envelopes.length > 0 && typeof envelopes[0] === 'string'
      ? envelopes.map(name => ({ name, category: 'need' }))
      : envelopes;
    const env = envList.find(e => e.name === envelopeName);
    return env ? env.category : 'need';
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

    // Handle old format (array of strings) and convert to objects
    const envList = envelopes.length > 0 && typeof envelopes[0] === 'string'
      ? envelopes.map(name => ({ name, category: 'need' }))
      : envelopes;

    if (envList.length === 0) {
      container.innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280;">No envelopes available.</div>';
      return;
    }

    // Calculate all envelope data
    const envelopeData = envList.map(envelope => {
      const envelopeName = envelope.name;
      let budgetAmount = 0, actualSpent = 0, needSpent = 0, wantSpent = 0, saveSpent = 0;

      if (selectedMonth === 'ALL') {
        budgetAmount = budgets
          .filter(b => b.envelope === envelopeName && b.month.startsWith(selectedYear))
          .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

        transactions
          .filter(t => t.type === 'expense' && t.envelope === envelopeName && t.date &&
            (() => { try { return new Date(t.date).getFullYear().toString() === selectedYear; } catch { return false; } })())
          .forEach(t => {
            const amt = parseFloat(t.amount || 0);
            actualSpent += amt;
            const category = getEnvelopeCategory(t.envelope);
            if (category === 'need') needSpent += amt;
            else if (category === 'want') wantSpent += amt;
            else if (category === 'save') saveSpent += amt;
          });
      } else {
        const budget = budgets.find(b => b.envelope === envelopeName && b.month === selectedMonth);
        budgetAmount = budget ? parseFloat(budget.amount) : 0;

        filteredTransactions
          .filter(t => t.type === 'expense' && t.envelope === envelopeName)
          .forEach(t => {
            const amt = parseFloat(t.amount || 0);
            actualSpent += amt;
            const category = getEnvelopeCategory(t.envelope);
            if (category === 'need') needSpent += amt;
            else if (category === 'want') wantSpent += amt;
            else if (category === 'save') saveSpent += amt;
          });
      }

      const percentage = budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0;
      const remaining = budgetAmount - actualSpent;
      const overAmount = remaining < 0 ? Math.abs(remaining) : 0;

      // Severity levels for overspending
      let severity = 'none', severityLabel = '';
      if (overAmount > 5000) { severity = 'critical'; severityLabel = 'Critical'; }
      else if (overAmount >= 500) { severity = 'moderate'; severityLabel = 'Moderate'; }
      else if (overAmount > 0) { severity = 'minor'; severityLabel = 'Minor'; }

      // Smart color system: green → orange → red with severity
      let status = 'safe', statusLabel = 'On track', color = '#10b981', barHeight = '6px';
      if (percentage >= 100) {
        status = 'over';
        statusLabel = 'Over budget';
        if (severity === 'critical') { color = '#dc2626'; barHeight = '8px'; }
        else if (severity === 'moderate') { color = '#ef4444'; barHeight = '7px'; }
        else { color = '#fb923c'; barHeight = '6px'; }
      } else if (percentage >= 80) {
        status = 'warning';
        statusLabel = 'Near limit';
        color = '#f59e0b';
      }

      return {
        envelope: envelopeName, budgetAmount, actualSpent, remaining, overAmount, percentage, status, statusLabel, color, barHeight,
        severity, severityLabel, needSpent, wantSpent, saveSpent
      };
    });

    // Sort: critical → moderate → minor → warning → safe
    envelopeData.sort((a, b) => {
      const severityOrder = { critical: 0, moderate: 1, minor: 2, none: 3 };
      const statusOrder = { over: 0, warning: 1, safe: 2 };
      if (a.status !== b.status) return statusOrder[a.status] - statusOrder[b.status];
      if (a.severity !== b.severity) return severityOrder[a.severity] - severityOrder[b.severity];
      return b.overAmount - a.overAmount;
    });

    // Split into problem vs safe
    const problemEnvelopes = envelopeData.filter(e => e.status === 'over' || e.status === 'warning');
    const safeEnvelopes = envelopeData.filter(e => e.status === 'safe');

    // Insights banner with CTA
    const totalOver = envelopeData.filter(e => e.status === 'over').reduce((s, e) => s + e.overAmount, 0);
    const overCount = envelopeData.filter(e => e.status === 'over').length;
    const warningCount = envelopeData.filter(e => e.status === 'warning').length;
    const topOverspend = envelopeData.find(e => e.status === 'over');

    let insightHTML = '';
    if (overCount > 0) {
      const topName = topOverspend.envelope.replace(/'/g, "\\'");
      insightHTML = `
        <div class="env-insight env-insight--alert">
          <div class="env-insight-main">
            <div class="env-insight-icon">⚠️</div>
            <div class="env-insight-text">
              <div class="env-insight-title">Overspent ₹${totalOver.toLocaleString('en-IN')}</div>
              <div class="env-insight-sub">Top issue: ${topOverspend.envelope} (₹${topOverspend.overAmount.toLocaleString('en-IN')})</div>
            </div>
          </div>
          <div class="env-insight-actions">
            <button class="env-insight-btn" onclick="EnvelopeActions.viewDetails('${topName}')">Fix Now</button>
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

    // Render problem cards
    const problemCardsHTML = problemEnvelopes.map(e => {
      const safeEnv = e.envelope.replace(/'/g, "\\'");
      const statusText = e.status === 'over' ? `₹${e.overAmount.toLocaleString('en-IN')} over`
                       : `₹${e.remaining.toLocaleString('en-IN')} left`;

      return `
        <div class="envelope-item envelope-item--${e.status} envelope-item--${e.severity}" data-envelope="${safeEnv}"
             oncontextmenu="EnvelopeActions.show('${safeEnv}',this);return false;">
          <div class="envelope-header">
            <span class="envelope-name">${e.envelope}</span>
            <span class="envelope-badge envelope-badge--${e.status}">${e.statusLabel}</span>
          </div>
          <div class="envelope-amounts">₹${e.actualSpent.toLocaleString('en-IN')} / ₹${e.budgetAmount.toLocaleString('en-IN')}</div>
          <div class="envelope-status-row">
            <span class="envelope-status-text" style="color:${e.color}">${statusText}</span>
          </div>
          <div class="envelope-bar" style="height:${e.barHeight}">
            <div class="envelope-progress" style="width:${Math.min(e.percentage, 100)}%;background:${e.color}"></div>
          </div>
          <div class="env-action-strip" id="eas-${safeEnv.replace(/\s+/g,'_')}">
            <button class="env-action-btn env-action-add"      onclick="EnvelopeActions.addExpense('${safeEnv}')">➕<span>Add</span></button>
            <button class="env-action-btn env-action-details"  onclick="EnvelopeActions.viewDetails('${safeEnv}')">👁<span>Details</span></button>
            <button class="env-action-btn env-action-history"  onclick="EnvelopeActions.viewHistory('${safeEnv}')">📊<span>History</span></button>
          </div>
        </div>`;
    }).join('');

    // Positive feedback section (collapsible)
    let safeSection = '';
    if (safeEnvelopes.length > 0) {
      const safeCardsHTML = safeEnvelopes.map(e => {
        const safeEnv = e.envelope.replace(/'/g, "\\'");
        return `
          <div class="envelope-item envelope-item--safe-compact" data-envelope="${safeEnv}"
               oncontextmenu="EnvelopeActions.show('${safeEnv}',this);return false;">
            <div class="envelope-header">
              <span class="envelope-name">${e.envelope}</span>
              <span class="envelope-safe-amount">₹${e.remaining.toLocaleString('en-IN')} left</span>
            </div>
            <div class="envelope-bar" style="height:4px">
              <div class="envelope-progress" style="width:${Math.min(e.percentage, 100)}%;background:${e.color}"></div>
            </div>
          </div>`;
      }).join('');

      safeSection = `
        <div class="env-safe-section" id="envSafeSection">
          <button class="env-safe-toggle" onclick="document.getElementById('envSafeList').classList.toggle('env-safe-list--open');this.classList.toggle('env-safe-toggle--open')">
            <span>✔ ${safeEnvelopes.length} categor${safeEnvelopes.length > 1 ? 'ies' : 'y'} within budget</span>
            <span class="env-safe-arrow">›</span>
          </button>
          <div class="env-safe-list" id="envSafeList">${safeCardsHTML}</div>
        </div>`;
    }

    container.innerHTML = insightHTML + problemCardsHTML + safeSection;
  }

  // ── Filter Chips ──────────────────────────────────────────────

  function updateFilterChips() {
    const container = el('envelopeFilterChips');
    if (!container) return;

    const envelopes = fromStorage('envelopes');
    // Handle old format (array of strings)
    const envList = envelopes.length > 0 && typeof envelopes[0] === 'string'
      ? envelopes.map(name => ({ name, category: 'need' }))
      : envelopes;
      
    if (envList.length === 0) { container.innerHTML = ''; return; }

    const hasMore = envList.length > 6;
    const displayEnvelopes = showAllChips ? envList : envList.slice(0, 6);

    const chips = ['ALL', ...displayEnvelopes].map(envelope => {
      const envName = envelope === 'ALL' ? 'ALL' : envelope.name;
      const isActive = selectedEnvelopeFilter === envName;
      const label = envelope === 'ALL' ? 'All' : envelope.name;
      return `
        <button
          onclick="filterByEnvelope('${envName}')"
          class="env-filter-chip ${isActive ? 'env-filter-chip--active' : ''}"
        >${label}</button>`;
    }).join('');

    const moreBtn = hasMore
      ? `<button class="env-filter-chip env-filter-chip--more" onclick="EnvelopeBudget._toggleChips()">
          ${showAllChips ? 'Show Less' : `+${envList.length - 6} More`}
         </button>`
      : '';

    container.innerHTML = `<div class="env-filter-scroll">${chips}${moreBtn}</div>`;
  }

  function toggleChips() {
    showAllChips = !showAllChips;
    updateFilterChips();
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

    // Handle old format (array of strings)
    const envList = envelopes.length > 0 && typeof envelopes[0] === 'string'
      ? envelopes.map(name => ({ name, category: 'need' }))
      : envelopes;

    if (!selectedMonth) {
      listContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;background:linear-gradient(135deg,#f0f9ff,#ffffff);border-radius:12px;border:2px dashed #bfdbfe;">📅 Select a month to set budgets</div>';
      return;
    }
    if (envList.length === 0) {
      listContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;background:linear-gradient(135deg,#fef3c7,#ffffff);border-radius:12px;border:2px dashed #fbbf24;">⚠️ No envelopes available. Add envelopes first.</div>';
      return;
    }

    listContainer.innerHTML = envList.map(envelope => {
      const envName = envelope.name;
      const existing = budgets.find(b => b.envelope === envName && b.month === selectedMonth);
      const val = existing ? existing.amount : (defaultBudgets[envName] || '');
      return `
        <div class="budget-envelope-item">
          <div class="budget-envelope-name">${envName}</div>
          <input type="number" class="budget-input" placeholder="Enter amount"
            value="${val}" data-envelope="${envName}" inputmode="decimal" />
          <button class="save-budget-btn" onclick="saveBudget('${envName}')">Save</button>
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

  window.EnvelopeBudget = { update, updateFilterChips, updateBudgetList, generateMonthOptions, getFilter, init, _toggleChips: toggleChips };

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
