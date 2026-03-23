/**
 * transaction-modal.js — Income / Expense / Move Money modal module
 *
 * Exposes: window.TransactionModal
 *   .init()                          — wire all buttons and form submit
 *   .open(type, preselectedEnvelope) — open modal for 'income'|'expense'|'transfer'
 *
 * Depends on globals set by main script:
 *   transactions, paymentMethods, envelopes, defaultBudgets
 *   saveToLocalStorage, updateBalanceSummary, updateRecentTransactions,
 *   updatePaymentBalances, updateEnvelopeBudget, showToast, SafeFirebaseOps
 */

(function () {

  // ── State ─────────────────────────────────────────────────────
  let activeType = 'expense';
  let expenseEntryCount = 0;

  // ── DOM refs (resolved on init) ───────────────────────────────
  let transactionModal, closeTransactionModalBtn, transactionModalTitle,
      expenseEntriesContainer, addAnotherExpenseBtn, submitBtn, quickForm,
      incomeBtn, expenseBtn, transferBtn;

  function el(id) { return document.getElementById(id); }

  // ── Icon helpers ──────────────────────────────────────────────

  function getPaymentIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('cash'))   return '💵';
    if (n.includes('credit') || n.includes('debit') || n.includes('card') ||
        n.includes('visa') || n.includes('mastercard') || n.includes('rupay') || n.includes('amex')) return '💳';
    if (n.includes('phonepe') || n.includes('phone pe')) return '💜';
    if (n.includes('gpay') || n.includes('google pay') || n.includes('googlepay')) return '🔵';
    if (n.includes('paytm'))  return '💙';
    if (n.includes('amazon pay') || n.includes('amazonpay')) return '🟠';
    if (n.includes('upi') || n.includes('bhim') || n.includes('whatsapp pay')) return '📱';
    if (n.includes('wallet') || n.includes('mobikwik') || n.includes('freecharge')) return '👛';
    if (n.includes('neft') || n.includes('rtgs') || n.includes('transfer')) return '🔄';
    if (n.includes('imps'))   return '⚡';
    if (n.includes('net banking') || n.includes('netbanking')) return '🌐';
    if (n.includes('bank'))   return '🏦';
    if (n.includes('cheque') || n.includes('check')) return '📝';
    return '💰';
  }

  function getEnvelopeIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('food') || n.includes('meal') || n.includes('restaurant') || n.includes('dining')) return '🍽️';
    if (n.includes('grocer')) return '🛒';
    if (n.includes('coffee') || n.includes('cafe')) return '☕';
    if (n.includes('transport') || n.includes('travel') || n.includes('car')) return '🚗';
    if (n.includes('taxi') || n.includes('cab') || n.includes('uber') || n.includes('ola')) return '🚕';
    if (n.includes('fuel') || n.includes('petrol') || n.includes('diesel')) return '⛽';
    if (n.includes('flight') || n.includes('air')) return '✈️';
    if (n.includes('train') || n.includes('metro')) return '🚆';
    if (n.includes('shop') || n.includes('cloth') || n.includes('fashion')) return '🛍️';
    if (n.includes('electronic') || n.includes('gadget')) return '💻';
    if (n.includes('health') || n.includes('medical') || n.includes('doctor')) return '⚕️';
    if (n.includes('medicine') || n.includes('pharmacy')) return '💊';
    if (n.includes('fitness') || n.includes('gym')) return '💪';
    if (n.includes('rent') || n.includes('house')) return '🏠';
    if (n.includes('electric')) return '💡';
    if (n.includes('water')) return '💧';
    if (n.includes('internet') || n.includes('wifi')) return '🌐';
    if (n.includes('phone') || n.includes('mobile') || n.includes('recharge')) return '📱';
    if (n.includes('education') || n.includes('school') || n.includes('college')) return '🎓';
    if (n.includes('book')) return '📚';
    if (n.includes('entertainment') || n.includes('movie') || n.includes('game')) return '🎮';
    if (n.includes('saving') || n.includes('invest')) return '💰';
    if (n.includes('insurance')) return '🛡️';
    if (n.includes('gift')) return '🎁';
    if (n.includes('subscription') || n.includes('netflix') || n.includes('spotify')) return '📺';
    if (n.includes('pet')) return '🐾';
    if (n.includes('vacation') || n.includes('trip')) return '🏖️';
    return '📁';
  }


  // ── Payment method balance ────────────────────────────────────

  function getPaymentMethodBalance(method) {
    let balance = 0;
    (typeof transactions !== 'undefined' ? transactions : []).forEach(t => {
      if      (t.type === 'income'   && t.payment === method) balance += parseFloat(t.amount);
      else if (t.type === 'expense'  && t.payment === method) balance -= parseFloat(t.amount);
      else if (t.type === 'transfer') {
        if (t.from === method) balance -= parseFloat(t.amount);
        if (t.to   === method) balance += parseFloat(t.amount);
      }
    });
    return balance;
  }

  // ── Visual UI builders ────────────────────────────────────────

  function selectVisualOption(container, value) {
    container.querySelectorAll('.visual-option, .pm-chip').forEach(b => b.classList.remove('selected'));
    const sel = container.querySelector(`[data-value="${value}"]`);
    if (sel) sel.classList.add('selected');
  }

  function getSelectedValue(container) {
    if (!container) return '';
    if (container.tagName === 'INPUT' && container.type === 'hidden') return container.value || '';
    if (container.tagName === 'SELECT') return container.value || '';
    const sel = container.querySelector('.visual-option.selected, .pm-chip.selected');
    return sel ? sel.dataset.value : '';
  }

  function createPaymentDropdown(dropdown, methods, selectedValue = '') {
    methods.forEach(method => {
      const option = document.createElement('option');
      option.value = method;
      const balance = getPaymentMethodBalance(method);
      const balanceText = balance >= 0
        ? `₹${balance.toLocaleString('en-IN')}`
        : `-₹${Math.abs(balance).toLocaleString('en-IN')}`;
      const icon = getPaymentIcon(method);
      option.textContent = `${icon} ${method} (${balanceText})`;
      if (method === selectedValue) option.selected = true;
      dropdown.appendChild(option);
    });
  }

  function createVisualOptions(container, options, selectedValue = '', iconGetter = null) {
    options.forEach(option => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'visual-option';
      const value = typeof option === 'string' ? option : option.value;
      const label = typeof option === 'string' ? option : option.label;
      const icon  = typeof option === 'string' ? (iconGetter ? iconGetter(option) : '📁') : option.icon;
      btn.dataset.value = value;
      btn.innerHTML = `<div class="visual-option-icon">${icon}</div><div class="visual-option-label">${label}</div>`;
      btn.onclick = () => selectVisualOption(container, value);
      if (value === selectedValue) btn.classList.add('selected');
      container.appendChild(btn);
    });
  }


  // ── Validation ────────────────────────────────────────────────

  function validateAmount(amount) {
    const num = parseFloat(amount);
    if (!amount || String(amount).trim() === '') return { valid: false, error: 'Amount is required' };
    if (isNaN(num))  return { valid: false, error: 'Invalid amount' };
    if (num <= 0)    return { valid: false, error: 'Amount must be greater than 0' };
    if (num > 10000000) return { valid: false, error: 'Amount too large' };
    return { valid: true };
  }

  function validateDescription(description) {
    if (!description || description.trim() === '') return { valid: false, error: 'Description is required' };
    if (description.trim().length < 2) return { valid: false, error: 'Description too short' };
    if (description.length > 200)      return { valid: false, error: 'Description too long (max 200 chars)' };
    return { valid: true };
  }

  function validateDate(dateStr) {
    if (!dateStr) return { valid: false, error: 'Date is required' };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { valid: false, error: 'Invalid date' };
    const today = new Date(); today.setHours(23, 59, 59, 999);
    if (date > today) return { valid: false, error: 'Future dates not allowed' };
    return { valid: true };
  }

  function showFieldError(field, message) {
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
    field.style.borderColor = '#ef4444';
    field.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.1)';
    const div = document.createElement('div');
    div.className = 'field-error';
    div.textContent = message;
    div.style.cssText = 'color:#ef4444;font-size:11px;margin-top:4px;font-weight:600;';
    field.parentElement.appendChild(div);
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearFieldError(field) {
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
    field.style.borderColor = '';
    field.style.boxShadow   = '';
  }

  // ── Submit button state ───────────────────────────────────────

  function setSubmitButtonLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor  = 'not-allowed';
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
    } else {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor  = 'pointer';
      if (submitBtn.dataset.originalText) submitBtn.textContent = submitBtn.dataset.originalText;
    }
  }

  function setupModalForType(type, title, buttonText) {
    transactionModalTitle.textContent = title;
    submitBtn.classList.remove('income', 'expense', 'transfer');
    submitBtn.classList.add(type);
    submitBtn.textContent = buttonText;
  }

  function updateSubmitButtonText() {
    const count = document.querySelectorAll('.expense-entry').length;
    if (activeType === 'expense' && count > 1) submitBtn.textContent = `Add ${count} Expenses`;
    else if (activeType === 'expense')          submitBtn.textContent = 'Add Expense';
  }


  // ── Focus + real-time validation ──────────────────────────────

  function focusAmountInput(entry, selector = '#amountInput') {
    setTimeout(() => {
      const amountInput = entry.querySelector(selector);
      if (amountInput) {
        amountInput.focus();
        amountInput.addEventListener('input', () => clearFieldError(amountInput));
        amountInput.addEventListener('blur', () => {
          if (amountInput.value) {
            const v = validateAmount(amountInput.value);
            if (!v.valid) showFieldError(amountInput, v.error);
          }
        });
      }
      const descInput = entry.querySelector('[data-field="description"], #descriptionInput');
      if (descInput) {
        descInput.addEventListener('input', () => clearFieldError(descInput));
        descInput.addEventListener('blur', () => {
          if (descInput.value) {
            const v = validateDescription(descInput.value);
            if (!v.valid) showFieldError(descInput, v.error);
          }
        });
      }
      const dateInput = entry.querySelector('[data-field="date"], #transactionDate');
      if (dateInput) {
        dateInput.addEventListener('input', () => clearFieldError(dateInput));
        dateInput.addEventListener('blur', () => {
          if (dateInput.value) {
            const v = validateDate(dateInput.value);
            if (!v.valid) showFieldError(dateInput, v.error);
          }
        });
      }
    }, 100);
  }

  // ── Entry builders ────────────────────────────────────────────

  function createExpenseEntry(index, preselectedEnvelope = null) {
    const entry = document.createElement('div');
    entry.className = 'expense-entry';
    entry.dataset.index = index;
    const todayStr = new Date().toISOString().split('T')[0];
    entry.innerHTML = `
      <div class="expense-entry-header">
        ${index > 0 ? `<button type="button" class="remove-expense-btn" onclick="TransactionModal._removeEntry(${index})" title="Remove">×</button>` : ''}
      </div>
      <div class="expense-entry-fields">
        <div class="form-group">
          <label class="form-label">Amount</label>
          <div class="amount-input-wrapper">
            <span class="currency">₹</span>
            <input type="number" inputmode="decimal" class="amount-input" placeholder="0" data-field="amount" name="expense-amount-${index}" id="expense-amount-${index}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <input type="text" class="description-input" placeholder="What's this for?" data-field="description" name="expense-description-${index}" id="expense-description-${index}" />
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:#6b7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">📅 Date</div>
          <input type="date" data-field="date" name="expense-date-${index}" id="expense-date-${index}" value="${todayStr}" class="date-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="category-dropdown" data-field="envelope" name="expense-category-${index}" id="expense-category-${index}">
            <option value="">Select category...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Payment Method</label>
          <select class="payment-dropdown" data-field="payment" name="expense-payment-${index}" id="expense-payment-${index}">
            <option value="">Select payment method...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select class="expense-type-dropdown" data-field="expenseType" name="expense-type-${index}" id="expense-type-${index}">
            <option value="">Select type...</option>
            <option value="need">🎯 Need</option>
            <option value="want">🎉 Want</option>
            <option value="save">💰 Save</option>
          </select>
        </div>
      </div>`;
    return entry;
  }

  function createSingleEntry(type) {
    const entry = document.createElement('div');
    const todayStr = new Date().toISOString().split('T')[0];
    if (type === 'income') {
      entry.innerHTML = `
        <div class="form-group">
          <label class="form-label">Amount</label>
          <div class="amount-input-wrapper"><span class="currency">₹</span>
            <input type="number" inputmode="decimal" id="amountInput" name="income-amount" placeholder="0" class="amount-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <input type="text" id="descriptionInput" name="income-description" placeholder="What's this for?" class="description-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" id="transactionDate" name="income-date" value="${todayStr}" class="date-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Payment Method</label>
          <select class="payment-dropdown" id="incomePaymentSelector" name="income-payment">
            <option value="">Select payment method...</option>
          </select>
        </div>`;
    } else if (type === 'transfer') {
      entry.innerHTML = `
        <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);padding:10px 12px;border-radius:10px;margin-bottom:12px;border:2px solid #93c5fd;">
          <div style="font-size:12px;font-weight:600;color:#1e40af;margin-bottom:2px;">💡 Moving money between accounts</div>
          <div style="font-size:11px;color:#3b82f6;">This doesn't affect your total balance</div>
        </div>
        <div class="form-group">
          <label class="form-label">Amount</label>
          <div class="amount-input-wrapper"><span class="currency">₹</span>
            <input type="number" inputmode="decimal" id="amountInput" name="transfer-amount" placeholder="0" class="amount-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" id="transactionDate" name="transfer-date" value="${todayStr}" class="date-input" />
        </div>
        <div class="form-group">
          <label class="form-label">From Account</label>
          <select class="payment-dropdown" id="transferFromSelector" name="transfer-from">
            <option value="">Select account...</option>
          </select>
        </div>
        <div style="display:flex;justify-content:center;margin:8px 0;">
          <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;padding:6px 14px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 2px 8px rgba(59,130,246,0.3);">↓</div>
        </div>
        <div class="form-group">
          <label class="form-label">To Account</label>
          <select class="payment-dropdown" id="transferToSelector" name="transfer-to">
            <option value="">Select account...</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Note (optional)</label>
          <input type="text" id="descriptionInput" name="transfer-description" placeholder="Add a note" class="description-input" />
        </div>`;
    }
    return entry;
  }


  // ── Entry management ──────────────────────────────────────────

  function removeExpenseEntry(index) {
    const entry = document.querySelector(`.expense-entry[data-index="${index}"]`);
    if (!entry) return;
    entry.remove();
    expenseEntryCount--;
    document.querySelectorAll('.expense-entry').forEach((e, i) => {
      e.dataset.index = i;
      const removeBtn = e.querySelector('.remove-expense-btn');
      if (removeBtn) removeBtn.setAttribute('onclick', `TransactionModal._removeEntry(${i})`);
    });
    if (expenseEntryCount === 0) addAnotherExpenseBtn.style.display = 'none';
    updateSubmitButtonText();
  }

  function addExpenseEntry(preselectedEnvelope = null) {
    let previousEnvelope = preselectedEnvelope || '';
    let previousPayment  = '';
    if (expenseEntryCount > 0 && !preselectedEnvelope) {
      const prev = document.querySelector(`.expense-entry[data-index="${expenseEntryCount - 1}"]`);
      if (prev) {
        previousEnvelope = getSelectedValue(prev.querySelector('[data-field="envelope"]'));
        previousPayment  = getSelectedValue(prev.querySelector('[data-field="payment"]'));
      }
    }
    const entry = createExpenseEntry(expenseEntryCount, preselectedEnvelope);
    expenseEntriesContainer.appendChild(entry);

    // Populate category dropdown
    const envelopeDropdown = entry.querySelector('[data-field="envelope"]');
    if (envelopeDropdown && envelopeDropdown.tagName === 'SELECT') {
      const envelopeList = typeof envelopes !== 'undefined' ? envelopes : [];
      envelopeList.forEach(env => {
        const option = document.createElement('option');
        option.value = env.name || env;
        const icon = getEnvelopeIcon(env.name || env);
        option.textContent = `${icon} ${env.name || env}`;
        if (preselectedEnvelope && (env.name === preselectedEnvelope || env === preselectedEnvelope)) {
          option.selected = true;
        } else if (previousEnvelope && (env.name === previousEnvelope || env === previousEnvelope)) {
          option.selected = true;
        }
        envelopeDropdown.appendChild(option);
      });
    }

    // Populate payment dropdown
    const paymentDropdown = entry.querySelector('[data-field="payment"]');
    if (paymentDropdown && paymentDropdown.tagName === 'SELECT') {
      createPaymentDropdown(paymentDropdown, typeof paymentMethods !== 'undefined' ? paymentMethods : [], previousPayment);
    }

    expenseEntryCount++;
    focusAmountInput(entry, '[data-field="amount"]');
    updateSubmitButtonText();
  }

  // ── Open modal ────────────────────────────────────────────────

  function openTransactionModal(type, preselectedEnvelope = null) {
    activeType = type;
    transactionModal.classList.add('show');
    expenseEntriesContainer.innerHTML = '';
    expenseEntryCount = 0;

    if (type === 'income') {
      setupModalForType('income', 'Add Income', 'Add Income');
      addAnotherExpenseBtn.style.display = 'none';
      const entry = createSingleEntry('income');
      expenseEntriesContainer.appendChild(entry);
      const incomePaymentDropdown = entry.querySelector('#incomePaymentSelector');
      if (incomePaymentDropdown && incomePaymentDropdown.tagName === 'SELECT') {
        createPaymentDropdown(incomePaymentDropdown, typeof paymentMethods !== 'undefined' ? paymentMethods : []);
      }
      focusAmountInput(entry);

    } else if (type === 'transfer') {
      setupModalForType('transfer', 'Move Money', 'Move Money');
      addAnotherExpenseBtn.style.display = 'none';
      const entry = createSingleEntry('transfer');
      expenseEntriesContainer.appendChild(entry);
      const fromContainer = entry.querySelector('#transferFromSelector');
      const toContainer   = entry.querySelector('#transferToSelector');
      const methods = typeof paymentMethods !== 'undefined' ? paymentMethods : [];

      if (fromContainer && fromContainer.tagName === 'SELECT') {
        createPaymentDropdown(fromContainer, methods);
      }
      if (toContainer && toContainer.tagName === 'SELECT') {
        createPaymentDropdown(toContainer, methods);
      }
      
      // Add change listeners to prevent same account selection
      if (fromContainer) {
        fromContainer.addEventListener('change', () => {
          const from = fromContainer.value;
          const to = toContainer.value;
          if (from && to && from === to) {
            toContainer.value = '';
            showToast('⚠️ Cannot select the same account', 'error');
          }
        });
      }
      if (toContainer) {
        toContainer.addEventListener('change', () => {
          const from = fromContainer.value;
          const to = toContainer.value;
          if (from && to && from === to) {
            toContainer.value = '';
            showToast('⚠️ Cannot select the same account', 'error');
          }
        });
      }
      
      focusAmountInput(entry);

    } else {
      // expense
      setupModalForType('expense', 'Add Expense', 'Add Expense');
      addAnotherExpenseBtn.style.display = 'block';
      addExpenseEntry(preselectedEnvelope);
    }
  }

  function closeModal() {
    transactionModal.classList.remove('show');
    expenseEntriesContainer.innerHTML = '';
    expenseEntryCount = 0;
  }


  // ── Submit handler ────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    setSubmitButtonLoading(true);

    try {
      if (activeType === 'expense') {
        const entries = document.querySelectorAll('.expense-entry');
        let successCount = 0, totalAmount = 0, hasError = false;

        for (const entry of entries) {
          const amountField      = entry.querySelector('[data-field="amount"]');
          const descriptionField = entry.querySelector('[data-field="description"]');
          const dateField        = entry.querySelector('[data-field="date"]');
          const envelopeContainer    = entry.querySelector('[data-field="envelope"]');
          const paymentContainer     = entry.querySelector('[data-field="payment"]');
          const expenseTypeContainer = entry.querySelector('[data-field="expenseType"]');

          const amount      = amountField.value;
          const description = descriptionField.value;
          const dateValue   = dateField.value;
          const envelope    = getSelectedValue(envelopeContainer);
          const payment     = getSelectedValue(paymentContainer);
          const expenseType = getSelectedValue(expenseTypeContainer);

          clearFieldError(amountField); clearFieldError(descriptionField); clearFieldError(dateField);

          const av = validateAmount(amount);
          if (!av.valid) { showFieldError(amountField, av.error); hasError = true; continue; }
          const dv = validateDescription(description);
          if (!dv.valid) { showFieldError(descriptionField, dv.error); hasError = true; continue; }
          const dtv = validateDate(dateValue);
          if (!dtv.valid) { showFieldError(dateField, dtv.error); hasError = true; continue; }
          if (!envelope)    { showToast('Please select a category', 'error');       hasError = true; continue; }
          if (!payment)     { showToast('Please select payment method', 'error');   hasError = true; continue; }
          if (!expenseType) { showToast('Please select expense type', 'error');     hasError = true; continue; }

          const data = {
            id: `EXP-${Date.now()}-${successCount}`,
            type: 'expense',
            amount: parseFloat(amount).toFixed(2),
            description: description.trim(),
            envelope, payment, expenseType,
            date: new Date(dateValue).toISOString(),
          };
          try {
            transactions.push(data);
            if (typeof SafeFirebaseOps !== 'undefined') {
              await SafeFirebaseOps.addTransaction(data);
              if (envelope) await SafeFirebaseOps.updateBudget(envelope, parseFloat(amount));
            }
            successCount++; totalAmount += parseFloat(amount);
          } catch (err) { console.error('Error adding expense:', err); showToast('Error saving expense.', 'error'); }
        }

        if (hasError && successCount === 0) { showToast('Please fix the errors and try again', 'error'); setSubmitButtonLoading(false); return; }
        if (successCount > 0) {
          saveToLocalStorage(); updateBalanceSummary(); updateRecentTransactions(); updatePaymentBalances(); updateEnvelopeBudget();
          showToast(successCount > 1 ? `${successCount} expenses added: ₹${totalAmount.toLocaleString('en-IN')}` : `Expense: ₹${totalAmount.toLocaleString('en-IN')}`, 'success');
          closeModal();
        }

      } else if (activeType === 'transfer') {
        const amountField = el('amountInput');
        const dateField   = el('transactionDate');
        const fromContainer = el('transferFromSelector');
        const toContainer   = el('transferToSelector');
        const amount      = amountField.value;
        const description = el('descriptionInput').value;
        const dateValue   = dateField.value;
        const fromPayment = getSelectedValue(fromContainer);
        const toPayment   = getSelectedValue(toContainer);

        clearFieldError(amountField); clearFieldError(dateField);
        const av = validateAmount(amount);
        if (!av.valid) { showFieldError(amountField, av.error); setSubmitButtonLoading(false); return; }
        const dtv = validateDate(dateValue);
        if (!dtv.valid) { showFieldError(dateField, dtv.error); setSubmitButtonLoading(false); return; }
        if (!fromPayment) { showToast('Please select source account', 'error');      setSubmitButtonLoading(false); return; }
        if (!toPayment)   { showToast('Please select destination account', 'error'); setSubmitButtonLoading(false); return; }
        if (fromPayment === toPayment) { showToast('Cannot transfer to the same account', 'error'); setSubmitButtonLoading(false); return; }

        const data = {
          id: `TRF-${Date.now()}`, type: 'transfer',
          amount: parseFloat(amount).toFixed(2),
          description: description.trim() || `Transfer from ${fromPayment} to ${toPayment}`,
          from: fromPayment, to: toPayment,
          date: new Date(dateValue).toISOString(),
        };
        try {
          transactions.push(data);
          if (typeof SafeFirebaseOps !== 'undefined') await SafeFirebaseOps.addTransaction(data);
          saveToLocalStorage(); updateBalanceSummary(); updateRecentTransactions(); updatePaymentBalances(); updateEnvelopeBudget();
          showToast(`Moved ₹${parseFloat(amount).toLocaleString('en-IN')} from ${fromPayment} to ${toPayment}`, 'success');
          closeModal();
        } catch (err) { console.error('Error adding transfer:', err); showToast('Error moving money.', 'error'); }

      } else if (activeType === 'income') {
        const amountField      = el('amountInput');
        const descriptionField = el('descriptionInput');
        const dateField        = el('transactionDate');
        const paymentContainer = el('incomePaymentSelector');
        const amount      = amountField.value;
        const description = descriptionField.value;
        const dateValue   = dateField.value;
        const payment     = getSelectedValue(paymentContainer);

        clearFieldError(amountField); clearFieldError(descriptionField); clearFieldError(dateField);
        const av = validateAmount(amount);
        if (!av.valid) { showFieldError(amountField, av.error); setSubmitButtonLoading(false); return; }
        const dv = validateDescription(description);
        if (!dv.valid) { showFieldError(descriptionField, dv.error); setSubmitButtonLoading(false); return; }
        const dtv = validateDate(dateValue);
        if (!dtv.valid) { showFieldError(dateField, dtv.error); setSubmitButtonLoading(false); return; }
        if (!payment) { showToast('Please select payment method', 'error'); setSubmitButtonLoading(false); return; }

        const data = {
          id: `INC-${Date.now()}`, type: 'income',
          amount: parseFloat(amount).toFixed(2),
          description: description.trim(), payment,
          date: new Date(dateValue).toISOString(),
        };
        try {
          transactions.push(data);
          if (typeof SafeFirebaseOps !== 'undefined') await SafeFirebaseOps.addTransaction(data);
          saveToLocalStorage(); updateBalanceSummary(); updateRecentTransactions(); updatePaymentBalances(); updateEnvelopeBudget();
          showToast(`Income: ₹${parseFloat(amount).toLocaleString('en-IN')} - ${description.trim()}`, 'success');
          closeModal();
        } catch (err) { console.error('Error adding income:', err); showToast('Error adding income.', 'error'); }
      }
    } finally {
      setSubmitButtonLoading(false);
    }
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    transactionModal          = el('transactionModal');
    closeTransactionModalBtn  = el('closeTransactionModal');
    transactionModalTitle     = el('transactionModalTitle');
    expenseEntriesContainer   = el('expenseEntriesContainer');
    addAnotherExpenseBtn      = el('addAnotherExpenseBtn');
    submitBtn                 = el('submitBtn');
    quickForm                 = el('quickForm');
    incomeBtn                 = el('incomeBtn');
    expenseBtn                = el('expenseBtn');
    transferBtn               = el('transferBtn');

    // Income / Transfer are now handled by EnvelopeBottomSheet (bottom sheet).
    // Only wire the expense button here (used by the hidden quick-track header).
    if (expenseBtn)  expenseBtn.addEventListener('click',  () => openTransactionModal('expense'));

    addAnotherExpenseBtn.addEventListener('click', () => addExpenseEntry());

    closeTransactionModalBtn.addEventListener('click', closeModal);
    transactionModal.addEventListener('click', e => { if (e.target === transactionModal) closeModal(); });

    quickForm.addEventListener('submit', handleSubmit);

    // openExpenseForEnvelope is registered by EnvelopeBottomSheet.init()
  }

  // ── Public API ────────────────────────────────────────────────

  window.TransactionModal = {
    init,
    open: openTransactionModal,
    _removeEntry: removeExpenseEntry,   // called from inline onclick in generated HTML
  };

})();
