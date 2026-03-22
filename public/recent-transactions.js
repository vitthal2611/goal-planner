/**
 * recent-transactions.js — Recent Transactions module
 *
 * Responsibilities:
 *  - RecentTransactions.update()  — render the filtered transaction list
 *  - RecentTransactions.init()    — wire download report + delete-all buttons
 *
 * Globals exposed:
 *  - window.deleteTransaction(id)    — called from inline onclick in list items
 *  - window.loadMoreTransactions()   — called from inline onclick in footer
 *  - window.loadAllTransactions()    — called from inline onclick in footer
 *  - window.loadFewerTransactions()  — called from inline onclick in footer
 *
 * Depends on:
 *  - localStorage keys: transactions
 *  - window.EnvelopeBudget.getFilter()
 *  - DOM: recentTransactionsList, monthSelect, yearSelect
 *  - globals (main script): saveToLocalStorage, updateBalanceSummary,
 *    updatePaymentBalances, updateEnvelopeBudget, showToast,
 *    showDeleteConfirmation, downloadReport
 */

(function () {

  // ── State ─────────────────────────────────────────────────────
  let visibleCount = 10;

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  function getTimeAgo(dateString) {
    const now  = new Date();
    const date = new Date(dateString);
    const secs = Math.floor((now - date) / 1000);
    if (secs < 60)     return 'Just now';
    if (secs < 3600)   return `${Math.floor(secs / 60)} mins ago`;
    if (secs < 86400)  return `${Math.floor(secs / 3600)} hours ago`;
    if (secs < 172800) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function getIcon(type, description, expenseType) {
    if (type === 'income')   return '💰';
    if (type === 'transfer') return '🔄';
    if (expenseType === 'need') return '🎯';
    if (expenseType === 'want') return '🎉';
    if (expenseType === 'save') return '💰';
    const d = (description || '').toLowerCase();
    if (d.includes('food') || d.includes('lunch') || d.includes('dinner') || d.includes('breakfast')) return '🍔';
    if (d.includes('transport') || d.includes('uber') || d.includes('taxi') || d.includes('bus'))     return '🚕';
    if (d.includes('shopping') || d.includes('clothes'))     return '🛍️';
    if (d.includes('entertainment') || d.includes('movie'))  return '🎬';
    if (d.includes('grocery') || d.includes('groceries'))    return '🛒';
    return '💸';
  }

  function renderItem(t) {
    const icon    = getIcon(t.type, t.description, t.expenseType);
    const timeAgo = getTimeAgo(t.date);
    const sign    = t.type === 'income' ? '+' : (t.type === 'transfer' ? '' : '-');
    const amount  = t.type === 'transfer'
      ? `${t.from}→${t.to} ₹${parseFloat(t.amount).toLocaleString('en-IN')}`
      : `${sign}₹${parseFloat(t.amount).toLocaleString('en-IN')}`;
    const typeTag     = t.expenseType
      ? `<span class="tx-tag ${t.expenseType}">${t.expenseType.charAt(0).toUpperCase() + t.expenseType.slice(1)}</span>`
      : '';
    const envelopeTag = t.envelope      ? `<span class="tx-tag">${t.envelope}</span>`      : '';
    const paymentTag  = t.paymentMethod ? `<span class="tx-tag">${t.paymentMethod}</span>` : '';
    return `
      <div class="transaction-item ${t.type}">
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-details">
          <div class="transaction-desc">${t.description || 'Transfer'}</div>
          <div class="transaction-meta">${timeAgo}${envelopeTag}${typeTag}${paymentTag}</div>
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
    const yearSelect  = el('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
    const selectedYear  = yearSelect  ? yearSelect.value  : String(new Date().getFullYear());
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

    const sorted    = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    const total     = sorted.length;
    const visible   = sorted.slice(0, visibleCount);
    const remaining = total - visible.length;

    const footer = remaining > 0
      ? `<div class="tx-load-more">
           <button class="tx-load-btn" onclick="loadMoreTransactions()">Load ${Math.min(remaining, 10)} more</button>
           <button class="tx-load-btn secondary" onclick="loadAllTransactions()">Show all ${total}</button>
         </div>`
      : (total > 10
          ? `<div class="tx-load-more"><button class="tx-load-btn secondary" onclick="loadFewerTransactions()">Show less</button></div>`
          : '');

    listContainer.innerHTML = visible.map(renderItem).join('') + footer;
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    const downloadBtn      = el('downloadReportBtn');
    const deleteAllBtn     = el('deleteAllExpensesBtn');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (typeof downloadReport === 'function') downloadReport();
      });
    }

    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', () => {
        const monthSelect = el('monthSelect');
        const yearSelect  = el('yearSelect');
        const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
        const selectedYear  = yearSelect  ? yearSelect.value  : String(new Date().getFullYear());
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

        const periodLabel   = selectedMonth === 'ALL'
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
              if (typeof updateBalanceSummary  === 'function') updateBalanceSummary();
              if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
              if (typeof updateEnvelopeBudget  === 'function') updateEnvelopeBudget();
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
          if (typeof saveToLocalStorage   === 'function') saveToLocalStorage();
          if (typeof updateBalanceSummary  === 'function') updateBalanceSummary();
          if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
          if (typeof updateEnvelopeBudget  === 'function') updateEnvelopeBudget();
          update();
          if (typeof showToast === 'function') showToast('Transaction deleted', 'error');
        }
      );
    }
  };

  window.loadMoreTransactions  = () => { visibleCount += 10;       update(); };
  window.loadAllTransactions   = () => { visibleCount = Infinity;  update(); };
  window.loadFewerTransactions = () => { visibleCount = 10;        update(); };

})();
