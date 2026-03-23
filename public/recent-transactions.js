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
  let filterPayment = 'all';
  let filterMinAmount = null;
  let filterMaxAmount = null;
  let filterStartDate = null;
  let filterEndDate = null;
  let searchQuery = '';
  let isLoading = false;
  
  // Multi-select state
  let isMultiSelectMode = false;
  let selectedTransactions = new Set();

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
    
    // Check if selected
    const isSelected = selectedTransactions.has(t.id);
    
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
    const payment = t.payment || '';
    
    // Get payment icon
    function getPaymentIcon(name) {
      if (!name) return '💰';
      const n = name.toLowerCase();
      if (n.includes('cash')) return '💵';
      if (n.includes('credit') || n.includes('debit') || n.includes('card')) return '💳';
      if (n.includes('phonepe')) return '📱';
      if (n.includes('gpay') || n.includes('google pay')) return '📱';
      if (n.includes('paytm')) return '📱';
      if (n.includes('upi')) return '📱';
      if (n.includes('bank')) return '🏦';
      return '💰';
    }
    
    const paymentIcon = getPaymentIcon(payment);
    
    // Card HTML for mobile with swipe support and multi-select
    const cardHTML = `
      <div class="tx-card ${t.type} ${isLarge ? 'large-amount' : ''} ${isSelected ? 'selected' : ''}" 
           data-id="${t.id}"
           ontouchstart="handleTouchStart(event, '${t.id}')"
           ontouchmove="handleTouchMove(event)"
           ontouchend="handleTouchEnd(event, '${t.id}')"
           onclick="${isMultiSelectMode ? `toggleTransactionSelect('${t.id}')` : `openTransactionDetail('${t.id}')`}">
        ${isMultiSelectMode ? `
          <div class="tx-card-checkbox">
            <input type="checkbox" 
                   id="check-${t.id}" 
                   ${isSelected ? 'checked' : ''} 
                   onclick="event.stopPropagation(); toggleTransactionSelect('${t.id}')">
            <label for="check-${t.id}"></label>
          </div>
        ` : ''}
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
              ${payment ? `<span class="tx-card-separator">•</span><span class="tx-card-payment">${paymentIcon} ${payment}</span>` : ''}
            </div>
          </div>
          <div class="tx-card-amount">${amount}</div>
        </div>
        ${!isMultiSelectMode ? `
          <div class="tx-card-actions">
            <button class="tx-card-action-btn edit" onclick="event.stopPropagation(); editTransaction('${t.id}')" title="Edit">✏️</button>
            <button class="tx-card-action-btn delete" onclick="event.stopPropagation(); deleteTransaction('${t.id}')" title="Delete">🗑️</button>
          </div>
        ` : ''}
      </div>`;
    
    // Table row HTML for desktop with multi-select and inline editing
    const tableRowHTML = `
      <tr class="tx-table-row ${t.type} ${isSelected ? 'selected' : ''}" data-id="${t.id}">
        ${isMultiSelectMode ? `
          <td class="tx-table-checkbox">
            <input type="checkbox" 
                   id="check-table-${t.id}" 
                   ${isSelected ? 'checked' : ''} 
                   onclick="toggleTransactionSelect('${t.id}')">
          </td>
        ` : ''}
        <td class="tx-table-date editable" data-field="date" data-id="${t.id}" ondblclick="editCell(this)">${dateLabel}</td>
        <td class="tx-table-desc editable" data-field="description" data-id="${t.id}" ondblclick="editCell(this)">
          <span class="tx-table-icon">${icon}</span>
          <span class="tx-table-name">${description}</span>
        </td>
        <td class="tx-table-category editable" data-field="envelope" data-id="${t.id}" ondblclick="editCell(this)">${envelope}</td>
        <td class="tx-table-type" style="color: ${categoryColor}">${categoryText}</td>
        <td class="tx-table-payment editable" data-field="payment" data-id="${t.id}" ondblclick="editCell(this)">${payment ? `${paymentIcon} ${payment}` : '-'}</td>
        <td class="tx-table-amount ${t.type} editable" data-field="amount" data-id="${t.id}" ondblclick="editCell(this)">${amount}</td>
        <td class="tx-table-actions">
          ${!isMultiSelectMode ? `
            <button class="tx-table-action-btn" onclick="editTransaction('${t.id}')" title="Edit">✏️</button>
            <button class="tx-table-action-btn" onclick="deleteTransaction('${t.id}')" title="Delete">🗑️</button>
          ` : ''}
        </td>
      </tr>`;
    
    return { cardHTML, tableRowHTML };
  }

  // ── Sorting state ─────────────────────────────────────────────
  let sortColumn = 'date'; // default sort by date
  let sortDirection = 'desc'; // desc = newest first

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

    // Payment filter
    if (filterPayment !== 'all') {
      filtered = filtered.filter(t => t.payment === filterPayment);
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
    const sorted = [...filtered].sort((a, b) => {
      let aVal, bVal;
      
      switch(sortColumn) {
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case 'description':
          aVal = (a.description || '').toLowerCase();
          bVal = (b.description || '').toLowerCase();
          break;
        case 'envelope':
          aVal = (a.envelope || '').toLowerCase();
          bVal = (b.envelope || '').toLowerCase();
          break;
        case 'amount':
          // Parse amounts as numbers, handle string values
          let aAmount = a.amount;
          let bAmount = b.amount;
          
          // Convert to number if string
          if (typeof aAmount === 'string') {
            aAmount = parseFloat(aAmount.replace(/[^0-9.-]/g, ''));
          }
          if (typeof bAmount === 'string') {
            bAmount = parseFloat(bAmount.replace(/[^0-9.-]/g, ''));
          }
          
          // Ensure we have valid numbers
          aVal = isNaN(aAmount) ? 0 : Number(aAmount);
          bVal = isNaN(bAmount) ? 0 : Number(bAmount);
          break;
        case 'payment':
          aVal = (a.payment || '').toLowerCase();
          bVal = (b.payment || '').toLowerCase();
          break;
        case 'type':
          // Get category for sorting
          const envelopes = (() => { 
            try { 
              const envs = JSON.parse(localStorage.getItem('envelopes') || '[]');
              if (envs.length > 0 && typeof envs[0] === 'string') {
                return envs.map(name => ({ name, category: 'need' }));
              }
              return envs;
            } catch { return []; }
          })();
          const getCategory = (t) => {
            if (t.type !== 'expense' || !t.envelope) return '';
            const env = envelopes.find(e => e.name === t.envelope);
            return env ? env.category : '';
          };
          aVal = getCategory(a);
          bVal = getCategory(b);
          break;
        default:
          aVal = new Date(a.date);
          bVal = new Date(b.date);
      }
      
      // For numeric comparisons, ensure proper type
      if (sortColumn === 'amount') {
        // Numeric comparison
        const diff = aVal - bVal;
        if (diff !== 0) return sortDirection === 'asc' ? diff : -diff;
        return 0;
      } else {
        // String/Date comparison
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
    
    // Debug: Log first 5 sorted amounts
    if (sortColumn === 'amount') {
      console.log('First 5 sorted amounts (' + sortDirection + '):', sorted.slice(0, 5).map(t => {
        const amt = typeof t.amount === 'string' ? parseFloat(t.amount.replace(/[^0-9.-]/g, '')) : t.amount;
        return {
          desc: t.description,
          rawAmount: t.amount,
          numericAmount: amt,
          type: t.type
        };
      }));
      console.log('Last 5 sorted amounts (' + sortDirection + '):', sorted.slice(-5).map(t => {
        const amt = typeof t.amount === 'string' ? parseFloat(t.amount.replace(/[^0-9.-]/g, '')) : t.amount;
        return {
          desc: t.description,
          rawAmount: t.amount,
          numericAmount: amt,
          type: t.type
        };
      }));
    }
    
    // Render transactions
    let cardsHTML = '';
    let tableRowsHTML = '';
    let count = 0;
    
    // If sorting by date, group by date labels
    // Otherwise, render in sorted order without grouping
    if (sortColumn === 'date') {
      const grouped = {};
      sorted.forEach(t => {
        const label = getDateLabel(t.date);
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(t);
      });

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
    } else {
      // For non-date sorting, render in sorted order
      const visible = sorted.slice(0, visibleCount);
      visible.forEach(t => {
        const rendered = renderItem(t);
        cardsHTML += rendered.cardHTML;
        tableRowsHTML += rendered.tableRowHTML;
      });
      count = visible.length;
    }

    // Card layout for mobile
    const cardListHTML = `<div class="tx-card-list">${cardsHTML}</div>`;
    
    // Table layout for desktop
    const getSortIcon = (column) => {
      if (sortColumn !== column) return '⇅';
      return sortDirection === 'asc' ? '↑' : '↓';
    };
    
    const tableHTML = `
      <div class="tx-table-wrapper">
        <table class="tx-table">
          <thead>
            <tr>
              ${isMultiSelectMode ? `
                <th class="tx-table-checkbox">
                  <input type="checkbox" 
                         id="selectAllCheckbox" 
                         onclick="toggleSelectAll()"
                         ${selectedTransactions.size > 0 && selectedTransactions.size === filtered.length ? 'checked' : ''}>
                </th>
              ` : ''}
              <th class="sortable ${sortColumn === 'date' ? 'active' : ''}" onclick="sortTable('date')">
                Date <span class="sort-icon">${getSortIcon('date')}</span>
              </th>
              <th class="sortable ${sortColumn === 'description' ? 'active' : ''}" onclick="sortTable('description')">
                Name <span class="sort-icon">${getSortIcon('description')}</span>
              </th>
              <th class="sortable ${sortColumn === 'envelope' ? 'active' : ''}" onclick="sortTable('envelope')">
                Category <span class="sort-icon">${getSortIcon('envelope')}</span>
              </th>
              <th class="sortable ${sortColumn === 'type' ? 'active' : ''}" onclick="sortTable('type')">
                Type <span class="sort-icon">${getSortIcon('type')}</span>
              </th>
              <th class="sortable ${sortColumn === 'payment' ? 'active' : ''}" onclick="sortTable('payment')">
                Payment <span class="sort-icon">${getSortIcon('payment')}</span>
              </th>
              <th class="sortable ${sortColumn === 'amount' ? 'active' : ''}" onclick="sortTable('amount')">
                Amount <span class="sort-icon">${getSortIcon('amount')}</span>
              </th>
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

    // Multi-select toolbar
    const multiSelectToolbar = isMultiSelectMode && selectedTransactions.size > 0 ? `
      <div class="tx-bulk-toolbar">
        <div class="tx-bulk-info">
          <span class="tx-bulk-count">${selectedTransactions.size} selected</span>
        </div>
        <div class="tx-bulk-actions">
          <button class="tx-bulk-btn" onclick="bulkReview()" title="Review Selected">
            <span>🔍</span>
            <span>Review</span>
          </button>
          <button class="tx-bulk-btn" onclick="bulkChangeCategory()" title="Change Category">
            <span>📁</span>
            <span>Category</span>
          </button>
          <button class="tx-bulk-btn" onclick="bulkChangePayment()" title="Change Payment">
            <span>💳</span>
            <span>Payment</span>
          </button>
          <button class="tx-bulk-btn danger" onclick="bulkDelete()" title="Delete Selected">
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </div>` : '';

    const footer = remaining > 0
      ? `<div class="tx-load-more">
           <button class="tx-load-btn" onclick="loadMoreTransactions()">Load ${Math.min(remaining, 10)} more</button>
           <button class="tx-load-btn secondary" onclick="loadAllTransactions()">Show all ${total}</button>
         </div>`
      : (total > 10
          ? `<div class="tx-load-more"><button class="tx-load-btn secondary" onclick="loadFewerTransactions()">Show less</button></div>`
          : '');

    listContainer.innerHTML = multiSelectToolbar + cardListHTML + tableHTML + footer;
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
    const paymentFilter = el('txPaymentFilter');

    // Populate payment filter dropdown
    function populatePaymentFilter() {
      if (!paymentFilter) return;
      
      const payments = fromStorage('paymentMethods');
      const paymentList = Array.isArray(payments) ? payments : [];
      
      paymentFilter.innerHTML = '<option value="all">All Payments</option>' +
        paymentList.map(pm => `<option value="${pm}" ${filterPayment === pm ? 'selected' : ''}>${pm}</option>`).join('');
    }

    // Payment filter change handler
    if (paymentFilter) {
      paymentFilter.addEventListener('change', (e) => {
        filterPayment = e.target.value;
        updateFilterBadge();
        update();
      });
    }

    // Initialize payment filter
    populatePaymentFilter();

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

  // ── Multi-Select Functions ────────────────────────────────────

  window.toggleMultiSelectMode = function() {
    isMultiSelectMode = !isMultiSelectMode;
    if (!isMultiSelectMode) {
      selectedTransactions.clear();
    }
    update();
    updateMultiSelectButton();
  };

  window.bulkReview = function() {
    if (selectedTransactions.size === 0) return;

    const transactions = fromStorage('transactions');
    const selected = transactions.filter(t => selectedTransactions.has(t.id));

    // Exit multi-select mode
    isMultiSelectMode = false;
    selectedTransactions.clear();
    update();
    updateMultiSelectButton();

    // Open review modal
    if (typeof TransactionReview !== 'undefined') {
      TransactionReview.open(selected, 'date', 'desc');
    }
  };

  window.toggleTransactionSelect = function(transactionId) {
    if (selectedTransactions.has(transactionId)) {
      selectedTransactions.delete(transactionId);
    } else {
      selectedTransactions.add(transactionId);
    }
    update();
  };

  window.toggleSelectAll = function() {
    const transactions = fromStorage('transactions');
    const monthSelect = el('monthSelect');
    const yearSelect = el('yearSelect');
    const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
    const selectedYear = yearSelect ? yearSelect.value : String(new Date().getFullYear());

    let filtered = transactions.filter(t => {
      if (!t.date) return false;
      try {
        const d = new Date(t.date);
        if (selectedMonth === 'ALL') return d.getFullYear().toString() === selectedYear;
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === selectedMonth;
      } catch { return false; }
    });

    // Apply current filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const desc = (t.description || '').toLowerCase();
        const env = (t.envelope || '').toLowerCase();
        const amount = String(t.amount);
        return desc.includes(query) || env.includes(query) || amount.includes(query);
      });
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (selectedTransactions.size === filtered.length) {
      // Deselect all
      selectedTransactions.clear();
    } else {
      // Select all visible
      filtered.forEach(t => selectedTransactions.add(t.id));
    }
    update();
  };

  window.bulkChangeCategory = function() {
    if (selectedTransactions.size === 0) return;

    const transactions = fromStorage('transactions');
    const selected = transactions.filter(t => selectedTransactions.has(t.id) && t.type === 'expense');
    
    if (selected.length === 0) {
      if (typeof showToast === 'function') showToast('No expense transactions selected', 'error');
      return;
    }

    // Get envelopes
    const envelopes = (() => { 
      try { 
        const envs = JSON.parse(localStorage.getItem('envelopes') || '[]');
        return Array.isArray(envs) && envs.length > 0 && typeof envs[0] === 'object'
          ? envs.map(e => e.name)
          : envs;
      } catch { return []; }
    })();

    if (envelopes.length === 0) {
      if (typeof showToast === 'function') showToast('No categories available', 'error');
      return;
    }

    // Create category selection dialog
    const dialog = document.createElement('div');
    dialog.className = 'bulk-edit-dialog';
    dialog.innerHTML = `
      <div class="bulk-edit-overlay" onclick="this.parentElement.remove()"></div>
      <div class="bulk-edit-content">
        <div class="bulk-edit-header">
          <h3>Change Category</h3>
          <button class="bulk-edit-close" onclick="this.closest('.bulk-edit-dialog').remove()">×</button>
        </div>
        <div class="bulk-edit-body">
          <p>Change category for ${selected.length} transaction(s)</p>
          <select id="bulkCategorySelect" class="bulk-edit-select">
            ${envelopes.map(env => `<option value="${env}">${env}</option>`).join('')}
          </select>
        </div>
        <div class="bulk-edit-footer">
          <button class="bulk-edit-btn cancel" onclick="this.closest('.bulk-edit-dialog').remove()">Cancel</button>
          <button class="bulk-edit-btn confirm" onclick="confirmBulkCategoryChange()">Apply</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  };

  window.confirmBulkCategoryChange = function() {
    const select = document.getElementById('bulkCategorySelect');
    if (!select) return;

    const newCategory = select.value;
    const transactions = fromStorage('transactions');
    
    let updated = 0;
    transactions.forEach(t => {
      if (selectedTransactions.has(t.id) && t.type === 'expense') {
        t.envelope = newCategory;
        updated++;
      }
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));
    window.transactions = transactions;

    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
    if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
    if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
    if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();

    document.querySelector('.bulk-edit-dialog').remove();
    selectedTransactions.clear();
    isMultiSelectMode = false;
    update();
    updateMultiSelectButton();

    if (typeof showToast === 'function') showToast(`Updated ${updated} transaction(s)`, 'success');
  };

  window.bulkChangePayment = function() {
    if (selectedTransactions.size === 0) return;

    const transactions = fromStorage('transactions');
    const selected = transactions.filter(t => selectedTransactions.has(t.id));
    
    // Get payment methods
    const payments = fromStorage('payments').map(p => p.name);

    if (payments.length === 0) {
      if (typeof showToast === 'function') showToast('No payment methods available', 'error');
      return;
    }

    // Create payment selection dialog
    const dialog = document.createElement('div');
    dialog.className = 'bulk-edit-dialog';
    dialog.innerHTML = `
      <div class="bulk-edit-overlay" onclick="this.parentElement.remove()"></div>
      <div class="bulk-edit-content">
        <div class="bulk-edit-header">
          <h3>Change Payment Method</h3>
          <button class="bulk-edit-close" onclick="this.closest('.bulk-edit-dialog').remove()">×</button>
        </div>
        <div class="bulk-edit-body">
          <p>Change payment method for ${selected.length} transaction(s)</p>
          <select id="bulkPaymentSelect" class="bulk-edit-select">
            ${payments.map(pm => `<option value="${pm}">${pm}</option>`).join('')}
          </select>
        </div>
        <div class="bulk-edit-footer">
          <button class="bulk-edit-btn cancel" onclick="this.closest('.bulk-edit-dialog').remove()">Cancel</button>
          <button class="bulk-edit-btn confirm" onclick="confirmBulkPaymentChange()">Apply</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  };

  window.confirmBulkPaymentChange = function() {
    const select = document.getElementById('bulkPaymentSelect');
    if (!select) return;

    const newPayment = select.value;
    const transactions = fromStorage('transactions');
    
    let updated = 0;
    transactions.forEach(t => {
      if (selectedTransactions.has(t.id)) {
        t.payment = newPayment;
        updated++;
      }
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));
    window.transactions = transactions;

    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
    if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
    if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
    if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();

    document.querySelector('.bulk-edit-dialog').remove();
    selectedTransactions.clear();
    isMultiSelectMode = false;
    update();
    updateMultiSelectButton();

    if (typeof showToast === 'function') showToast(`Updated ${updated} transaction(s)`, 'success');
  };

  window.bulkDelete = function() {
    if (selectedTransactions.size === 0) return;

    const transactions = fromStorage('transactions');
    const selected = transactions.filter(t => selectedTransactions.has(t.id));

    // Calculate totals
    const totalAmount = selected.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Use custom confirmation dialog
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    
    if (confirmDialog && confirmTitle && confirmMessage && confirmOkBtn && confirmCancelBtn) {
      confirmTitle.textContent = 'Delete Multiple Transactions?';
      confirmMessage.innerHTML = `
        <div style="margin-bottom:8px;">This will permanently delete <strong>${selected.length} transaction(s)</strong></div>
        <div>Total Amount: <strong>₹${totalAmount.toLocaleString('en-IN')}</strong></div>
      `;
      
      confirmDialog.style.display = 'flex';
      
      const handleConfirm = () => {
        confirmDialog.style.display = 'none';
        
        const remaining = transactions.filter(t => !selectedTransactions.has(t.id));
        localStorage.setItem('transactions', JSON.stringify(remaining));
        window.transactions = remaining;
        
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
        if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
        if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
        
        selectedTransactions.clear();
        isMultiSelectMode = false;
        update();
        updateMultiSelectButton();
        
        if (typeof showToast === 'function') showToast(`${selected.length} transaction(s) deleted`, 'success');
        
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
      // Fallback to browser confirm
      if (confirm(`Delete ${selected.length} transaction(s)?\n\nTotal Amount: ₹${totalAmount.toLocaleString('en-IN')}`)) {
        const remaining = transactions.filter(t => !selectedTransactions.has(t.id));
        localStorage.setItem('transactions', JSON.stringify(remaining));
        window.transactions = remaining;
        
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
        if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
        if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
        
        selectedTransactions.clear();
        isMultiSelectMode = false;
        update();
        updateMultiSelectButton();
        
        if (typeof showToast === 'function') showToast(`${selected.length} transaction(s) deleted`, 'success');
      }
    }
  };

  function updateMultiSelectButton() {
    const btn = document.getElementById('multiSelectBtn');
    if (btn) {
      btn.textContent = isMultiSelectMode ? '✓ Done' : '☑️ Select';
      btn.classList.toggle('active', isMultiSelectMode);
    }
  }

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

    // Populate payment chips
    const paymentsContainer = el('txFilterPayments');
    if (paymentsContainer) {
      const payments = fromStorage('payments');
      const paymentList = payments.map(p => p.name);
      
      paymentsContainer.innerHTML = `
        <button class="tx-filter-chip ${filterPayment === 'all' ? 'active' : ''}" data-payment="all">All</button>
        ${paymentList.map(pm => `
          <button class="tx-filter-chip ${filterPayment === pm ? 'active' : ''}" data-payment="${pm}">${pm}</button>
        `).join('')}
      `;

      // Add payment chip listeners
      paymentsContainer.querySelectorAll('.tx-filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          paymentsContainer.querySelectorAll('.tx-filter-chip').forEach(c => c.classList.remove('active'));
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

    // Get payment
    const activePayment = document.querySelector('.tx-filter-chip[data-payment].active');
    filterPayment = activePayment ? activePayment.dataset.payment : 'all';

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
    filterPayment = 'all';
    filterMinAmount = null;
    filterMaxAmount = null;
    filterStartDate = null;
    filterEndDate = null;

    // Clear UI
    const minAmountInput = el('txFilterMinAmount');
    const maxAmountInput = el('txFilterMaxAmount');
    const startDateInput = el('txFilterStartDate');
    const endDateInput = el('txFilterEndDate');
    const paymentFilter = el('txPaymentFilter');
    
    if (minAmountInput) minAmountInput.value = '';
    if (maxAmountInput) maxAmountInput.value = '';
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (paymentFilter) paymentFilter.value = 'all';

    document.querySelectorAll('.tx-filter-chip').forEach(chip => {
      chip.classList.remove('active');
      if (chip.dataset.category === 'all' || chip.dataset.envelope === 'all' || chip.dataset.payment === 'all') {
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
    if (filterPayment !== 'all') activeFilters++;
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

  // ── Sorting Functions ──────────────────────────────────────────

  window.sortTable = function(column) {
    console.log('Sorting by column:', column, 'Current direction:', sortDirection);
    if (sortColumn === column) {
      // Toggle direction if same column
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending (except date which defaults to desc)
      sortColumn = column;
      sortDirection = column === 'date' ? 'desc' : 'asc';
    }
    console.log('New sort:', sortColumn, sortDirection);
    update();
  };

  // ── Inline Editing Functions ───────────────────────────────────

  let currentEditCell = null;
  let originalValue = null;

  window.editCell = function(cell) {
    // If already editing another cell, save it first
    if (currentEditCell && currentEditCell !== cell) {
      saveCellEdit();
    }

    const field = cell.dataset.field;
    const transactionId = cell.dataset.id;
    const transactions = fromStorage('transactions');
    const tx = transactions.find(t => String(t.id) === String(transactionId));
    
    if (!tx) return;

    currentEditCell = cell;
    cell.classList.add('editing');

    // Get current value
    if (field === 'description') {
      originalValue = tx.description || '';
    } else if (field === 'date') {
      originalValue = tx.date;
    } else if (field === 'envelope') {
      originalValue = tx.envelope || '';
    } else if (field === 'payment') {
      originalValue = tx.payment || '';
    } else if (field === 'amount') {
      originalValue = tx.amount;
    }

    // Create appropriate input based on field type
    let input;
    
    if (field === 'date') {
      input = document.createElement('input');
      input.type = 'date';
      input.value = originalValue;
      input.className = 'cell-edit-input';
    } else if (field === 'envelope' || field === 'payment') {
      input = document.createElement('select');
      input.className = 'cell-edit-select';
      
      if (field === 'envelope') {
        const envelopes = (() => { 
          try { 
            const envs = JSON.parse(localStorage.getItem('envelopes') || '[]');
            if (envs.length > 0 && typeof envs[0] === 'string') {
              return envs;
            }
            return envs.map(e => e.name);
          } catch { return []; }
        })();
        
        input.innerHTML = '<option value="">Select Envelope</option>' + 
          envelopes.map(env => `<option value="${env}" ${env === originalValue ? 'selected' : ''}>${env}</option>`).join('');
      } else if (field === 'payment') {
        const payments = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
        input.innerHTML = '<option value="">Select Payment</option>' + 
          payments.map(pm => `<option value="${pm}" ${pm === originalValue ? 'selected' : ''}>${pm}</option>`).join('');
      }
    } else if (field === 'amount') {
      input = document.createElement('input');
      input.type = 'number';
      input.step = '0.01';
      input.value = originalValue;
      input.className = 'cell-edit-input';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.value = originalValue;
      input.className = 'cell-edit-input';
    }

    // Replace cell content with input
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    if (input.select) input.select();

    // Save on blur or Enter key
    input.addEventListener('blur', () => saveCellEdit());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveCellEdit();
      } else if (e.key === 'Escape') {
        cancelCellEdit();
      }
    });
  };

  function saveCellEdit() {
    if (!currentEditCell) return;

    const field = currentEditCell.dataset.field;
    const transactionId = currentEditCell.dataset.id;
    const input = currentEditCell.querySelector('input, select');
    
    if (!input) {
      currentEditCell = null;
      return;
    }

    const newValue = input.value.trim();

    // Validate
    if (field === 'amount' && (!newValue || parseFloat(newValue) <= 0)) {
      if (typeof showToast === 'function') showToast('Amount must be greater than 0', 'error');
      cancelCellEdit();
      return;
    }

    // Update transaction
    const transactions = fromStorage('transactions');
    const txIndex = transactions.findIndex(t => String(t.id) === String(transactionId));
    
    if (txIndex === -1) {
      cancelCellEdit();
      return;
    }

    // Update the field
    if (field === 'description') {
      transactions[txIndex].description = newValue;
    } else if (field === 'date') {
      transactions[txIndex].date = newValue;
    } else if (field === 'envelope') {
      transactions[txIndex].envelope = newValue;
    } else if (field === 'payment') {
      transactions[txIndex].payment = newValue;
    } else if (field === 'amount') {
      transactions[txIndex].amount = parseFloat(newValue);
    }

    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    window.transactions = transactions;

    // Update UI
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
    if (typeof updateBalanceSummary === 'function') updateBalanceSummary();
    if (typeof updatePaymentBalances === 'function') updatePaymentBalances();
    if (typeof updateEnvelopeBudget === 'function') updateEnvelopeBudget();
    
    currentEditCell.classList.remove('editing');
    currentEditCell = null;
    originalValue = null;
    
    update();
    
    if (typeof showToast === 'function') showToast('Transaction updated', 'success');
  }

  function cancelCellEdit() {
    if (!currentEditCell) return;
    
    currentEditCell.classList.remove('editing');
    currentEditCell = null;
    originalValue = null;
    
    update();
  }

})();
