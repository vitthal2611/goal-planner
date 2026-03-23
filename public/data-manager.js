// ─── Data Manager — Import / Export / Download Report ──────────────────────
// Depends on globals: transactions, paymentMethods, envelopes, defaultBudgets,
//   budgets, habits, habitCheckins, milestones, progressions,
//   monthSelect, yearSelect, EnvelopeBudget,
//   saveToLocalStorage, showToast,
//   updatePaymentMethodsList, updatePaymentDropdowns, updateEnvelopesList,
//   updateEnvelopeDropdowns, updateBalanceSummary, updateRecentTransactions,
//   updatePaymentBalances, updateEnvelopeBudget, updateTimelineView,
//   generateMonthDropdown, profileModal

// ── JSON Backup Export ───────────────────────────────────────────────────────

function initExportData() {
  const btn = document.getElementById('exportDataBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        paymentMethods,
        envelopes,
        defaultBudgets,
        budgets,
        transactions,
        habits,
        habitCheckins,
        milestones,
        progressions
      }
    };
    _triggerDownload(
      JSON.stringify(payload, null, 2),
      `life-tracker-backup-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    showToast('Data exported successfully! 📥', 'success');
  });
}

// ── JSON Backup Import ───────────────────────────────────────────────────────

function initImportData() {
  const btn       = document.getElementById('importDataBtn');
  const fileInput = document.getElementById('importFileInput');
  if (!btn || !fileInput) return;

  btn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('⚠️ This will replace ALL your current data. Are you sure you want to continue?')) {
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported.data) throw new Error('Invalid backup file format');

        paymentMethods = imported.data.paymentMethods || [];
        envelopes      = imported.data.envelopes      || [];
        defaultBudgets = imported.data.defaultBudgets || {};
        budgets        = imported.data.budgets        || [];
        transactions   = imported.data.transactions   || [];
        habits         = imported.data.habits         || [];
        habitCheckins  = imported.data.habitCheckins  || [];
        milestones     = imported.data.milestones     || [];
        progressions   = imported.data.progressions   || [];

        saveToLocalStorage();
        updatePaymentMethodsList();
        updatePaymentDropdowns();
        updateEnvelopesList();
        updateEnvelopeDropdowns();
        updateBalanceSummary();
        updateRecentTransactions();
        updatePaymentBalances();
        updateEnvelopeBudget();
        if (typeof updateTimelineView === 'function') updateTimelineView();

        showToast('Data imported successfully! 📤', 'success');
        profileModal.classList.remove('show');
      } catch (err) {
        console.error('Error importing data:', err);
        showToast('Error importing data. Please check the file format.', 'error');
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });
}

// ── CSV / Excel Import ───────────────────────────────────────────────────────

let csvParsedRows = [];

function initCSVImport() {
  const btn       = document.getElementById('csvImportBtn');
  const fileInput = document.getElementById('csvImportFileInput');
  const confirmBtn = document.getElementById('csvConfirmImportBtn');
  if (!btn || !fileInput || !confirmBtn) return;

  btn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const { rows, error } = parseCSV(event.target.result);
      if (error) { showToast(error, 'error'); return; }
      if (rows.length === 0) { showToast('No data rows found in file.', 'error'); return; }
      showCSVPreview(rows.map(mapCSVRow));
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  confirmBtn.addEventListener('click', () => {
    if (csvParsedRows.length === 0) return;

    const newTransactions = csvParsedRows.map((r, index) => {
      let type = r.type;
      let from = '';
      let to   = '';

      if (type === 'transfer') {
        from = r.fromAccount;
        to   = r.toAccount;
      } else if (type === 'transfer-out') {
        type = 'transfer';
        from = r.payment;
      } else if (type === 'transfer-in') {
        type = 'transfer';
        to   = r.payment;
      }

      let transactionId = r.id;
      if (!transactionId) {
        const ts = Date.now() + index;
        transactionId = type === 'income' ? `INC-${ts}`
          : type === 'expense'            ? `EXP-${ts}-0`
          : type === 'transfer'           ? `TRF-${ts}`
          : `${type.toUpperCase()}-${ts}`;
      }

      return {
        id: transactionId,
        date: new Date(r.date).toISOString(),
        type,
        description: r.description,
        envelope: r.envelope || '',
        payment: r.payment || '',
        from, to,
        expenseType: r.expenseType,
        amount: r.amount
      };
    });

    transactions = [...transactions, ...newTransactions];
    saveToLocalStorage();

    // Navigate to the month of the first imported transaction
    const firstDate    = new Date(newTransactions[0].date);
    const importedYear = firstDate.getFullYear().toString();
    const importedMonth = `${importedYear}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`;
    yearSelect.value = importedYear;
    generateMonthDropdown();
    monthSelect.value = importedMonth;

    updateBalanceSummary();
    updateRecentTransactions();
    updatePaymentBalances();
    updateEnvelopeBudget();
    document.getElementById('csvPreviewModal').style.display = 'none';
    profileModal.classList.remove('show');
    
    const withMissingFields = csvParsedRows.filter(r => r.warnings && r.warnings.length > 0).length;
    if (withMissingFields > 0) {
      showToast(`✅ ${newTransactions.length} transactions imported! 💡 ${withMissingFields} need editing (double-click cells in Transactions tab)`, 'success');
    } else {
      showToast(`✅ ${newTransactions.length} transactions imported!`, 'success');
    }
    csvParsedRows = [];
  });
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let headerLine = -1;

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('date') && lower.includes('amount')) { headerLine = i; break; }
  }
  if (headerLine === -1) return { headers: [], rows: [], error: 'Could not find header row with Date and Amount columns.' };

  const headers = splitCSVLine(lines[headerLine]).map(h => h.trim().toLowerCase().replace(/[^a-z ]/g, ''));
  const results = [];

  for (let i = headerLine + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = splitCSVLine(line);
    if (cols.length < 2) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
    results.push(row);
  }
  return { headers, rows: results, error: null };
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

function mapCSVRow(row) {
  const get = (...keys) => {
    for (const k of keys) {
      const found = Object.keys(row).find(h => h.includes(k));
      if (found && row[found]) return row[found].trim();
    }
    return '';
  };

  const id          = get('id', 'transaction id', 'transactionid', 'trxid');
  const rawDate     = get('date');
  let type          = get('type', 'trxtype', 'transaction type').toLowerCase();
  const description = get('description', 'desc', 'note', 'narration', 'particulars');
  const category    = get('category', 'envelope', 'tag');
  const payment     = get('payment method', 'payment', 'account', 'bank', 'method', 'payment mode');
  const fromAccount = get('from account', 'from');
  const toAccount   = get('to account', 'to');
  const expenseType = get('expense type', 'expensetype', 'expense type').toLowerCase();
  const rawAmount   = get('amount', 'amt', 'debit', 'credit').replace(/[^0-9.\-]/g, '');
  const amount      = parseFloat(rawAmount);
  const errors      = [];
  const warnings    = [];

  // Parse date — support DD/MM/YYYY, DD/MM/YY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY
  let parsedDate = '';
  if (rawDate) {
    const d = rawDate.replace(/\//g, '-');
    const parts = d.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        parsedDate = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
      } else {
        // DD-MM-YYYY or DD-MM-YY
        let year = parts[2];
        if (year.length === 2) {
          // Convert 2-digit year to 4-digit (assume 20xx for years 00-50, 19xx for 51-99)
          year = parseInt(year) <= 50 ? `20${year}` : `19${year}`;
        }
        parsedDate = `${year}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      }
    }
  }

  // Infer type from amount if not provided or invalid
  if (!type || !['income','expense','transfer','transfer-in','transfer-out'].includes(type)) {
    if (amount < 0) {
      type = 'expense';
      warnings.push('Type inferred as expense (negative amount)');
    } else {
      type = 'income';
      warnings.push('Type inferred as income (positive amount)');
    }
  }

  // Critical validations only
  if (!parsedDate || isNaN(new Date(parsedDate))) errors.push('Invalid date');
  if (isNaN(amount) || amount === 0) errors.push('Invalid amount');
  if (type === 'transfer' && (!fromAccount || !toAccount)) errors.push('Transfer needs From Account and To Account columns');

  // Optional field warnings (not errors - can be assigned via UI)
  if (!description) warnings.push('Missing description');
  if (!category && type === 'expense') warnings.push('Missing envelope/category');
  if (!payment && type !== 'transfer') warnings.push('Missing payment method');

  return {
    id, date: parsedDate || rawDate, type: type || 'expense',
    description: description || 'Imported transaction',
    envelope: category, payment,
    fromAccount, toAccount,
    expenseType: ['need','want','save'].includes(expenseType) ? expenseType : '',
    amount: isNaN(amount) ? 0 : Math.abs(amount),
    errors,
    warnings
  };
}

function showCSVPreview(parsedRows) {
  const valid   = parsedRows.filter(r => r.errors.length === 0);
  const invalid = parsedRows.filter(r => r.errors.length > 0);
  const withWarnings = valid.filter(r => r.warnings && r.warnings.length > 0);

  let statsText = `✅ ${valid.length} rows ready to import`;
  if (withWarnings.length > 0) {
    statsText += `  💡 ${withWarnings.length} with missing fields (can be edited after import)`;
  }
  if (invalid.length > 0) {
    statsText += `  ⚠️ ${invalid.length} rows will be skipped`;
  }
  document.getElementById('csvPreviewStats').textContent = statsText;

  const errorsEl = document.getElementById('csvPreviewErrors');
  if (invalid.length) {
    errorsEl.style.display = 'block';
    errorsEl.innerHTML = '<strong>❌ Skipped rows (critical errors):</strong><br>' +
      invalid.slice(0, 5).map((r, i) => `Row ${i+1}: ${r.description || '(empty)'} → ${r.errors.join(', ')}`).join('<br>') +
      (invalid.length > 5 ? `<br>...and ${invalid.length - 5} more` : '');
  } else {
    errorsEl.style.display = 'none';
  }

  const typeColor = { income: '#dcfce7', expense: '#fee2e2', transfer: '#ede9fe' };
  const typeText  = { income: '#166534', expense: '#991b1b', transfer: '#5b21b6' };

  document.getElementById('csvPreviewCards').innerHTML = valid.slice(0, 10).map(r => {
    const bg = typeColor[r.type] || '#f3f4f6';
    const tc = typeText[r.type]  || '#374151';
    const hasWarnings = r.warnings && r.warnings.length > 0;
    
    return `<div style="background:${bg}; border-radius:12px; padding:12px 14px; ${hasWarnings ? 'border:2px dashed #f59e0b;' : ''} position:relative;">
      ${hasWarnings ? `<div style="position:absolute; top:8px; right:8px; background:#fef3c7; color:#92400e; font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px;">⚠️ NEEDS EDIT</div>` : ''}
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div style="flex:1; min-width:0;">
          <div style="font-size:14px; font-weight:700; color:#1f2937; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.description || '-'}</div>
          <div style="font-size:12px; color:#6b7280; margin-top:2px;">${r.date} · ${r.envelope || '❓'} · ${r.payment || '❓'}</div>
          ${hasWarnings ? `<div style="font-size:11px; color:#92400e; margin-top:4px; font-weight:600;">💡 ${r.warnings.join(', ')}</div>` : ''}
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div style="font-size:15px; font-weight:800; color:${tc};">₹${parseFloat(r.amount).toLocaleString('en-IN')}</div>
          <div style="font-size:11px; font-weight:600; color:${tc}; text-transform:uppercase;">${r.type}${r.expenseType ? ' · '+r.expenseType : ''}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  const moreEl = document.getElementById('csvMoreRows');
  if (valid.length > 10) {
    moreEl.style.display = 'block';
    moreEl.textContent = `...and ${valid.length - 10} more rows`;
  } else {
    moreEl.style.display = 'none';
  }

  csvParsedRows = valid;
  document.getElementById('csvPreviewModal').style.display = 'flex';
}

// ── CSV Report Download ──────────────────────────────────────────────────────

function downloadReport() {
  const selectedEnvelopeFilter = EnvelopeBudget.getFilter();
  const selectedMonth = monthSelect.value;
  const selectedYear  = yearSelect.value;

  let filtered = transactions;

  if (selectedMonth === 'ALL') {
    filtered = transactions.filter(t => {
      if (!t.date) return false;
      try { return new Date(t.date).getFullYear().toString() === selectedYear; } catch { return false; }
    });
  } else {
    filtered = transactions.filter(t => {
      if (!t.date) return false;
      try {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === selectedMonth;
      } catch { return false; }
    });
  }

  if (selectedEnvelopeFilter !== 'ALL') {
    filtered = filtered.filter(t => t.type === 'expense' && t.envelope === selectedEnvelopeFilter);
  }

  if (filtered.length === 0) { showToast('No transactions to export', 'error'); return; }

  const income  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
  const net     = income - expense;

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const periodLabel   = selectedMonth === 'ALL'
    ? `Year ${selectedYear}`
    : monthSelect.options[monthSelect.selectedIndex].text;
  const envelopeLabel = selectedEnvelopeFilter === 'ALL' ? 'All Categories' : selectedEnvelopeFilter;

  let csv = `Financial Report\nPeriod,${periodLabel}\nCategory,${envelopeLabel}\nGenerated,${new Date().toLocaleString('en-IN')}\n\n`;
  csv += `SUMMARY\nTotal Income,${income}\nTotal Expense,${expense}\nNet Balance,${net}\n\n`;

  if (selectedEnvelopeFilter === 'ALL') {
    csv += `EXPENSE BY CATEGORY\n`;
    const breakdown = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      const env = t.envelope || 'Uncategorized';
      breakdown[env] = (breakdown[env] || 0) + parseFloat(t.amount);
    });
    Object.entries(breakdown).sort((a, b) => b[1] - a[1]).forEach(([env, amt]) => { csv += `${env},${amt}\n`; });
    csv += `\n`;
  }

  csv += `BALANCE BY PAYMENT METHOD\n`;
  paymentMethods.forEach(method => {
    let bal = 0;
    filtered.forEach(t => {
      if (t.type === 'income'   && t.payment === method) bal += parseFloat(t.amount);
      else if (t.type === 'expense'  && t.payment === method) bal -= parseFloat(t.amount);
      else if (t.type === 'transfer') {
        if (t.from === method) bal -= parseFloat(t.amount);
        if (t.to   === method) bal += parseFloat(t.amount);
      }
    });
    csv += `${method},${bal}\n`;
  });
  csv += `\n`;

  csv += `TRANSACTION DETAILS\nID,Date,Type,Description,Category,Payment Method,Expense Type,Amount\n`;
  sorted.forEach(t => {
    const date = new Date(t.date).toLocaleString('en-IN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    const type = t.type.charAt(0).toUpperCase() + t.type.slice(1);
    const desc = (t.description || 'Transfer').replace(/,/g, ';');
    const cat  = t.envelope || (t.type === 'transfer' ? `${t.from} → ${t.to}` : '-');
    const pay  = t.payment  || (t.type === 'transfer' ? 'Transfer' : '-');
    const exp  = t.expenseType ? (t.expenseType.charAt(0).toUpperCase() + t.expenseType.slice(1)) : '-';
    csv += `${t.id || 'N/A'},${date},${type},${desc},${cat},${pay},${exp},${parseFloat(t.amount)}\n`;
  });

  const filename = `financial-report-${periodLabel.replace(/\s+/g,'-')}-${envelopeLabel.replace(/\s+/g,'-')}-${new Date().toISOString().split('T')[0]}.csv`;
  _triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
  showToast(`Report downloaded: ${sorted.length} transactions 📊`, 'success');
}

// ── Internal helper ──────────────────────────────────────────────────────────

function _triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initExportData();
  initImportData();
  initCSVImport();
});
