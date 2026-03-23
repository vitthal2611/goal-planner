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
  let filterType = 'all';
  let filterCategory = 'all';
  let filterEnvelope = 'all';
  let filterMinAmount = null;
  let filterMaxAmount = null;
  let filterStartDate = null;
  let filterEndDate = null;
  let searchQuery = '';
  let isLoading = false;

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  function getDateLabel(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  // Consistent icon mapping with standard categories
  function getIcon(type, envelope, description) {
    if (type === 'income')   return '💰';
    if (type === 'transfer') return '🔄';
    
    const env = (envelope || '').toLowerCase();
    const desc = (description || '').toLowerCase();
    
    // Standard icon mapping
    if (env.includes('eatout') || env.includes('restaurant') || env.includes('dining')) return '🍔';
    if (env.includes('petrol') || env.includes('fuel') || env.includes('gas')) return '⛽';
    if (env.includes('vegetable') || env.includes('grocery') || env.includes('groceries')) return '🥦';
    if (env.includes('shopping') || env.includes('cloth') || env.includes('fashion')) return '🛍️';
    if (env.includes('electric') || env.includes('electricity') || env.includes('bill')) return '💡';
    if (env.includes('food') || env.includes('meal')) return '🍽️';
    if (env.includes('transport') || env.includes('travel') || env.includes('cab') || env.includes('taxi')) return '🚗';
    if (env.includes('insurance')) return '🛡️';
    if (env.includes('emi') || env.includes('loan')) return '🏦';
    if (env.includes('sip') || env.includes('invest') || env.includes('mutual')) return '📈';
    if (env.includes('water') || env.includes('gas')) return '⚡';
    if (env.includes('rent') || env.includes('house') || env.includes('home')) return '🏠';
    if (env.includes('health') || env.includes('medical') || env.includes('doctor')) return '🏥';
    if (env.includes('entertainment') || env.includes('movie')) return '🎬';
    if (env.includes('education') || env.includes('school')) return '📚';
    
    // Description fallback
    if (desc.includes('snack') || desc.includes('tea') || desc.includes('coffee')) return '☕';
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('bus')) return '🚕';
    
    return '💸';
  }

  function renderItem(t) {
    const icon = getIcon(t.type, t.envelope, t.description);
    const sign = t.type === 'income' ? '+' : (t.type === 'transfer' ? '' : '-');
    const amountValue = parseFloat(t.amount);
    const amount = t.type === 'transfer'
      ? `${t.from}→${t.to} ₹${amountValue.toLocaleString('en-IN')}`
      : `${sign}₹${amountValue.toLocaleString('en-IN')}`;
    
    // Check if large transaction (>5000)
    const isLarge = amountValue > 5000;
    
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
    
    // Card HTML for mobile with swipe support
    const cardHTML = `
      <div class="tx-card ${t.type} ${isLarge ? 'large-amount' : ''}" 
           data-id="${t.id}"
           ontouchstart="handleTouchStart(event, '${t.id}')"
           ontouchmove="handleTouchMove(event)"
           ontouchend="handleTouchEnd(event, '${t.id}')"
           onclick="openTransactionDetail('${t.id}')">
        <div class="tx-card-swipe-bg left">🗑️</div>
        <div class="tx-card-swipe-bg right">✏️</div>
        <div class="tx-card-header">
          <div class="tx-card-icon">${icon}</div>
          <div class="tx-card-main">
            <div class="tx-card-name">${description}</div>
            <div class="tx-card-meta">
              ${envelope !== '-' ? `<span class="tx-card-category">${envelope}</span>` : ''}
              ${envelope !== '-' && dateLabel ? `<span class="tx-card-separator">•</span>` : ''}
              <span class="tx-card-date">${dateLabel}</span>
              ${category ? `<span class="tx-card-separator">•</span><span class="tx-card-badge ${category}">${categoryText}</span>` : ''}
            </div>
          </div>
          <div class="tx-card-amount">${amount}</div>
        </div>
        <div class="tx-card-actions">
          <button class="tx-card-action-btn edit" onclick="event.stopPropagation(); editTransaction('${t.id}')" title="Edit">✏️</button>
          <button class="tx-card-action-btn delete" onclick="event.stopPropagation(); deleteTransaction('${t.id}')" title="Delete">🗑️</button>
        </div>
      </div>`;
    
    // Table row HTML for desktop
    const tableRowHTML = `
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
    
    return { cardHTML, tableRowHTML };
  }

  // ── Core update ───────────────────────────────────────────────

  function update() {
    console.log('RecentTransactions.update() called');
    const listContainer = el('recentTransactionsList');
    if (!listContainer) {
      console.error('recentTransactionsList container not found');
      return;
    }

    // Show skeleton loader
    if (isLoading) {
      listContainer.innerHTML = `
        <div class="tx-skeleton">
          ${Array(5).fill('').map(() => `
            <div class="tx-skeleton-card">
              <div class="tx-skeleton-icon"></div>
              <div class="tx-skeleton-content">
                <div class="tx-skeleton-line"></div>
                <div class="tx-skeleton-line short"></div>
              </div>
              <div class="tx-skeleton-amount"></div>
            </div>
          `).join('')}
        </div>`;
      return;
    }

    const monthSelect = el('monthSelect');
    const yearSelect = el('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
    const selectedYear = yearSelect ? yearSelect.value : String(new Date().getFullYear());
    const envelopeFilter = window.EnvelopeBudget ? EnvelopeBudget.getFilter() : 'ALL';

    const transactions = fromStorage('transactions');
    console.log('Loaded transactions for display:', transactions.length);

    if (transactions.length === 0) {
      listContainer.innerHTML = '<div class="tx-empty"><div class="tx-empty-icon">📭</div><div class="tx-empty-text">No transactions yet</div></div>';
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const desc = (t.description || '').toLowerCase();
        const env = (t.envelope || '').toLowerCase();
        const amount = String(t.amount);
        return desc.includes(query) || env.includes(query) || amount.includes(query);
      });
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      const envelopes = (() => { 
        try { 
          const envs = JSON.parse(localStorage.getItem('envelopes') || '[]');
          if (envs.length > 0 && typeof envs[0] === 'string') {
            return envs.map(name => ({ name, category: 'need' }));
          }
          return envs;
        } catch { return []; }
      })();
      
      filtered = filtered.filter(t => {
        if (t.type !== 'expense' || !t.envelope) return false;
        const env = envelopes.find(e => e.name === t.envelope);
        return env && env.category === filterCategory;
      });
    }

    // Envelope filter
    if (filterEnvelope !== 'all') {
      filtered = filtered.filter(t => t.type === 'expense' && t.envelope === filterEnvelope);
    }

    // Amount range filter
    if (filterMinAmount !== null) {
      filtered = filtered.filter(t => parseFloat(t.amount) >= filterMinAmount);
    }
    if (filterMaxAmount !== null) {
      filtered = filtered.filter(t => parseFloat(t.amount) <= filterMaxAmount);
    }

    // Date range filter
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      filtered = filtered.filter(t => {
        try {
          return new Date(t.date) >= startDate;
        } catch { return false; }
      });
    }
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter(t => {
        try {
          return new Date(t.date) <= endDate;
        } catch { return false; }
      });
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div class="tx-empty"><div class="tx-empty-icon">🔍</div><div class="tx-empty-text">No transactions match your filters</div></div>';
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
    let cardsHTML = '';
    let tableRowsHTML = '';
    let count = 0;
    for (const [dateLabel, txs] of Object.entries(grouped)) {
      if (count >= visibleCount) break;
      const remaining = visibleCount - count;
      const visible = txs.slice(0, remaining);
      
      visible.forEach(t => {
        const rendered = renderItem(t);
        cardsHTML += rendered.cardHTML;
        tableRowsHTML += rendered.tableRowHTML;
      });
      count += visible.length;
    }

    // Card layout for mobile
    const cardListHTML = `<div class="tx-card-list">${cardsHTML}</div>`;
    
    // Table layout for desktop
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
            ${tableRowsHTML}
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

    listContainer.innerHTML = cardListHTML + tableHTML + footer;
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    const downloadBtn = el('downloadReportBtn');
    const deleteAllBtn = el('deleteAllExpensesBtn');
    const searchInput = el('txSearchInput');
    const searchClear = el('txSearchClear');
    const moreBtn = el('recentMoreBtn');
    const moreDropdown = el('recentMoreDropdown');
    const filterBtn = el('txFilterBtn');
    const filterSheet = el('txFilterSheet');
    const filterSheetClose = el('txFilterSheetClose');
    const filterApply = el('txFilterApply');
    const filterClear = el('txFilterClear');

    // Type tabs
    const typeTabs = document.querySelectorAll('.tx-type-tab');
    typeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        typeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterType = tab.dataset.type;
        update();
      });
    });

    // Filter button - open bottom sheet
    if (filterBtn && filterSheet) {
      filterBtn.addEventListener('click', () => {
        filterSheet.style.display = 'flex';
        populateFilterSheet();
      });
    }

    // Close filter sheet
    if (filterSheetClose && filterSheet) {
      filterSheetClose.addEventListener('click', () => {
        filterSheet.style.display = 'none';
      });
    }

    // Apply filters
    if (filterApply && filterSheet) {
      filterApply.addEventListener('click', () => {
        applyFilters();
        filterSheet.style.display = 'none';
        updateFilterBadge();
        update();
      });
    }

    // Clear filters
    if (filterClear) {
      filterClear.addEventListener('click', () => {
        clearFilters();
        updateFilterBadge();
        update();
      });
    }

    // Category chips in filter sheet
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tx-filter-chip')) {
        const category = e.target.dataset.category;
        if (category) {
          document.querySelectorAll('.tx-filter-chip[data-category]').forEach(chip => {
            chip.classList.remove('active');
          });
          e.target.classList.add('active');
        }
      }
    });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (typeof downloadReport === 'function') downloadReport();
      });
    }

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        update();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchQuery = '';
          update();
        }
      });
    }

    // More menu toggle
    if (moreBtn && moreDropdown) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreDropdown.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        moreDropdown.classList.remove('show');
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

  // ── Filter Sheet Helpers ──────────────────────────────────────

  function populateFilterSheet() {
    // Populate envelope chips
    const envelopesContainer = el('txFilterEnvelopes');
    if (envelopesContainer) {
      const envelopes = fromStorage('envelopes');
      const envelopeList = Array.isArray(envelopes) && envelopes.length > 0 && typeof envelopes[0] === 'object'
        ? envelopes.map(e => e.name)
        : envelopes;
      
      envelopesContainer.innerHTML = `
        <button class="tx-filter-chip ${filterEnvelope === 'all' ? 'active' : ''}" data-envelope="all">All</button>
        ${envelopeList.map(env => `
          <button class="tx-filter-chip ${filterEnvelope === env ? 'active' : ''}" data-envelope="${env}">${env}</button>
        `).join('')}
      `;

      // Add envelope chip listeners
      envelopesContainer.querySelectorAll('.tx-filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          envelopesContainer.querySelectorAll('.tx-filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        });
      });
    }

    // Set current category
    const categoryChips = document.querySelectorAll('.tx-filter-chip[data-category]');
    categoryChips.forEach(chip => {
      if (chip.dataset.category === filterCategory) {
        chip.classList.add('active');
      }
    });

    // Set amount range
    const minAmountInput = el('txFilterMinAmount');
    const maxAmountInput = el('txFilterMaxAmount');
    if (minAmountInput) minAmountInput.value = filterMinAmount || '';
    if (maxAmountInput) maxAmountInput.value = filterMaxAmount || '';

    // Set date range
    const startDateInput = el('txFilterStartDate');
    const endDateInput = el('txFilterEndDate');
    if (startDateInput) startDateInput.value = filterStartDate || '';
    if (endDateInput) endDateInput.value = filterEndDate || '';
  }

  function applyFilters() {
    // Get category
    const activeCategory = document.querySelector('.tx-filter-chip[data-category].active');
    filterCategory = activeCategory ? activeCategory.dataset.category : 'all';

    // Get envelope
    const activeEnvelope = document.querySelector('.tx-filter-chip[data-envelope].active');
    filterEnvelope = activeEnvelope ? activeEnvelope.dataset.envelope : 'all';

    // Get amount range
    const minAmountInput = el('txFilterMinAmount');
    const maxAmountInput = el('txFilterMaxAmount');
    filterMinAmount = minAmountInput && minAmountInput.value ? parseFloat(minAmountInput.value) : null;
    filterMaxAmount = maxAmountInput && maxAmountInput.value ? parseFloat(maxAmountInput.value) : null;

    // Get date range
    const startDateInput = el('txFilterStartDate');
    const endDateInput = el('txFilterEndDate');
    filterStartDate = startDateInput && startDateInput.value ? startDateInput.value : null;
    filterEndDate = endDateInput && endDateInput.value ? endDateInput.value : null;
  }

  function clearFilters() {
    filterCategory = 'all';
    filterEnvelope = 'all';
    filterMinAmount = null;
    filterMaxAmount = null;
    filterStartDate = null;
    filterEndDate = null;

    // Clear UI
    const minAmountInput = el('txFilterMinAmount');
    const maxAmountInput = el('txFilterMaxAmount');
    const startDateInput = el('txFilterStartDate');
    const endDateInput = el('txFilterEndDate');
    
    if (minAmountInput) minAmountInput.value = '';
    if (maxAmountInput) maxAmountInput.value = '';
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';

    document.querySelectorAll('.tx-filter-chip').forEach(chip => {
      chip.classList.remove('active');
      if (chip.dataset.category === 'all' || chip.dataset.envelope === 'all') {
        chip.classList.add('active');
      }
    });
  }

  function updateFilterBadge() {
    const badge = el('txFilterBadge');
    const btnText = el('txFilterBtnText');
    
    let activeFilters = 0;
    if (filterCategory !== 'all') activeFilters++;
    if (filterEnvelope !== 'all') activeFilters++;
    if (filterMinAmount !== null || filterMaxAmount !== null) activeFilters++;
    if (filterStartDate !== null || filterEndDate !== null) activeFilters++;

    if (badge) {
      if (activeFilters > 0) {
        badge.textContent = activeFilters;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    if (btnText) {
      btnText.textContent = activeFilters > 0 ? `Filters (${activeFilters})` : 'Category';
    }
  }

  // ── Globals called from inline onclick in rendered HTML ───────
  window.deleteTransaction = function (transactionId) {
    console.log('deleteTransaction called with ID:', transactionId);
    const transactions = fromStorage('transactions');
    console.log('Loaded transactions count:', transactions.length);
    const tx = transactions.find(t => String(t.id) === String(transactionId));
    if (!tx) {
      console.error('Transaction not found:', transactionId);
      if (typeof showToast === 'function') showToast('Transaction not found', 'error');
      return;
    }

    console.log('Found transaction to delete:', tx);
    
    // Use custom confirmation dialog
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    
    if (confirmDialog && confirmTitle && confirmMessage && confirmOkBtn && confirmCancelBtn) {
      confirmTitle.textContent = 'Delete Transaction?';
      confirmMessage.innerHTML = `
        <div style="margin-bottom:8px;"><strong>${tx.description || 'this transaction'}</strong></div>
        <div>Amount: <strong>₹${parseFloat(tx.amount).toLocaleString('en-IN')}</strong></div>
        <div>Date: <strong>${new Date(tx.date).toLocaleDateString('en-IN')}</strong></div>
      `;
      
      confirmDialog.style.display = 'flex';
      
      const handleConfirm = () => {
        confirmDialog.style.display = 'none';
        
        // Update localStorage
        const updated = transactions.filter(t => String(t.id) !== String(transactionId));
        console.log('Filtered transactions, new count:', updated.length);
        localStorage.setItem('transactions', JSON.stringify(updated));
        
        // Update global window.transactions reference
        window.transactions = updated;
        console.log('Updated window.transactions');
        
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
        if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
        if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
        console.log('Calling update() to refresh UI');
        update();
        if (typeof showToast === 'function') showToast('Transaction deleted', 'success');
        
        // Remove event listeners
        confirmOkBtn.removeEventListener('click', handleConfirm);
        confirmCancelBtn.removeEventListener('click', handleCancel);
      };
      
      const handleCancel = () => {
        console.log('Delete cancelled by user');
        confirmDialog.style.display = 'none';
        confirmOkBtn.removeEventListener('click', handleConfirm);
        confirmCancelBtn.removeEventListener('click', handleCancel);
      };
      
      confirmOkBtn.addEventListener('click', handleConfirm);
      confirmCancelBtn.addEventListener('click', handleCancel);
    } else {
      // Fallback to browser confirm if custom dialog not available
      const confirmMsg = `Delete "${tx.description || 'this transaction'}"?\n\nAmount: ₹${parseFloat(tx.amount).toLocaleString('en-IN')}\nDate: ${new Date(tx.date).toLocaleDateString('en-IN')}`;
      
      if (confirm(confirmMsg)) {
        const updated = transactions.filter(t => String(t.id) !== String(transactionId));
        localStorage.setItem('transactions', JSON.stringify(updated));
        window.transactions = updated;
        
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
        if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
        if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
        update();
        if (typeof showToast === 'function') showToast('Transaction deleted', 'success');
      }
    }
  };

  window.loadMoreTransactions = () => { visibleCount += 10; update(); };
  window.loadAllTransactions = () => { visibleCount = Infinity; update(); };
  window.loadFewerTransactions = () => { visibleCount = 10; update(); };

  // ── Swipe Gesture Handlers ────────────────────────────────────

  let touchStartX = 0;
  let touchStartY = 0;
  let currentCard = null;

  window.handleTouchStart = function(e, id) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    currentCard = e.currentTarget;
  };

  window.handleTouchMove = function(e) {
    if (!currentCard) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      e.preventDefault();
      
      if (deltaX > 0) {
        currentCard.classList.add('swiping-right');
        currentCard.classList.remove('swiping-left');
      } else {
        currentCard.classList.add('swiping-left');
        currentCard.classList.remove('swiping-right');
      }
    }
  };

  window.handleTouchEnd = function(e, id) {
    if (!currentCard) return;
    
    const touchX = e.changedTouches[0].clientX;
    const deltaX = touchX - touchStartX;
    
    // Swipe threshold
    if (Math.abs(deltaX) > 100) {
      if (deltaX > 0) {
        // Swipe right = Edit
        editTransaction(id);
      } else {
        // Swipe left = Delete
        deleteTransaction(id);
      }
    }
    
    currentCard.classList.remove('swiping-left', 'swiping-right');
    currentCard = null;
  };

  // ── Transaction Detail Bottom Sheet ────────────────────────────

  window.openTransactionDetail = function(transactionId) {
    // Prevent opening detail when clicking action buttons
    if (event && event.target.closest('.tx-card-action-btn')) {
      return;
    }
    
    const transactions = fromStorage('transactions');
    const tx = transactions.find(t => String(t.id) === String(transactionId));
    if (!tx) return;

    // For now, just open edit - can be enhanced to show a detail view
    editTransaction(transactionId);
  };

  window.editTransaction = function (transactionId) {
    console.log('editTransaction called with ID:', transactionId);
    const transactions = fromStorage('transactions');
    console.log('Loaded transactions count:', transactions.length);
    const tx = transactions.find(t => String(t.id) === String(transactionId));
    if (!tx) {
      console.error('Transaction not found:', transactionId);
      if (typeof showToast === 'function') showToast('Transaction not found', 'error');
      return;
    }

    console.log('Found transaction to edit:', tx);
    // Open the appropriate bottom sheet based on transaction type
    if (typeof EnvelopeBottomSheet !== 'undefined') {
      if (tx.type === 'expense') {
        console.log('Opening expense sheet');
        EnvelopeBottomSheet.open('expense', tx.envelope, tx);
      } else if (tx.type === 'income') {
        console.log('Opening income sheet');
        EnvelopeBottomSheet.open('income', null, tx);
      } else if (tx.type === 'transfer') {
        console.log('Opening transfer sheet');
        EnvelopeBottomSheet.open('transfer', null, tx);
      }
    } else {
      console.error('EnvelopeBottomSheet not defined');
      if (typeof showToast === 'function') showToast('Edit feature not available', 'error');
    }
  };

})();
