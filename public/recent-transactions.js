/**
 * recent-transactions.js — Recent Transactions module (Enhanced)
 *
 * Responsibilities:
 *  - RecentTransactions.update()  — render grouped, filtered transaction list with summary
 *  - RecentTransactions.init()    — wire download report + delete-all buttons
 *
 * Enhancements:
 *  - Monthly summary (Need/Want/Save breakdown)
 *  - Date-grouped transactions
 *  - Horizontal scrollable filter chips (top 6 + More)
 *  - Consistent icon mapping
 *  - Color-coded NWS tags
 */

(function () {

  // ── State ─────────────────────────────────────────────────────
  let visibleCount = 10;

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  function getDateLabel(dateString) {
    const now  = new Date();
    const date = new Date(dateString);
    const diffDays = Math.floor((now - date) / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  // Consistent icon mapping
  function getIcon(type, envelope, description) {
    if (type === 'income')   return '💰';
    if (type === 'transfer') return '🔄';
    
    const env = (envelope || '').toLowerCase();
    const desc = (description || '').toLowerCase();
    
    // Envelope-based icons (priority)
    if (env.includes('food') || env.includes('meal') || env.includes('restaurant')) return '🍔';
    if (env.includes('grocery') || env.includes('groceries')) return '🛒';
    if (env.includes('transport') || env.includes('travel') || env.includes('fuel')) return '🚗';
    if (env.includes('insurance')) return '🛡️';
    if (env.includes('emi') || env.includes('loan')) return '🏦';
    if (env.includes('sip') || env.includes('invest') || env.includes('mutual')) return '📈';
    if (env.includes('electric') || env.includes('gas') || env.includes('water') || env.includes('bill')) return '⚡';
    if (env.includes('rent') || env.includes('house')) return '🏠';
    if (env.includes('health') || env.includes('medical')) return '🏥';
    if (env.includes('entertainment') || env.includes('movie')) return '🎬';
    if (env.includes('shopping') || env.includes('cloth')) return '🛍️';
    if (env.includes('education') || env.includes('school')) return '📚';
    
    // Description fallback
    if (desc.includes('snack') || desc.includes('tea') || desc.includes('coffee')) return '☕';
    if (desc.includes('uber') || desc.includes('taxi') || desc.includes('bus')) return '🚕';
    
    return '💸';
  }

  function renderItem(t) {
    const icon = getIcon(t.type, t.envelope, t.description);
    const sign = t.type === 'income' ? '+' : (t.type === 'transfer' ? '' : '-');
    const amount = t.type === 'transfer'
      ? `${t.from}→${t.to} ₹${parseFloat(t.amount).toLocaleString('en-IN')}`
      : `${sign}₹${parseFloat(t.amount).toLocaleString('en-IN')}`;
    
    // Color-coded NWS tags
    const nwsColors = { need: '#6366f1', want: '#f59e0b', save: '#10b981' };
    const nwsIcons = { need: '🧠', want: '🎯', save: '💰' };
    const typeTag = t.expenseType
      ? `<span class="tx-tag tx-tag-nws" style="background:${nwsColors[t.expenseType]}20;color:${nwsColors[t.expenseType]}">${nwsIcons[t.expenseType]} ${t.expenseType.charAt(0).toUpperCase() + t.expenseType.slice(1)}</span>`
      : '';
    
    const envelopeTag = t.envelope ? `<span class="tx-tag">${t.envelope}</span>` : '';
    const paymentTag = t.paymentMethod ? `<span class="tx-tag">${t.paymentMethod}</span>` : '';
    
    return `
      <div class="transaction-item ${t.type}">
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-details">
          <div class="transaction-desc">${t.description || 'Transfer'}</div>
          <div class="transaction-meta">${envelopeTag}${typeTag}${paymentTag}</div>
        </div>
        <div class="transaction-amount">${amount}</div>
        <button class="tx-delete" onclick="deleteTransaction(${t.id})" title="Delete">🗑</button>
      </div>`;
  }

  // ── Core update ───────────────────────────────────────────────

  function update() {
    const listContainer = el('recentTransactionsList');
    if (!listContainer) return;

    const monthSelect = el('monthSelect');
    const yearSelect = el('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
    const selectedYear = yearSelect ? yearSelect.value : String(new Date().getFullYear());
    const envelopeFilter = window.EnvelopeBudget ? EnvelopeBudget.getFilter() : 'ALL';

    const transactions = fromStorage('transactions');

    if (transactions.length === 0) {
      listContainer.innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280;">No transactions yet.</div>';
      return;
    }

    // Period filter
    let filtered = transactions.filter(t => {
      if (!t.date) return false;
      try {
        const d = new Date(t.date);
        if (selectedMonth === 'ALL') return d.getFullYear().toString() === selectedYear;
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === selectedMonth;
      } catch { return false; }
    });

    // Envelope filter
    if (envelopeFilter !== 'ALL') {
      filtered = filtered.filter(t => t.type === 'expense' && t.envelope === envelopeFilter);
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div style="padding:16px;text-align:center;color:#6b7280;">No transactions for this period.</div>';
      return;
    }

    // Calculate monthly summary
    let totalSpent = 0, needSpent = 0, wantSpent = 0, saveSpent = 0;
    filtered.forEach(t => {
      if (t.type === 'expense') {
        const amt = parseFloat(t.amount || 0);
        totalSpent += amt;
        if (t.expenseType === 'need') needSpent += amt;
        else if (t.expenseType === 'want') wantSpent += amt;
        else if (t.expenseType === 'save') saveSpent += amt;
      }
    });

    const summaryHTML = `
      <div class="tx-summary">
        <div class="tx-summary-title">This Period</div>
        <div class="tx-summary-row">
          <div class="tx-summary-item">
            <div class="tx-summary-label">Total Spent</div>
            <div class="tx-summary-value">₹${totalSpent.toLocaleString('en-IN')}</div>
          </div>
          <div class="tx-summary-item tx-summary-item--need">
            <div class="tx-summary-label">🧠 Need</div>
            <div class="tx-summary-value">₹${needSpent.toLocaleString('en-IN')}</div>
          </div>
          <div class="tx-summary-item tx-summary-item--want">
            <div class="tx-summary-label">🎯 Want</div>
            <div class="tx-summary-value">₹${wantSpent.toLocaleString('en-IN')}</div>
          </div>
          <div class="tx-summary-item tx-summary-item--save">
            <div class="tx-summary-label">💰 Save</div>
            <div class="tx-summary-value">₹${saveSpent.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>`;

    // Group by date
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    const grouped = {};
    sorted.forEach(t => {
      const label = getDateLabel(t.date);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(t);
    });

    // Render grouped transactions
    let txHTML = '';
    let count = 0;
    for (const [dateLabel, txs] of Object.entries(grouped)) {
      if (count >= visibleCount) break;
      const remaining = visibleCount - count;
      const visible = txs.slice(0, remaining);
      
      txHTML += `<div class="tx-date-group">
        <div class="tx-date-label">${dateLabel}</div>
        ${visible.map(renderItem).join('')}
      </div>`;
      
      count += visible.length;
    }

    const total = sorted.length;
    const remaining = total - count;

    const footer = remaining > 0
      ? `<div class="tx-load-more">
           <button class="tx-load-btn" onclick="loadMoreTransactions()">Load ${Math.min(remaining, 10)} more</button>
           <button class="tx-load-btn secondary" onclick="loadAllTransactions()">Show all ${total}</button>
         </div>`
      : (total > 10
          ? `<div class="tx-load-more"><button class="tx-load-btn secondary" onclick="loadFewerTransactions()">Show less</button></div>`
          : '');

    listContainer.innerHTML = summaryHTML + txHTML + footer;
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    const downloadBtn = el('downloadReportBtn');
    const deleteAllBtn = el('deleteAllExpensesBtn');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (typeof downloadReport === 'function') downloadReport();
      });
    }

    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', () => {
        const monthSelect = el('monthSelect');
        const yearSelect = el('yearSelect');
        const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
        const selectedYear = yearSelect ? yearSelect.value : String(new Date().getFullYear());
        const envelopeFilter = window.EnvelopeBudget ? EnvelopeBudget.getFilter() : 'ALL';
        const isFiltered = envelopeFilter !== 'ALL';

        const transactions = fromStorage('transactions');
        const toDelete = transactions.filter(t => {
          if (t.type !== 'expense') return false;
          if (isFiltered && t.envelope !== envelopeFilter) return false;
          if (!t.date) return false;
          try {
            const d = new Date(t.date);
            if (selectedMonth === 'ALL') return d.getFullYear().toString() === selectedYear;
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return m === selectedMonth;
          } catch { return false; }
        });

        if (toDelete.length === 0) {
          if (typeof showToast === 'function') showToast('No expenses to delete for this period', 'error');
          return;
        }

        const periodLabel = selectedMonth === 'ALL'
          ? `year ${selectedYear}`
          : (monthSelect.options[monthSelect.selectedIndex] || {}).text || selectedMonth;
        const envelopeLabel = isFiltered ? ` in "${envelopeFilter}"` : '';

        if (typeof showDeleteConfirmation === 'function') {
          showDeleteConfirmation(
            'Delete All Expenses?',
            `This will permanently delete ${toDelete.length} expense(s) for ${periodLabel}${envelopeLabel}.`,
            () => {
              const ids = new Set(toDelete.map(t => t.id));
              const remaining = transactions.filter(t => !ids.has(t.id));
              localStorage.setItem('transactions', JSON.stringify(remaining));
              if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
              if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
              if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
              if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
              update();
              if (typeof showToast === 'function') showToast(`${toDelete.length} expense(s) deleted`, 'error');
            }
          );
        }
      });
    }
  }

  // ── Public API ────────────────────────────────────────────────

  window.RecentTransactions = { update, init };

  // Globals called from inline onclick in rendered HTML
  window.deleteTransaction = function (transactionId) {
    const transactions = fromStorage('transactions');
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    if (typeof showDeleteConfirmation === 'function') {
      showDeleteConfirmation(
        'Delete Transaction?',
        `Are you sure you want to delete "${tx.description || 'this transaction'}"?`,
        () => {
          const updated = transactions.filter(t => t.id !== transactionId);
          localStorage.setItem('transactions', JSON.stringify(updated));
          if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
          if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
          if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
          if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
          update();
          if (typeof showToast === 'function') showToast('Transaction deleted', 'error');
        }
      );
    }
  };

  window.loadMoreTransactions = () => { visibleCount += 10; update(); };
  window.loadAllTransactions = () => { visibleCount = Infinity; update(); };
  window.loadFewerTransactions = () => { visibleCount = 10; update(); };

})();
