/**
 * envelope-bottom-sheet.js
 * Mobile-first bottom sheet for Income, Expense (envelope), and Move Money.
 *
 * Exposes: window.EnvelopeBottomSheet
 *   .open(type, envelopeName?)  — 'income' | 'expense' | 'transfer'
 *   .init()                     — wire FAB/income/transfer buttons + backdrop
 *
 * Depends on globals: paymentMethods, envelopes, transactions,
 *   saveToLocalStorage, updateBalanceSummary, updateRecentTransactions,
 *   updatePaymentBalances, updateEnvelopeBudget, showToast, SafeFirebaseOps
 */

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────────
  let sheet, backdrop, handleBar, sheetContent;
  let currentType = 'expense';
  let currentEnvelope = null;
  let editingTransaction = null; // Track if we're editing

  // Smart defaults (remember last selections)
  let lastPaymentMethod = null;

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }
  function today() { return new Date().toISOString().split('T')[0]; }

  function getEnvelopeIcon(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('food') || n.includes('meal') || n.includes('restaurant') || n.includes('dining')) return '🍽️';
    if (n.includes('grocery') || n.includes('groceries') || n.includes('vegetable') || n.includes('sabzi')) return '🛒';
    if (n.includes('transport') || n.includes('travel') || n.includes('fuel') || n.includes('petrol') || n.includes('cab') || n.includes('auto') || n.includes('bus') || n.includes('train')) return '🚗';
    if (n.includes('health') || n.includes('medical') || n.includes('doctor') || n.includes('medicine') || n.includes('pharmacy')) return '🏥';
    if (n.includes('entertain') || n.includes('movie') || n.includes('fun') || n.includes('outing')) return '🎬';
    if (n.includes('shop') || n.includes('cloth') || n.includes('fashion') || n.includes('apparel')) return '🛍️';
    if (n.includes('utility') || n.includes('electric') || n.includes('water') || n.includes('gas') || n.includes('bill') || n.includes('internet') || n.includes('phone') || n.includes('mobile')) return '💡';
    if (n.includes('rent') || n.includes('home') || n.includes('house') || n.includes('maintenance')) return '🏠';
    if (n.includes('education') || n.includes('school') || n.includes('college') || n.includes('book') || n.includes('course')) return '📚';
    if (n.includes('invest') || n.includes('saving') || n.includes('mutual') || n.includes('sip') || n.includes('stock')) return '📈';
    if (n.includes('gift') || n.includes('donation') || n.includes('charity')) return '🎁';
    if (n.includes('personal') || n.includes('grooming') || n.includes('salon') || n.includes('spa')) return '💆';
    if (n.includes('pet')) return '🐾';
    if (n.includes('child') || n.includes('kid') || n.includes('baby')) return '👶';
    return '📁';
  }

  function getPaymentIcon(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('cash')) return '💵';
    if (n.includes('credit') || n.includes('debit') || n.includes('card') || n.includes('visa') || n.includes('mastercard') || n.includes('rupay') || n.includes('amex')) return '💳';
    if (n.includes('phonepe') || n.includes('phone pe')) return '💜';
    if (n.includes('gpay') || n.includes('google pay') || n.includes('googlepay')) return '🔵';
    if (n.includes('paytm')) return '💙';
    if (n.includes('amazon pay') || n.includes('amazonpay')) return '🟠';
    if (n.includes('upi') || n.includes('bhim') || n.includes('whatsapp pay')) return '📱';
    if (n.includes('wallet') || n.includes('mobikwik') || n.includes('freecharge')) return '👛';
    if (n.includes('neft') || n.includes('rtgs') || n.includes('transfer')) return '🔄';
    if (n.includes('imps')) return '⚡';
    if (n.includes('net banking') || n.includes('netbanking')) return '🌐';
    if (n.includes('bank')) return '🏦';
    if (n.includes('cheque') || n.includes('check')) return '📝';
    return '💰';
  }

  function pmChipsHTML(methods, rowId) {
    return methods.map(m => {
      const isSelected = m === lastPaymentMethod ? 'selected' : '';
      return `
      <button type="button" class="ebs-chip ${isSelected}" data-method="${m}" data-row="${rowId}"
              onclick="EnvelopeBottomSheet._selectChip(this,'${rowId}')">
        <span class="ebs-chip-icon">${getPaymentIcon(m)}</span> ${m}
      </button>`;
    }).join('');
  }

  function quickAmountHTML() {
    return `
      <div class="ebs-quick-amounts">
        <button type="button" class="ebs-quick-btn" onclick="EnvelopeBottomSheet._addQuick(100)">+100</button>
        <button type="button" class="ebs-quick-btn" onclick="EnvelopeBottomSheet._addQuick(500)">+500</button>
        <button type="button" class="ebs-quick-btn" onclick="EnvelopeBottomSheet._addQuick(1000)">+1000</button>
      </div>`;
  }

  function _addQuick(amount) {
    const inp = el('ebsAmount');
    if (!inp) return;
    const current = parseFloat(inp.value || 0);
    inp.value = current + amount;
    inp.focus();
  }

  // ── Build sheet DOM ───────────────────────────────────────────

  function buildSheetDOM() {
    if (el('envelopeBottomSheet')) return;

    const backdropEl = document.createElement('div');
    backdropEl.id = 'envelopeSheetBackdrop';
    backdropEl.className = 'ebs-backdrop';

    const sheetEl = document.createElement('div');
    sheetEl.id = 'envelopeBottomSheet';
    sheetEl.className = 'ebs-sheet';
    sheetEl.innerHTML = `
      <div class="ebs-handle-bar" id="ebsHandleBar"><div class="ebs-handle"></div></div>
      <div class="ebs-content" id="ebsContent"></div>
    `;

    document.body.appendChild(backdropEl);
    document.body.appendChild(sheetEl);

    sheet = sheetEl;
    backdrop = backdropEl;
    handleBar = el('ebsHandleBar');
    sheetContent = el('ebsContent');

    backdropEl.addEventListener('click', close);
    setupDragToClose();
  }

  // ── Drag-to-close ─────────────────────────────────────────────

  function setupDragToClose() {
    let startY = 0, currentY = 0, dragging = false;

    function onStart(e) {
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      dragging = true;
      sheet.style.transition = 'none';
    }
    function onMove(e) {
      if (!dragging) return;
      currentY = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
      if (currentY > 0) sheet.style.transform = `translateY(${currentY}px)`;
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      sheet.style.transform = '';
      if (currentY > 80) close();
    }

    handleBar.addEventListener('touchstart', onStart, { passive: true });
    handleBar.addEventListener('touchmove',  onMove,  { passive: true });
    handleBar.addEventListener('touchend',   onEnd);
    handleBar.addEventListener('mousedown',  onStart);
    document.addEventListener('mousemove',   onMove);
    document.addEventListener('mouseup',     onEnd);
  }

  // ══════════════════════════════════════════════════════════════
  // EXPENSE — mobile-first vertical flow
  // ══════════════════════════════════════════════════════════════

  function renderExpense(envelopeName) {
    const methods = typeof paymentMethods !== 'undefined' ? paymentMethods : [];
    const envelopes = typeof window.envelopes !== 'undefined' ? window.envelopes
                    : (() => { try { return JSON.parse(localStorage.getItem('envelopes') || '[]'); } catch { return []; } })();

    const envSection = envelopeName
      ? `<div class="ebs-type-header ebs-type-expense">
           <span>${getEnvelopeIcon(envelopeName)}</span><span>${envelopeName}</span>
           <button class="ebs-close-btn" onclick="EnvelopeBottomSheet.close()" aria-label="Close">×</button>
         </div>`
      : `<div class="ebs-type-header ebs-type-expense">
           <span>💸</span><span>Add Expense</span>
           <button class="ebs-close-btn" onclick="EnvelopeBottomSheet.close()" aria-label="Close">×</button>
         </div>`;

    const envChips = !envelopeName
      ? `<div class="ebs-section">
           <label class="ebs-section-label">Category</label>
           <div class="ebs-chip-row" id="ebsEnvRow">
             ${envelopes.map(e => {
               const categoryIcons = { need: '🧠', want: '🎯', save: '💰' };
               return `
               <button type="button" class="ebs-chip" data-method="${e.name}" data-category="${e.category}"
                 onclick="EnvelopeBottomSheet._selectChip(this,'ebsEnvRow');EnvelopeBottomSheet._setEnv(this.dataset.method)">
                 <span class="ebs-chip-icon">${getEnvelopeIcon(e.name)}</span> 
                 <span>${e.name}</span>
                 <span style="font-size: 10px; opacity: 0.7;">${categoryIcons[e.category]}</span>
               </button>`;
             }).join('')}
           </div>
         </div>`
      : '';

    sheetContent.innerHTML = `
      ${envSection}
      <div class="ebs-body">
        <div class="ebs-amount-section">
          <div class="ebs-amount-hero">
            <span class="ebs-rupee-hero">₹</span>
            <input id="ebsAmount" class="ebs-amount-input" type="number" inputmode="decimal"
                   placeholder="0" min="0" step="0.01" />
          </div>
          ${quickAmountHTML()}
        </div>

        ${envChips}

        <div class="ebs-section">
          <label class="ebs-section-label">Payment Method</label>
          <div class="ebs-chip-row" id="ebsPMRow">${pmChipsHTML(methods, 'ebsPMRow')}</div>
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">Note</label>
          <input id="ebsNote" class="ebs-text-input" type="text" placeholder="What was this for?" maxlength="100" />
          <div class="ebs-optional-hint">Optional</div>
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">Date</label>
          <input id="ebsDate" class="ebs-text-input" type="date" value="${today()}" />
        </div>
      </div>

      <div class="ebs-submit-sticky">
        <button type="button" class="ebs-submit-btn ebs-submit-expense" id="ebsSubmitBtn" 
                onclick="EnvelopeBottomSheet._submit()">Add Expense</button>
      </div>`;
    
    focusAmount();
  }

  // ══════════════════════════════════════════════════════════════
  // INCOME — mobile-first vertical flow
  // ══════════════════════════════════════════════════════════════

  function renderIncome() {
    const methods = typeof paymentMethods !== 'undefined' ? paymentMethods : [];
    
    sheetContent.innerHTML = `
      <div class="ebs-type-header ebs-type-income">
        <span>💰</span><span>Add Income</span>
        <button class="ebs-close-btn" onclick="EnvelopeBottomSheet.close()" aria-label="Close">×</button>
      </div>
      <div class="ebs-body">
        <div class="ebs-amount-section">
          <div class="ebs-amount-hero">
            <span class="ebs-rupee-hero">₹</span>
            <input id="ebsAmount" class="ebs-amount-input" type="number" inputmode="decimal"
                   placeholder="0" min="0" step="0.01" />
          </div>
          ${quickAmountHTML()}
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">Received In</label>
          <div class="ebs-chip-row" id="ebsPMRow">${pmChipsHTML(methods, 'ebsPMRow')}</div>
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">Description</label>
          <input id="ebsNote" class="ebs-text-input" type="text" placeholder="Salary, freelance, etc." maxlength="100" />
          <div class="ebs-optional-hint">Optional</div>
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">Date</label>
          <input id="ebsDate" class="ebs-text-input" type="date" value="${today()}" />
        </div>
      </div>

      <div class="ebs-submit-sticky">
        <button type="button" class="ebs-submit-btn ebs-submit-income" id="ebsSubmitBtn" 
                onclick="EnvelopeBottomSheet._submit()">Add Income</button>
      </div>`;
    
    focusAmount();
  }

  // ══════════════════════════════════════════════════════════════
  // TRANSFER — mobile-first vertical flow
  // ══════════════════════════════════════════════════════════════

  function renderTransfer() {
    const methods = typeof paymentMethods !== 'undefined' ? paymentMethods : [];
    
    sheetContent.innerHTML = `
      <div class="ebs-type-header ebs-type-transfer">
        <span>🔄</span><span>Move Money</span>
        <button class="ebs-close-btn" onclick="EnvelopeBottomSheet.close()" aria-label="Close">×</button>
      </div>
      <div class="ebs-body">
        <div class="ebs-transfer-info">💡 Doesn't affect your total balance</div>

        <div class="ebs-amount-section">
          <div class="ebs-amount-hero">
            <span class="ebs-rupee-hero">₹</span>
            <input id="ebsAmount" class="ebs-amount-input" type="number" inputmode="decimal"
                   placeholder="0" min="0" step="0.01" />
          </div>
          ${quickAmountHTML()}
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">From Account</label>
          <div class="ebs-chip-row" id="ebsFromRow">${pmChipsHTML(methods, 'ebsFromRow')}</div>
        </div>

        <div class="ebs-transfer-arrow">↓</div>

        <div class="ebs-section">
          <label class="ebs-section-label">To Account</label>
          <div class="ebs-chip-row" id="ebsToRow">${pmChipsHTML(methods, 'ebsToRow')}</div>
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">Note</label>
          <input id="ebsNote" class="ebs-text-input" type="text" placeholder="Add a note" maxlength="100" />
          <div class="ebs-optional-hint">Optional</div>
        </div>

        <div class="ebs-section">
          <label class="ebs-section-label">Date</label>
          <input id="ebsDate" class="ebs-text-input" type="date" value="${today()}" />
        </div>
      </div>

      <div class="ebs-submit-sticky">
        <button type="button" class="ebs-submit-btn ebs-submit-transfer" id="ebsSubmitBtn" 
                onclick="EnvelopeBottomSheet._submit()">Move Money</button>
      </div>`;
    
    focusAmount();
  }

  // ── Shared helpers ────────────────────────────────────────────

  function focusAmount() {
    setTimeout(() => { const inp = el('ebsAmount'); if (inp) inp.focus(); }, 350);
  }

  function _setEnv(name) {
    currentEnvelope = name;
  }

  function _selectChip(btn, rowId) {
    const row = el(rowId) || sheetContent.querySelector(`[id="${rowId}"]`);
    if (row) row.querySelectorAll('.ebs-chip').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Remember last payment method
    if (rowId === 'ebsPMRow') {
      lastPaymentMethod = btn.dataset.method;
    }

    // Transfer: prevent same account in both rows
    if (currentType === 'transfer') {
      const fromRow = el('ebsFromRow');
      const toRow   = el('ebsToRow');
      if (!fromRow || !toRow) return;
      const fromSel = fromRow.querySelector('.ebs-chip.selected');
      const toSel   = toRow.querySelector('.ebs-chip.selected');
      if (fromSel && toSel && fromSel.dataset.method === toSel.dataset.method) {
        const otherRow = rowId === 'ebsFromRow' ? toRow : fromRow;
        otherRow.querySelectorAll('.ebs-chip').forEach(b => b.classList.remove('selected'));
        if (typeof showToast === 'function') showToast('⚠️ Cannot use the same account', 'error');
      }
    }
  }

  // ── Submit ────────────────────────────────────────────────────

  function _submit() {
    const amountEl = el('ebsAmount');
    const amount = parseFloat(amountEl ? amountEl.value : 0);

    if (!amount || amount <= 0) {
      if (amountEl) { amountEl.focus(); amountEl.classList.add('ebs-input-error'); }
      setTimeout(() => amountEl && amountEl.classList.remove('ebs-input-error'), 800);
      return;
    }

    const submitBtn = el('ebsSubmitBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving…'; }

    const noteEl = el('ebsNote');
    const dateEl = el('ebsDate');
    const dateVal = dateEl ? dateEl.value : today();
    const note = noteEl ? noteEl.value.trim() : '';

    try {
      let tx;

      if (currentType === 'income') {
        const pmBtn = sheetContent.querySelector('#ebsPMRow .ebs-chip.selected');
        if (!pmBtn) {
          if (typeof showToast === 'function') showToast('Please select a payment method', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add Income'; }
          return;
        }
        tx = {
          id: editingTransaction ? editingTransaction.id : `INC-${Date.now()}`,
          type: 'income',
          amount: parseFloat(amount).toFixed(2),
          description: note || 'Income',
          payment: pmBtn.dataset.method,
          date: new Date(dateVal).toISOString(),
        };
        const msg = editingTransaction 
          ? `✅ Income updated` 
          : `✅ Income ₹${amount.toLocaleString('en-IN')} added`;
        _saveAndRefresh(tx, msg);

      } else if (currentType === 'transfer') {
        const fromBtn = sheetContent.querySelector('#ebsFromRow .ebs-chip.selected');
        const toBtn   = sheetContent.querySelector('#ebsToRow .ebs-chip.selected');
        if (!fromBtn) {
          if (typeof showToast === 'function') showToast('Select source account', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Move Money'; }
          return;
        }
        if (!toBtn) {
          if (typeof showToast === 'function') showToast('Select destination account', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Move Money'; }
          return;
        }
        if (fromBtn.dataset.method === toBtn.dataset.method) {
          if (typeof showToast === 'function') showToast('Cannot transfer to the same account', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Move Money'; }
          return;
        }
        tx = {
          id: editingTransaction ? editingTransaction.id : `TRF-${Date.now()}`,
          type: 'transfer',
          amount: parseFloat(amount).toFixed(2),
          description: note || `Transfer from ${fromBtn.dataset.method} to ${toBtn.dataset.method}`,
          from: fromBtn.dataset.method,
          to: toBtn.dataset.method,
          date: new Date(dateVal).toISOString(),
        };
        const msg = editingTransaction 
          ? `✅ Transfer updated` 
          : `✅ Moved ₹${amount.toLocaleString('en-IN')} → ${toBtn.dataset.method}`;
        _saveAndRefresh(tx, msg);

      } else {
        // expense
        const pmBtn  = sheetContent.querySelector('#ebsPMRow .ebs-chip.selected');
        if (!currentEnvelope) {
          if (typeof showToast === 'function') showToast('Please select a category', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add Expense'; }
          return;
        }
        tx = {
          id: editingTransaction ? editingTransaction.id : `EXP-${Date.now()}`,
          type: 'expense',
          amount: parseFloat(amount).toFixed(2),
          description: note || currentEnvelope,
          envelope: currentEnvelope,
          payment: pmBtn ? pmBtn.dataset.method : '',
          date: new Date(dateVal).toISOString(),
        };
        const msg = editingTransaction 
          ? `✅ Expense updated` 
          : `✅ ₹${amount.toLocaleString('en-IN')} added to ${currentEnvelope}`;
        _saveAndRefresh(tx, msg);
      }

    } catch (err) {
      console.error('EnvelopeBottomSheet submit error:', err);
      if (typeof showToast === 'function') showToast('❌ Failed to save. Try again.', 'error');
      if (submitBtn) { submitBtn.disabled = false; }
    }
  }

  function _saveAndRefresh(tx, toastMsg) {
    console.log('_saveAndRefresh called', { editingTransaction, tx });
    
    // Update localStorage first
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    console.log('Current transactions count:', transactions.length);
    
    if (editingTransaction) {
      // Update existing transaction
      const index = transactions.findIndex(t => String(t.id) === String(editingTransaction.id));
      console.log('Editing transaction, found at index:', index);
      if (index !== -1) {
        tx.id = editingTransaction.id; // Keep the same ID
        transactions[index] = tx;
      }
    } else {
      // Create new transaction
      transactions.unshift(tx);
      console.log('Creating new transaction');
    }
    
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    console.log('Saved to localStorage, new count:', transactions.length);
    
    // Update global window.transactions reference
    window.transactions = transactions;
    console.log('Updated window.transactions');

    if (typeof saveToLocalStorage       === 'function') saveToLocalStorage();
    if (typeof updateBalanceSummary     === 'function') updateBalanceSummary();
    if (typeof updateRecentTransactions === 'function') {
      console.log('Calling updateRecentTransactions');
      updateRecentTransactions();
    }
    if (typeof updatePaymentBalances    === 'function') updatePaymentBalances();
    if (typeof updateEnvelopeBudget     === 'function') updateEnvelopeBudget();
    if (typeof showToast                === 'function') showToast(toastMsg, 'success');

    if (typeof SafeFirebaseOps !== 'undefined' && SafeFirebaseOps.addTransaction) {
      SafeFirebaseOps.addTransaction(tx).catch(() => {});
    }

    editingTransaction = null; // Reset editing state
    close();
  }

  // ── Open / Close ──────────────────────────────────────────────

  function open(type, envelopeName, existingTransaction) {
    buildSheetDOM();
    currentType     = type || 'expense';
    currentEnvelope = envelopeName || null;
    editingTransaction = existingTransaction || null;
    sheet.classList.remove('ebs-sheet--expanded');

    if (currentType === 'income')        renderIncome();
    else if (currentType === 'transfer') renderTransfer();
    else                                 renderExpense(currentEnvelope || '');

    // Pre-fill form if editing
    if (editingTransaction) {
      setTimeout(() => {
        const amountEl = el('ebsAmount');
        const noteEl = el('ebsNote');
        const dateEl = el('ebsDate');
        
        if (amountEl) amountEl.value = editingTransaction.amount;
        if (noteEl) noteEl.value = existingTransaction.description || '';
        if (dateEl && existingTransaction.date) {
          dateEl.value = new Date(existingTransaction.date).toISOString().split('T')[0];
        }
        
        // Select payment method chip
        if (existingTransaction.payment || existingTransaction.paymentMethod) {
          const pm = existingTransaction.payment || existingTransaction.paymentMethod;
          const pmChip = sheetContent.querySelector(`[data-method="${pm}"]`);
          if (pmChip) _selectChip(pmChip, pmChip.dataset.row);
        }
        
        // For transfers, select from/to
        if (existingTransaction.from) {
          const fromChip = sheetContent.querySelector(`#ebsFromRow [data-method="${existingTransaction.from}"]`);
          if (fromChip) _selectChip(fromChip, 'ebsFromRow');
        }
        if (existingTransaction.to) {
          const toChip = sheetContent.querySelector(`#ebsToRow [data-method="${existingTransaction.to}"]`);
          if (toChip) _selectChip(toChip, 'ebsToRow');
        }
        
        // For expenses, select envelope if not pre-selected
        if (existingTransaction.envelope && !currentEnvelope) {
          const envChip = sheetContent.querySelector(`#ebsEnvRow [data-method="${existingTransaction.envelope}"]`);
          if (envChip) {
            _selectChip(envChip, 'ebsEnvRow');
            _setEnv(existingTransaction.envelope);
          }
        }
        
        // Update button text
        const submitBtn = el('ebsSubmitBtn');
        if (submitBtn) {
          if (currentType === 'expense') submitBtn.textContent = 'Update Expense';
          else if (currentType === 'income') submitBtn.textContent = 'Update Income';
          else if (currentType === 'transfer') submitBtn.textContent = 'Update Transfer';
        }
      }, 100);
    }

    requestAnimationFrame(() => {
      backdrop.classList.add('ebs-backdrop--visible');
      sheet.classList.add('ebs-sheet--open');
    });
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!sheet) return;
    backdrop.classList.remove('ebs-backdrop--visible');
    sheet.classList.remove('ebs-sheet--open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (sheetContent) sheetContent.innerHTML = '';
      sheet.classList.remove('ebs-sheet--expanded');
    }, 320);
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    buildSheetDOM();

    // Envelope card + button → expense sheet
    window.openExpenseForEnvelope = (name) => open('expense', name);

    // Bottom nav action buttons
    const bottomExpense  = el('bottomExpenseBtn');
    const bottomIncome   = el('bottomIncomeBtn');
    const bottomTransfer = el('bottomTransferBtn');

    if (bottomExpense)  bottomExpense.addEventListener('click',  () => open('expense'));
    if (bottomIncome)   bottomIncome.addEventListener('click',   () => open('income'));
    if (bottomTransfer) bottomTransfer.addEventListener('click', () => open('transfer'));

    // Header quick-track buttons (desktop)
    const incomeBtn   = el('incomeBtn');
    const transferBtn = el('transferBtn');
    if (incomeBtn)   incomeBtn.addEventListener('click',   () => open('income'));
    if (transferBtn) transferBtn.addEventListener('click', () => open('transfer'));
  }

  // ── Public API ────────────────────────────────────────────────
  window.EnvelopeBottomSheet = { init, open, close, _selectChip, _submit, _setEnv, _addQuick };

})();
