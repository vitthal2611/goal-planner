/**
 * today-transactions.js — Today's Transactions Component with Day Navigation
 *
 * Displays all transactions from selected date with navigation
 * Depends on globals: transactions
 */

(function () {

  function el(id) { return document.getElementById(id); }

  // ── State ─────────────────────────────────────────────────────
  let currentDate = new Date();

  // ── Helper Functions ──────────────────────────────────────────

  function getDateString(date) {
    return date.toISOString().split('T')[0];
  }

  function getTransactionsForDate(date) {
    const dateStr = getDateString(date);
    const allTx = (typeof transactions !== 'undefined') ? transactions : [];
    
    return allTx.filter(t => {
      if (!t.date) return false;
      try {
        return new Date(t.date).toISOString().split('T')[0] === dateStr;
      } catch { return false; }
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function sumBy(txs, predicate) {
    return txs.filter(predicate).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  }

  function fmt(n) { 
    return `₹${Math.round(n).toLocaleString('en-IN')}`; 
  }

  function formatTime(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  }

  function getTransactionIcon(tx) {
    if (tx.type === 'income') return '💰';
    if (tx.type === 'transfer') return '🔄';
    
    // For expenses, try to get envelope icon
    if (tx.envelope) {
      const n = tx.envelope.toLowerCase();
      if (n.includes('food') || n.includes('meal') || n.includes('eatout')) return '🍽️';
      if (n.includes('grocery') || n.includes('vegetable') || n.includes('dmart')) return '🛒';
      if (n.includes('transport') || n.includes('petrol') || n.includes('fuel')) return '🚗';
      if (n.includes('health') || n.includes('medical')) return '🏥';
      if (n.includes('electric') || n.includes('water') || n.includes('gas')) return '💡';
      if (n.includes('rent') || n.includes('home')) return '🏠';
      if (n.includes('school') || n.includes('education')) return '📚';
      if (n.includes('sip') || n.includes('invest') || n.includes('saving')) return '📈';
      if (n.includes('insurance')) return '🛡️';
      if (n.includes('emi')) return '💳';
    }
    
    return '💸';
  }

  function getPaymentIcon(name) {
    if (!name) return '💰';
    const n = name.toLowerCase();
    if (n.includes('cash')) return '💵';
    if (n.includes('credit') || n.includes('debit') || n.includes('card')) return '💳';
    if (n.includes('phonepe')) return '💜';
    if (n.includes('gpay') || n.includes('google pay')) return '🔵';
    if (n.includes('paytm')) return '💙';
    if (n.includes('upi')) return '📱';
    if (n.includes('bank')) return '🏦';
    return '💰';
  }

  // ── Navigation Functions ──────────────────────────────────────

  function goToPreviousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    update();
  }

  function goToNextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    update();
  }

  function goToToday() {
    currentDate = new Date();
    update();
  }

  function isToday() {
    const today = new Date();
    return getDateString(currentDate) === getDateString(today);
  }

  // ── Render Functions ──────────────────────────────────────────

  function renderSummaryStats(dateTxs) {
    const income = sumBy(dateTxs, t => t.type === 'income');
    const expense = sumBy(dateTxs, t => t.type === 'expense');
    const net = income - expense;

    return `
      <div class="today-summary-stats">
        <div class="today-stat-card income">
          <div class="today-stat-icon">💰</div>
          <div class="today-stat-label">Income</div>
          <div class="today-stat-value">${fmt(income)}</div>
        </div>
        <div class="today-stat-card expense">
          <div class="today-stat-icon">💸</div>
          <div class="today-stat-label">Expense</div>
          <div class="today-stat-value">${fmt(expense)}</div>
        </div>
        <div class="today-stat-card net">
          <div class="today-stat-icon">${net >= 0 ? '✅' : '⚠️'}</div>
          <div class="today-stat-label">Net</div>
          <div class="today-stat-value">${net >= 0 ? '+' : ''}${fmt(net)}</div>
        </div>
      </div>`;
  }

  function renderTransactionItem(tx) {
    const icon = getTransactionIcon(tx);
    const typeClass = tx.type;
    
    let description = tx.description || 'No description';
    let metaHTML = '';
    
    if (tx.type === 'expense') {
      const categoryIcon = tx.envelope ? getTransactionIcon(tx) : '📁';
      const paymentIcon = tx.payment ? getPaymentIcon(tx.payment) : '';
      metaHTML = `
        <span class="today-tx-category">${categoryIcon} ${tx.envelope || 'Uncategorized'}</span>
        ${tx.payment ? `<span class="today-tx-payment">${paymentIcon} ${tx.payment}</span>` : ''}
      `;
    } else if (tx.type === 'income') {
      const paymentIcon = tx.payment ? getPaymentIcon(tx.payment) : '';
      metaHTML = `
        ${tx.payment ? `<span class="today-tx-payment">${paymentIcon} ${tx.payment}</span>` : ''}
      `;
    } else if (tx.type === 'transfer') {
      metaHTML = `
        <span class="today-tx-payment">From: ${tx.from || 'Unknown'}</span>
        <span class="today-tx-payment">To: ${tx.to || 'Unknown'}</span>
      `;
    }

    const amount = parseFloat(tx.amount || 0);
    const amountPrefix = tx.type === 'income' ? '+' : (tx.type === 'expense' ? '-' : '');
    const time = formatTime(tx.date);

    return `
      <div class="today-transaction-item ${typeClass}">
        <div class="today-tx-icon ${typeClass}">${icon}</div>
        <div class="today-tx-details">
          <div class="today-tx-description">${description}</div>
          <div class="today-tx-meta">${metaHTML}</div>
          ${time ? `<div class="today-tx-time">${time}</div>` : ''}
        </div>
        <div class="today-tx-amount ${typeClass}">${amountPrefix}${fmt(amount)}</div>
      </div>`;
  }

  function renderEmptyState() {
    return `
      <div class="today-transactions-empty">
        <div class="today-empty-icon">📭</div>
        <div class="today-empty-text">No transactions on this date</div>
        <div class="today-empty-hint">Add a transaction to start tracking</div>
        <button class="today-empty-action" onclick="EnvelopeBottomSheet.open('expense')">
          <span>➕</span>
          <span>Add Transaction</span>
        </button>
      </div>`;
  }

  // ── Main Update Function ──────────────────────────────────────

  function update() {
    const container = el('todayTransactionsList');
    if (!container) return;

    const dateTxs = getTransactionsForDate(currentDate);
    
    // Update date in header with navigation
    const dateEl = el('todayTransactionsDate');
    if (dateEl) {
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      const dateStr = currentDate.toLocaleDateString('en-IN', options);
      const todayClass = isToday() ? 'today-badge' : '';
      const todayBadge = isToday() ? '<span class="today-badge">Today</span>' : '';
      
      dateEl.innerHTML = `
        <button class="today-nav-btn" onclick="TodayTransactions.previousDay()" title="Previous Day">
          <span>←</span>
        </button>
        <div class="today-date-display">
          <span class="today-date-text">${dateStr}</span>
          ${todayBadge}
        </div>
        <button class="today-nav-btn" onclick="TodayTransactions.nextDay()" ${isToday() ? 'disabled' : ''} title="Next Day">
          <span>→</span>
        </button>
        ${!isToday() ? '<button class="today-jump-btn" onclick="TodayTransactions.goToToday()">Today</button>' : ''}
      `;
    }

    if (dateTxs.length === 0) {
      container.innerHTML = renderEmptyState();
      return;
    }

    // Render summary stats
    const summaryHTML = renderSummaryStats(dateTxs);
    
    // Render transactions (limit to 5 for finance dashboard)
    const displayTxs = dateTxs.slice(0, 5);
    const transactionsHTML = displayTxs.map(tx => renderTransactionItem(tx)).join('');
    
    // Show "View All" button if more than 5 transactions
    const viewAllHTML = dateTxs.length > 5 ? `
      <div class="today-view-all">
        <button class="today-view-all-btn" onclick="switchToTransactions()">
          <span>View All ${dateTxs.length} Transactions</span>
          <span>→</span>
        </button>
      </div>` : '';

    container.innerHTML = summaryHTML + transactionsHTML + viewAllHTML;
  }

  function init() {
    // Update on page load
    update();
    
    // Update when transactions change (if event system exists)
    if (typeof window.addEventListener !== 'undefined') {
      window.addEventListener('transactionsUpdated', update);
    }
  }

  // ── Public API ────────────────────────────────────────────────

  window.TodayTransactions = { 
    update, 
    init,
    previousDay: goToPreviousDay,
    nextDay: goToNextDay,
    goToToday: goToToday
  };

})();
