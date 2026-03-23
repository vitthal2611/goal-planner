/**
 * transaction-review.js — Transaction Review & Edit Modal
 * 
 * Allows reviewing and editing multiple transactions with navigation
 */

(function () {

  // ── State ─────────────────────────────────────────────────────
  let reviewTransactions = [];
  let currentIndex = 0;
  let sortBy = 'date'; // 'date', 'amount', 'payment', 'category'
  let sortOrder = 'desc'; // 'asc', 'desc'

  // ── Helper Functions ──────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  function formatDisplayDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }

  // ── Sorting Functions ─────────────────────────────────────────

  function sortTransactions(transactions) {
    const sorted = [...transactions];
    
    sorted.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'date':
          compareA = new Date(a.date);
          compareB = new Date(b.date);
          break;
        case 'amount':
          compareA = parseFloat(a.amount || 0);
          compareB = parseFloat(b.amount || 0);
          break;
        case 'payment':
          compareA = (a.payment || '').toLowerCase();
          compareB = (b.payment || '').toLowerCase();
          break;
        case 'category':
          compareA = (a.envelope || '').toLowerCase();
          compareB = (b.envelope || '').toLowerCase();
          break;
        default:
          compareA = new Date(a.date);
          compareB = new Date(b.date);
      }
      
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });
    
    return sorted;
  }

  // ── Modal Rendering ───────────────────────────────────────────

  function renderModal() {
    if (reviewTransactions.length === 0) {
      closeModal();
      return;
    }

    const tx = reviewTransactions[currentIndex];
    const modal = el('transactionReviewModal');
    if (!modal) return;

    // Get envelopes and payments
    const envelopes = (() => { 
      try { 
        const envs = JSON.parse(localStorage.getItem('envelopes') || '[]');
        return Array.isArray(envs) && envs.length > 0 && typeof envs[0] === 'object'
          ? envs.map(e => e.name)
          : envs;
      } catch { return []; }
    })();

    const payments = fromStorage('payments').map(p => p.name);

    // Debug logging
    console.log('Transaction Review - Payments:', payments);
    console.log('Transaction Review - Envelopes:', envelopes);
    console.log('Transaction Review - Current Transaction:', tx);

    // Ensure we have at least some payment options
    if (payments.length === 0) {
      console.warn('No payment methods found in storage');
    }

    // Transaction type icon
    const typeIcon = tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '🔄' : '💸';
    const typeColor = tx.type === 'income' ? '#10b981' : tx.type === 'transfer' ? '#3b82f6' : '#ef4444';

    modal.innerHTML = `
      <div class="tx-review-overlay" onclick="TransactionReview.close()"></div>
      <div class="tx-review-content">
        
        <!-- Header -->
        <div class="tx-review-header">
          <div class="tx-review-title">
            <span style="font-size: 24px;">${typeIcon}</span>
            <span>Review & Edit Transaction</span>
          </div>
          <button class="tx-review-close" onclick="TransactionReview.close()">×</button>
        </div>

        <!-- Progress Bar -->
        <div class="tx-review-progress">
          <div class="tx-review-progress-bar">
            <div class="tx-review-progress-fill" style="width: ${((currentIndex + 1) / reviewTransactions.length) * 100}%"></div>
          </div>
          <div class="tx-review-progress-text">
            ${currentIndex + 1} of ${reviewTransactions.length}
          </div>
        </div>

        <!-- Sorting Controls -->
        <div class="tx-review-sort">
          <div class="tx-review-sort-label">Sort by:</div>
          <select id="reviewSortBy" class="tx-review-sort-select" onchange="TransactionReview.changeSortBy(this.value)">
            <option value="date" ${sortBy === 'date' ? 'selected' : ''}>Date</option>
            <option value="amount" ${sortBy === 'amount' ? 'selected' : ''}>Amount</option>
            <option value="payment" ${sortBy === 'payment' ? 'selected' : ''}>Payment</option>
            <option value="category" ${sortBy === 'category' ? 'selected' : ''}>Category</option>
          </select>
          <button class="tx-review-sort-order" onclick="TransactionReview.toggleSortOrder()" title="${sortOrder === 'asc' ? 'Ascending' : 'Descending'}">
            ${sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <!-- Transaction Info Card -->
        <div class="tx-review-info-card" style="border-left: 4px solid ${typeColor};">
          <div class="tx-review-info-row">
            <span class="tx-review-info-label">Type:</span>
            <span class="tx-review-info-value" style="color: ${typeColor}; font-weight: 800;">${tx.type.toUpperCase()}</span>
          </div>
          <div class="tx-review-info-row">
            <span class="tx-review-info-label">Current Date:</span>
            <span class="tx-review-info-value">${formatDisplayDate(tx.date)}</span>
          </div>
          <div class="tx-review-info-row">
            <span class="tx-review-info-label">Current Amount:</span>
            <span class="tx-review-info-value" style="font-weight: 800;">₹${parseFloat(tx.amount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="tx-review-form">
          
          <!-- Date -->
          <div class="tx-review-field">
            <label class="tx-review-label">📅 Date</label>
            <input type="date" 
                   id="reviewDate" 
                   class="tx-review-input" 
                   value="${formatDate(tx.date)}">
          </div>

          <!-- Description -->
          <div class="tx-review-field">
            <label class="tx-review-label">📝 Description</label>
            <input type="text" 
                   id="reviewDescription" 
                   class="tx-review-input" 
                   value="${tx.description || ''}"
                   placeholder="Enter description">
          </div>

          <!-- Amount -->
          <div class="tx-review-field">
            <label class="tx-review-label">💰 Amount</label>
            <input type="number" 
                   id="reviewAmount" 
                   class="tx-review-input" 
                   value="${tx.amount || ''}"
                   placeholder="0"
                   step="0.01"
                   min="0">
          </div>

          ${tx.type === 'expense' ? `
            <!-- Category (for expenses) -->
            <div class="tx-review-field">
              <label class="tx-review-label">📁 Category</label>
              <select id="reviewCategory" class="tx-review-input">
                ${envelopes.length > 0 ? envelopes.map(env => `
                  <option value="${env}" ${tx.envelope === env ? 'selected' : ''}>${env}</option>
                `).join('') : '<option value="">No categories available</option>'}
              </select>
            </div>
          ` : ''}

          ${tx.type === 'transfer' ? `
            <!-- From/To (for transfers) -->
            <div class="tx-review-field">
              <label class="tx-review-label">From</label>
              <select id="reviewFrom" class="tx-review-input">
                ${payments.length > 0 ? payments.map(pm => `
                  <option value="${pm}" ${tx.from === pm ? 'selected' : ''}>${pm}</option>
                `).join('') : '<option value="">No payment methods available</option>'}
              </select>
            </div>
            <div class="tx-review-field">
              <label class="tx-review-label">To</label>
              <select id="reviewTo" class="tx-review-input">
                ${payments.length > 0 ? payments.map(pm => `
                  <option value="${pm}" ${tx.to === pm ? 'selected' : ''}>${pm}</option>
                `).join('') : '<option value="">No payment methods available</option>'}
              </select>
            </div>
          ` : `
            <!-- Payment Method -->
            <div class="tx-review-field">
              <label class="tx-review-label">💳 Payment Method</label>
              <select id="reviewPayment" class="tx-review-input">
                ${payments.length > 0 ? payments.map(pm => `
                  <option value="${pm}" ${tx.payment === pm ? 'selected' : ''}>${pm}</option>
                `).join('') : '<option value="">No payment methods available</option>'}
              </select>
            </div>
          `}

        </div>

        <!-- Navigation & Actions -->
        <div class="tx-review-actions">
          <button class="tx-review-nav-btn" 
                  onclick="TransactionReview.previous()" 
                  ${currentIndex === 0 ? 'disabled' : ''}>
            <span>←</span>
            <span>Previous</span>
          </button>
          
          <div class="tx-review-action-btns">
            <button class="tx-review-btn save" onclick="TransactionReview.save()">
              <span>💾</span>
              <span>Save</span>
            </button>
            <button class="tx-review-btn delete" onclick="TransactionReview.deleteCurrentAndNext()">
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>

          <button class="tx-review-nav-btn" 
                  onclick="TransactionReview.next()" 
                  ${currentIndex === reviewTransactions.length - 1 ? 'disabled' : ''}>
            <span>Next</span>
            <span>→</span>
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="tx-review-quick-actions">
          <button class="tx-review-quick-btn" onclick="TransactionReview.saveAndNext()">
            Save & Next →
          </button>
          <button class="tx-review-quick-btn secondary" onclick="TransactionReview.skipToEnd()">
            Skip to End
          </button>
        </div>

      </div>
    `;

    modal.style.display = 'flex';
  }

  // ── Navigation Functions ──────────────────────────────────────

  function previous() {
    if (currentIndex > 0) {
      currentIndex--;
      renderModal();
    }
  }

  function next() {
    if (currentIndex < reviewTransactions.length - 1) {
      currentIndex++;
      renderModal();
    }
  }

  function skipToEnd() {
    currentIndex = reviewTransactions.length - 1;
    renderModal();
  }

  // ── Save & Update Functions ───────────────────────────────────

  function save() {
    const tx = reviewTransactions[currentIndex];
    const allTransactions = fromStorage('transactions');
    
    // Get updated values
    const date = el('reviewDate')?.value;
    const description = el('reviewDescription')?.value;
    const amount = el('reviewAmount')?.value;
    const category = el('reviewCategory')?.value;
    const payment = el('reviewPayment')?.value;
    const from = el('reviewFrom')?.value;
    const to = el('reviewTo')?.value;

    // Validate
    if (!date || !amount || parseFloat(amount) <= 0) {
      if (typeof showToast === 'function') {
        showToast('Please fill in date and valid amount', 'error');
      } else {
        alert('Please fill in date and valid amount');
      }
      return false;
    }

    // Find and update transaction
    const txIndex = allTransactions.findIndex(t => t.id === tx.id);
    if (txIndex !== -1) {
      allTransactions[txIndex].date = date;
      allTransactions[txIndex].description = description;
      allTransactions[txIndex].amount = amount;
      
      if (tx.type === 'expense') {
        allTransactions[txIndex].envelope = category;
        allTransactions[txIndex].payment = payment;
      } else if (tx.type === 'income') {
        allTransactions[txIndex].payment = payment;
      } else if (tx.type === 'transfer') {
        allTransactions[txIndex].from = from;
        allTransactions[txIndex].to = to;
      }

      // Update storage
      localStorage.setItem('transactions', JSON.stringify(allTransactions));
      window.transactions = allTransactions;

      // Update UI
      if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
      if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
      if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
      if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
      if (typeof RecentTransactions !== 'undefined' && RecentTransactions.update) {
        RecentTransactions.update();
      }

      // Update current transaction in review list
      reviewTransactions[currentIndex] = allTransactions[txIndex];

      if (typeof showToast === 'function') {
        showToast('Transaction updated', 'success');
      }

      return true;
    }

    return false;
  }

  function saveAndNext() {
    if (save()) {
      if (currentIndex < reviewTransactions.length - 1) {
        next();
      } else {
        if (typeof showToast === 'function') {
          showToast('All transactions reviewed!', 'success');
        }
        closeModal();
      }
    }
  }

  function deleteCurrentAndNext() {
    const tx = reviewTransactions[currentIndex];
    
    // Confirm deletion
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    
    const performDelete = () => {
      const allTransactions = fromStorage('transactions');
      const remaining = allTransactions.filter(t => t.id !== tx.id);
      
      localStorage.setItem('transactions', JSON.stringify(remaining));
      window.transactions = remaining;

      if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
      if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
      if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
      if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
      if (typeof RecentTransactions !== 'undefined' && RecentTransactions.update) {
        RecentTransactions.update();
      }

      // Remove from review list
      reviewTransactions.splice(currentIndex, 1);

      if (reviewTransactions.length === 0) {
        if (typeof showToast === 'function') {
          showToast('Transaction deleted', 'success');
        }
        closeModal();
      } else {
        // Stay at same index (which now shows next transaction)
        if (currentIndex >= reviewTransactions.length) {
          currentIndex = reviewTransactions.length - 1;
        }
        if (typeof showToast === 'function') {
          showToast('Transaction deleted', 'success');
        }
        renderModal();
      }
    };

    if (confirmDialog && confirmTitle && confirmMessage && confirmOkBtn && confirmCancelBtn) {
      confirmTitle.textContent = 'Delete Transaction?';
      confirmMessage.innerHTML = `
        <div style="margin-bottom:8px;"><strong>${tx.description || 'this transaction'}</strong></div>
        <div>Amount: <strong>₹${parseFloat(tx.amount).toLocaleString('en-IN')}</strong></div>
      `;
      
      confirmDialog.style.display = 'flex';
      
      const handleConfirm = () => {
        confirmDialog.style.display = 'none';
        performDelete();
        confirmOkBtn.removeEventListener('click', handleConfirm);
        confirmCancelBtn.removeEventListener('click', handleCancel);
      };
      
      const handleCancel = () => {
        confirmDialog.style.display = 'none';
        confirmOkBtn.removeEventListener('click', handleConfirm);
        confirmCancelBtn.removeEventListener('click', handleCancel);
      };
      
      confirmOkBtn.addEventListener('click', handleConfirm);
      confirmCancelBtn.addEventListener('click', handleCancel);
    } else {
      if (confirm(`Delete "${tx.description || 'this transaction'}"?`)) {
        performDelete();
      }
    }
  }

  // ── Sort Functions ────────────────────────────────────────────

  function changeSortBy(newSortBy) {
    sortBy = newSortBy;
    reviewTransactions = sortTransactions(reviewTransactions);
    // Reset to first transaction after re-sorting
    currentIndex = 0;
    renderModal();
  }

  function toggleSortOrder() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    reviewTransactions = sortTransactions(reviewTransactions);
    renderModal();
  }

  // ── Open/Close Functions ──────────────────────────────────────

  function open(transactions, initialSortBy = 'date', initialSortOrder = 'desc') {
    if (!transactions || transactions.length === 0) {
      if (typeof showToast === 'function') {
        showToast('No transactions to review', 'error');
      }
      return;
    }

    sortBy = initialSortBy;
    sortOrder = initialSortOrder;
    reviewTransactions = sortTransactions(transactions);
    currentIndex = 0;
    renderModal();
  }

  function closeModal() {
    const modal = el('transactionReviewModal');
    if (modal) {
      modal.style.display = 'none';
      modal.innerHTML = '';
    }
    reviewTransactions = [];
    currentIndex = 0;
  }

  // ── Public API ────────────────────────────────────────────────

  window.TransactionReview = {
    open,
    close: closeModal,
    previous,
    next,
    save,
    saveAndNext,
    deleteCurrentAndNext,
    changeSortBy,
    toggleSortOrder,
    skipToEnd
  };

})();
