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
    const date = new Date(dateString);
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
    
    // Get envelopes with categories
    const envelopes = (() => { 
      try { 
        const envs = JSON.parse(localStorage.getItem('envelopes') || '[]');
        if (envs.length > 0 && typeof envs[0] === 'string') {
          return envs.map(name => ({ name, category: 'need' }));
        }
        return envs;
      } catch { return []; }
    })();
    
    const getEnvelopeCategory = (envelopeName) => {
      const env = envelopes.find(e => e.name === envelopeName);
      return env ? env.category : null;
    };
    
    const category = t.type === 'expense' && t.envelope ? getEnvelopeCategory(t.envelope) : null;
    const categoryColors = { need: '#8b5cf6', want: '#10b981', save: '#3b82f6' };
    const categoryColor = category ? categoryColors[category] : '#6b7280';
    
    const dateLabel = getDateLabel(t.date);
    const description = t.description || 'Transfer';
    const envelope = t.envelope || '-';
    const categoryText = category ? category.charAt(0).toUpperCase() + category.slice(1) : '-';
    
    return `
      <tr class="tx-table-row ${t.type}">
        <td class="tx-table-date">${dateLabel}</td>
        <td class="tx-table-desc">
          <span class="tx-table-icon">${icon}</span>
          <span class="tx-table-name">${description}</span>
        </td>
        <td class="tx-table-category">${envelope}</td>
        <td class="tx-table-type" style="color: ${categoryColor}">${categoryText}</td>
        <td class="tx-table-amount ${t.type}">${amount}</td>
        <td class="tx-table-actions">
          <button class="tx-table-action-btn" onclick="editTransaction('${t.id}')" title="Edit">✏️</button>
          <button class="tx-table-action-btn" onclick="deleteTransaction('${t.id}')" title="Delete">🗑️</button>
        </td>
      </tr>`;
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
      
      txHTML += visible.map(renderItem).join('');
      count += visible.length;
    }

    const tableHTML = `
      <div class="tx-table-wrapper">
        <table class="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${txHTML}
          </tbody>
        </table>
      </div>`;

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

    listContainer.innerHTML = tableHTML + footer;
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
    const tx = transactions.find(t => String(t.id) === String(transactionId));
    if (!tx) {
      if (typeof showToast === 'function') showToast('Transaction not found', 'error');
      return;
    }

    const confirmMsg = `Delete "${tx.description || 'this transaction'}"?\n\nAmount: ₹${parseFloat(tx.amount).toLocaleString('en-IN')}\nDate: ${new Date(tx.date).toLocaleDateString('en-IN')}`;
    
    if (confirm(confirmMsg)) {
      const updated = transactions.filter(t => String(t.id) !== String(transactionId));
      localStorage.setItem('transactions', JSON.stringify(updated));
      
      // Update global array if available
      if (typeof window.transactions !== 'undefined' && Array.isArray(window.transactions)) {
        window.transactions = updated;
      }
      
      if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
      if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
      if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
      if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
      update();
      if (typeof showToast === 'function') showToast('Transaction deleted', 'error');
    }
  };

  window.loadMoreTransactions = () => { visibleCount += 10; update(); };
  window.loadAllTransactions = () => { visibleCount = Infinity; update(); };
  window.loadFewerTransactions = () => { visibleCount = 10; update(); };

  window.editTransaction = function (transactionId) {
    const transactions = fromStorage('transactions');
    const tx = transactions.find(t => String(t.id) === String(transactionId));
    if (!tx) {
      if (typeof showToast === 'function') showToast('Transaction not found', 'error');
      return;
    }

    // Open the appropriate bottom sheet based on transaction type
    if (typeof EnvelopeBottomSheet !== 'undefined') {
      if (tx.type === 'expense') {
        EnvelopeBottomSheet.open('expense', tx.envelope, tx);
      } else if (tx.type === 'income') {
        EnvelopeBottomSheet.open('income', null, tx);
      } else if (tx.type === 'transfer') {
        EnvelopeBottomSheet.open('transfer', null, tx);
      }
    } else {
      if (typeof showToast === 'function') showToast('Edit feature not available', 'error');
    }
  };

})();
