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
  let isExpanded = false;

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
    return methods.map(m => `
      <button type="button" class="ebs-pm-chip" data-method="${m}" data-row="${rowId}"
              onclick="EnvelopeBottomSheet._selectPM(this,'${rowId}')">
        <span>${getPaymentIcon(m)}</span> ${m}
      </button>`).join('');
  }

  function amountRowHTML() {
    return `
      <div class="ebs-amount-row">
        <span class="ebs-rupee">₹</span>
        <input id="ebsAmount" class="ebs-amount-input" type="number" inputmode="decimal"
               placeholder="0" min="0" step="0.01" />
      </div>`;
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
  // EXPENSE — quick + full
  // ══════════════════════════════════════════════════════════════

  function renderExpenseQuick(envelopeName) {
    const methods = (typeof paymentMethods !== 'undefined' ? paymentMethods : []).slice(0, 6);
    const envelopes = typeof window.envelopes !== 'undefined' ? window.envelopes
                    : (() => { try { return JSON.parse(localStorage.getItem('envelopes') || '[]'); } catch { return []; } })();

    const headerHTML = envelopeName
      ? `<div class="ebs-type-header ebs-type-expense"><span>${getEnvelopeIcon(envelopeName)}</span><span>${envelopeName}</span></div>`
      : `<div class="ebs-pm-row ebs-env-picker" id="ebsEnvRow">
           ${envelopes.map(e => `<button type="button" class="ebs-pm-chip" data-method="${e}"
             onclick="EnvelopeBottomSheet._selectPM(this,'ebsEnvRow');EnvelopeBottomSheet._setEnv(this.dataset.method)">
             <span>${getEnvelopeIcon(e)}</span> ${e}</button>`).join('')}
         </div>`;

    sheetContent.innerHTML = `
      <div class="ebs-type-header ebs-type-expense" style="${envelopeName ? '' : 'display:none'}">
        <span>${getEnvelopeIcon(envelopeName || '')}</span><span>${envelopeName || ''}</span>
      </div>
      ${!envelopeName ? `<label class="ebs-label">Envelope</label>
        <div class="ebs-pm-row ebs-env-picker" id="ebsEnvRow">
          ${envelopes.map(e => `<button type="button" class="ebs-pm-chip" data-method="${e}"
            onclick="EnvelopeBottomSheet._selectPM(this,'ebsEnvRow');EnvelopeBottomSheet._setEnv(this.dataset.method)">
            <span>${getEnvelopeIcon(e)}</span> ${e}</button>`).join('')}
        </div>` : ''}
      ${amountRowHTML()}
      <div class="ebs-pm-row" id="ebsPMRow">${pmChipsHTML(methods, 'ebsPMRow')}</div>
      <div class="ebs-nws-row">
        <button type="button" class="ebs-nws-btn" data-type="need" onclick="EnvelopeBottomSheet._selectNWS(this)">🎯 Need</button>
        <button type="button" class="ebs-nws-btn" data-type="want" onclick="EnvelopeBottomSheet._selectNWS(this)">🎉 Want</button>
        <button type="button" class="ebs-nws-btn" data-type="save" onclick="EnvelopeBottomSheet._selectNWS(this)">💰 Save</button>
      </div>
      <div class="ebs-actions">
        <button type="button" class="ebs-expand-btn" onclick="EnvelopeBottomSheet._expand()">✏️ Full Form</button>
        <button type="button" class="ebs-submit-btn ebs-submit-expense" id="ebsSubmitBtn" onclick="EnvelopeBottomSheet._submit()">Add Expense</button>
      </div>`;
    focusAmount();
  }

  function renderExpenseFull(envelopeName) {
    const methods = typeof paymentMethods !== 'undefined' ? paymentMethods : [];
    const envelopes = typeof window.envelopes !== 'undefined' ? window.envelopes
                    : (() => { try { return JSON.parse(localStorage.getItem('envelopes') || '[]'); } catch { return []; } })();

    const envSection = envelopeName
      ? `<div class="ebs-type-header ebs-type-expense"><span>${getEnvelopeIcon(envelopeName)}</span><span>${envelopeName}</span></div>`
      : `<label class="ebs-label">Envelope</label>
         <div class="ebs-pm-row ebs-env-picker" id="ebsEnvRow">
           ${envelopes.map(e => `<button type="button" class="ebs-pm-chip" data-method="${e}"
             onclick="EnvelopeBottomSheet._selectPM(this,'ebsEnvRow');EnvelopeBottomSheet._setEnv(this.dataset.method)">
             <span>${getEnvelopeIcon(e)}</span> ${e}</button>`).join('')}
         </div>`;

    sheetContent.innerHTML = `
      ${envSection}
      ${amountRowHTML()}
      <label class="ebs-label">Note (optional)</label>
      <input id="ebsNote" class="ebs-text-input" type="text" placeholder="What was this for?" maxlength="100" />
      <label class="ebs-label">Date</label>
      <input id="ebsDate" class="ebs-text-input" type="date" value="${today()}" />
      <label class="ebs-label">Payment Method</label>
      <div class="ebs-pm-row" id="ebsPMRow">${pmChipsHTML(methods, 'ebsPMRow')}</div>
      <label class="ebs-label">Category</label>
      <div class="ebs-nws-row">
        <button type="button" class="ebs-nws-btn" data-type="need" onclick="EnvelopeBottomSheet._selectNWS(this)">🎯 Need</button>
        <button type="button" class="ebs-nws-btn" data-type="want" onclick="EnvelopeBottomSheet._selectNWS(this)">🎉 Want</button>
        <button type="button" class="ebs-nws-btn" data-type="save" onclick="EnvelopeBottomSheet._selectNWS(this)">💰 Save</button>
      </div>
      <div class="ebs-actions ebs-actions--full">
        <button type="button" class="ebs-submit-btn ebs-submit-expense" id="ebsSubmitBtn" onclick="EnvelopeBottomSheet._submit()">Add Expense</button>
      </div>`;
    focusAmount();
  }

  // ══════════════════════════════════════════════════════════════
  // INCOME — quick + full
  // ══════════════════════════════════════════════════════════════

  function renderIncomeQuick() {
    const methods = (typeof paymentMethods !== 'undefined' ? paymentMethods : []).slice(0, 6);
    sheetContent.innerHTML = `
      <div class="ebs-type-header ebs-type-income">
        <span>↓</span>
        <span>Add Income</span>
      </div>
      ${amountRowHTML()}
      <div class="ebs-pm-row" id="ebsPMRow">${pmChipsHTML(methods, 'ebsPMRow')}</div>
      <div class="ebs-actions">
        <button type="button" class="ebs-expand-btn" onclick="EnvelopeBottomSheet._expand()">✏️ Full Form</button>
        <button type="button" class="ebs-submit-btn ebs-submit-income" id="ebsSubmitBtn" onclick="EnvelopeBottomSheet._submit()">Add Income</button>
      </div>`;
    focusAmount();
  }

  function renderIncomeFull() {
    const methods = typeof paymentMethods !== 'undefined' ? paymentMethods : [];
    sheetContent.innerHTML = `
      <div class="ebs-type-header ebs-type-income">
        <span>↓</span>
        <span>Add Income</span>
      </div>
      ${amountRowHTML()}
      <label class="ebs-label">Description</label>
      <input id="ebsNote" class="ebs-text-input" type="text" placeholder="Salary, freelance, etc." maxlength="100" />
      <label class="ebs-label">Date</label>
      <input id="ebsDate" class="ebs-text-input" type="date" value="${today()}" />
      <label class="ebs-label">Received In</label>
      <div class="ebs-pm-row" id="ebsPMRow">${pmChipsHTML(methods, 'ebsPMRow')}</div>
      <div class="ebs-actions ebs-actions--full">
        <button type="button" class="ebs-submit-btn ebs-submit-income" id="ebsSubmitBtn" onclick="EnvelopeBottomSheet._submit()">Add Income</button>
      </div>`;
    focusAmount();
  }

  // ══════════════════════════════════════════════════════════════
  // TRANSFER — quick + full
  // ══════════════════════════════════════════════════════════════

  function renderTransferQuick() {
    const methods = (typeof paymentMethods !== 'undefined' ? paymentMethods : []).slice(0, 6);
    sheetContent.innerHTML = `
      <div class="ebs-type-header ebs-type-transfer">
        <span>⇄</span>
        <span>Move Money</span>
      </div>
      ${amountRowHTML()}
      <label class="ebs-label">From</label>
      <div class="ebs-pm-row" id="ebsFromRow">${pmChipsHTML(methods, 'ebsFromRow')}</div>
      <div class="ebs-transfer-arrow">↓</div>
      <label class="ebs-label">To</label>
      <div class="ebs-pm-row" id="ebsToRow">${pmChipsHTML(methods, 'ebsToRow')}</div>
      <div class="ebs-actions">
        <button type="button" class="ebs-expand-btn" onclick="EnvelopeBottomSheet._expand()">✏️ Full Form</button>
        <button type="button" class="ebs-submit-btn ebs-submit-transfer" id="ebsSubmitBtn" onclick="EnvelopeBottomSheet._submit()">Move Money</button>
      </div>`;
    focusAmount();
  }

  function renderTransferFull() {
    const methods = typeof paymentMethods !== 'undefined' ? paymentMethods : [];
    sheetContent.innerHTML = `
      <div class="ebs-type-header ebs-type-transfer">
        <span>⇄</span>
        <span>Move Money</span>
      </div>
      <div class="ebs-transfer-info">💡 Doesn't affect your total balance</div>
      ${amountRowHTML()}
      <label class="ebs-label">Date</label>
      <input id="ebsDate" class="ebs-text-input" type="date" value="${today()}" />
      <label class="ebs-label">From Account</label>
      <div class="ebs-pm-row" id="ebsFromRow">${pmChipsHTML(methods, 'ebsFromRow')}</div>
      <div class="ebs-transfer-arrow">↓</div>
      <label class="ebs-label">To Account</label>
      <div class="ebs-pm-row" id="ebsToRow">${pmChipsHTML(methods, 'ebsToRow')}</div>
      <label class="ebs-label">Note (optional)</label>
      <input id="ebsNote" class="ebs-text-input" type="text" placeholder="Add a note" maxlength="100" />
      <div class="ebs-actions ebs-actions--full">
        <button type="button" class="ebs-submit-btn ebs-submit-transfer" id="ebsSubmitBtn" onclick="EnvelopeBottomSheet._submit()">Move Money</button>
      </div>`;
    focusAmount();
  }

  // ── Shared helpers ────────────────────────────────────────────

  function focusAmount() {
    setTimeout(() => { const inp = el('ebsAmount'); if (inp) inp.focus(); }, 350);
  }

  function _setEnv(name) {
    currentEnvelope = name;
    // Update the hidden header tag to show selected envelope
    const header = sheetContent.querySelector('.ebs-type-header');
    if (header) {
      header.style.display = 'flex';
      header.innerHTML = `<span>${getEnvelopeIcon(name)}</span><span>${name}</span>`;
    }
  }

  function _selectPM(btn, rowId) {
    const row = el(rowId) || sheetContent.querySelector(`[id="${rowId}"]`);
    if (row) row.querySelectorAll('.ebs-pm-chip').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Transfer: prevent same account in both rows
    if (currentType === 'transfer') {
      const fromRow = el('ebsFromRow');
      const toRow   = el('ebsToRow');
      if (!fromRow || !toRow) return;
      const fromSel = fromRow.querySelector('.ebs-pm-chip.selected');
      const toSel   = toRow.querySelector('.ebs-pm-chip.selected');
      if (fromSel && toSel && fromSel.dataset.method === toSel.dataset.method) {
        // deselect the other row's same chip
        const otherRow = rowId === 'ebsFromRow' ? toRow : fromRow;
        otherRow.querySelectorAll('.ebs-pm-chip').forEach(b => b.classList.remove('selected'));
        if (typeof showToast === 'function') showToast('⚠️ Cannot use the same account', 'error');
      }
    }
  }

  function _selectNWS(btn) {
    sheetContent.querySelectorAll('.ebs-nws-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ── Expand ────────────────────────────────────────────────────

  function _expand() {
    isExpanded = true;
    sheet.classList.add('ebs-sheet--expanded');
    if (currentType === 'income')    renderIncomeFull();
    else if (currentType === 'transfer') renderTransferFull();
    else renderExpenseFull(currentEnvelope);
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
        const pmBtn = sheetContent.querySelector('#ebsPMRow .ebs-pm-chip.selected');
        if (!pmBtn) {
          if (typeof showToast === 'function') showToast('Please select a payment method', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add Income'; }
          return;
        }
        tx = {
          id: `INC-${Date.now()}`,
          type: 'income',
          amount: parseFloat(amount).toFixed(2),
          description: note || 'Income',
          payment: pmBtn.dataset.method,
          date: new Date(dateVal).toISOString(),
        };
        _saveAndRefresh(tx, `✅ Income ₹${amount.toLocaleString('en-IN')} added`);

      } else if (currentType === 'transfer') {
        const fromBtn = sheetContent.querySelector('#ebsFromRow .ebs-pm-chip.selected');
        const toBtn   = sheetContent.querySelector('#ebsToRow .ebs-pm-chip.selected');
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
          id: `TRF-${Date.now()}`,
          type: 'transfer',
          amount: parseFloat(amount).toFixed(2),
          description: note || `Transfer from ${fromBtn.dataset.method} to ${toBtn.dataset.method}`,
          from: fromBtn.dataset.method,
          to: toBtn.dataset.method,
          date: new Date(dateVal).toISOString(),
        };
        _saveAndRefresh(tx, `✅ Moved ₹${amount.toLocaleString('en-IN')} → ${toBtn.dataset.method}`);

      } else {
        // expense
        const pmBtn  = sheetContent.querySelector('#ebsPMRow .ebs-pm-chip.selected');
        const nwsBtn = sheetContent.querySelector('.ebs-nws-btn.selected');
        if (!currentEnvelope) {
          if (typeof showToast === 'function') showToast('Please select an envelope', 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add Expense'; }
          return;
        }
        tx = {
          id: `EXP-${Date.now()}`,
          type: 'expense',
          amount: parseFloat(amount).toFixed(2),
          description: note || currentEnvelope,
          envelope: currentEnvelope,
          payment: pmBtn ? pmBtn.dataset.method : '',
          expenseType: nwsBtn ? nwsBtn.dataset.type : 'need',
          date: new Date(dateVal).toISOString(),
        };
        _saveAndRefresh(tx, `✅ ₹${amount.toLocaleString('en-IN')} added to ${currentEnvelope}`);
      }

    } catch (err) {
      console.error('EnvelopeBottomSheet submit error:', err);
      if (typeof showToast === 'function') showToast('❌ Failed to save. Try again.', 'error');
      if (submitBtn) { submitBtn.disabled = false; }
    }
  }

  function _saveAndRefresh(tx, toastMsg) {
    // Merge into global transactions array if available
    if (typeof transactions !== 'undefined' && Array.isArray(transactions)) {
      transactions.push(tx);
    } else {
      const stored = JSON.parse(localStorage.getItem('transactions') || '[]');
      stored.unshift(tx);
      localStorage.setItem('transactions', JSON.stringify(stored));
    }

    if (typeof saveToLocalStorage       === 'function') saveToLocalStorage();
    if (typeof updateBalanceSummary     === 'function') updateBalanceSummary();
    if (typeof updateRecentTransactions === 'function') updateRecentTransactions();
    if (typeof updatePaymentBalances    === 'function') updatePaymentBalances();
    if (typeof updateEnvelopeBudget     === 'function') updateEnvelopeBudget();
    if (typeof showToast                === 'function') showToast(toastMsg, 'success');

    if (typeof SafeFirebaseOps !== 'undefined' && SafeFirebaseOps.addTransaction) {
      SafeFirebaseOps.addTransaction(tx).catch(() => {});
    }

    close();
  }

  // ── Open / Close ──────────────────────────────────────────────

  function open(type, envelopeName) {
    buildSheetDOM();
    currentType     = type || 'expense';
    currentEnvelope = envelopeName || null;
    isExpanded      = false;
    sheet.classList.remove('ebs-sheet--expanded');

    if (currentType === 'income')        renderIncomeQuick();
    else if (currentType === 'transfer') renderTransferQuick();
    else                                 renderExpenseQuick(currentEnvelope || '');

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
      isExpanded = false;
      sheet.classList.remove('ebs-sheet--expanded');
    }, 320);
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    buildSheetDOM();

    // Envelope card + button → expense sheet
    window.openExpenseForEnvelope = (name) => open('expense', name);

    // FAB buttons (always visible, no toggle needed)
    const incomeFab   = el('incomeBtnFab');
    const transferFab = el('transferBtnFab');
    const expenseFab  = el('expenseBtnFab');

    if (incomeFab)   incomeFab.addEventListener('click',   () => open('income'));
    if (transferFab) transferFab.addEventListener('click', () => open('transfer'));
    if (expenseFab)  expenseFab.addEventListener('click',  () => open('expense'));

    // Header quick-track buttons (hidden on mobile but wired anyway)
    const incomeBtn   = el('incomeBtn');
    const transferBtn = el('transferBtn');
    if (incomeBtn)   incomeBtn.addEventListener('click',   () => open('income'));
    if (transferBtn) transferBtn.addEventListener('click', () => open('transfer'));
  }

  // ── Public API ────────────────────────────────────────────────
  window.EnvelopeBottomSheet = { init, open, close, _selectPM, _selectNWS, _expand, _submit, _setEnv };

})();
