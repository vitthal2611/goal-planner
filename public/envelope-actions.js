/**
 * envelope-actions.js
 * Quick-action context menu for envelope cards.
 * Triggered by: long-press (mobile), swipe-left, or right-click (desktop).
 *
 * Actions:
 *   ➕ Add Expense  → EnvelopeBottomSheet
 *   👁 View Details → detail bottom sheet (budget summary + NWS breakdown)
 *   📊 View History → transaction list bottom sheet filtered by envelope
 *
 * Exposes: window.EnvelopeActions
 */

(function () {
  'use strict';

  // ── Helpers ───────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }
  function fromStorage(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }
  function fmt(n) { return `₹${Math.abs(parseFloat(n || 0)).toLocaleString('en-IN')}`; }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }); }
    catch { return ''; }
  }

  // ── Active strip tracker ──────────────────────────────────────
  let activeCard = null;

  function stripId(name) {
    return 'eas-' + name.replace(/\s+/g, '_');
  }

  // ── Show / hide action strip ──────────────────────────────────

  function show(envelopeName, cardEl) {
    // Close any open strip first
    if (activeCard && activeCard !== cardEl) hide();

    const strip = cardEl.querySelector('.env-action-strip');
    if (!strip) return;

    strip.classList.toggle('env-action-strip--open');
    activeCard = strip.classList.contains('env-action-strip--open') ? cardEl : null;
  }

  function hide() {
    document.querySelectorAll('.env-action-strip--open').forEach(s => s.classList.remove('env-action-strip--open'));
    activeCard = null;
  }

  // ── Actions ───────────────────────────────────────────────────

  function addExpense(name) {
    hide();
    if (typeof EnvelopeBottomSheet !== 'undefined') EnvelopeBottomSheet.open('expense', name);
  }

  function viewDetails(name) {
    hide();
    _openDetailSheet(name);
  }

  function viewHistory(name) {
    hide();
    _openHistorySheet(name);
  }

  // ── Detail Sheet ──────────────────────────────────────────────

  function _openDetailSheet(name) {
    const transactions = fromStorage('transactions');
    const budgets      = fromStorage('budgets');

    const monthEl = el('monthSelect');
    const yearEl  = el('yearSelect');
    const ym   = monthEl ? monthEl.value : 'ALL';
    const year = yearEl  ? yearEl.value  : String(new Date().getFullYear());

    const txs = transactions.filter(t => {
      if (t.type !== 'expense' || t.envelope !== name || !t.date) return false;
      try {
        const d = new Date(t.date);
        if (ym === 'ALL') return d.getFullYear().toString() === year;
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === ym;
      } catch { return false; }
    });

    let budgetAmt = 0;
    if (ym === 'ALL') {
      budgetAmt = budgets
        .filter(b => b.envelope === name && b.month.startsWith(year))
        .reduce((s, b) => s + parseFloat(b.amount || 0), 0);
    } else {
      const b = budgets.find(b => b.envelope === name && b.month === ym);
      budgetAmt = b ? parseFloat(b.amount) : 0;
    }

    let total = 0, need = 0, want = 0, save = 0;
    txs.forEach(t => {
      const a = parseFloat(t.amount || 0);
      total += a;
      if (t.expenseType === 'need') need += a;
      else if (t.expenseType === 'want') want += a;
      else if (t.expenseType === 'save') save += a;
    });

    const pct = budgetAmt > 0 ? Math.round((total / budgetAmt) * 100) : 0;
    const remaining = budgetAmt - total;
    const barColor = pct >= 100 ? '#ef4444' : pct >= 90 ? '#f59e0b' : '#22c55e';

    // NWS bars
    const nwsMax = Math.max(need, want, save, 1);
    function nwsBar(label, icon, val, color) {
      if (val <= 0) return '';
      const w = Math.round((val / nwsMax) * 100);
      return `
        <div class="ea-nws-row">
          <span class="ea-nws-label">${icon} ${label}</span>
          <div class="ea-nws-track"><div class="ea-nws-fill" style="width:${w}%;background:${color}"></div></div>
          <span class="ea-nws-val">${fmt(val)}</span>
        </div>`;
    }

    // Payment breakdown
    const byPM = {};
    txs.forEach(t => {
      const k = t.payment || 'Unknown';
      byPM[k] = (byPM[k] || 0) + parseFloat(t.amount || 0);
    });
    const pmMax = Math.max(...Object.values(byPM), 1);
    const pmBars = Object.entries(byPM)
      .sort((a, b) => b[1] - a[1])
      .map(([pm, amt]) => {
        const w = Math.round((amt / pmMax) * 100);
        return `
          <div class="ea-nws-row">
            <span class="ea-nws-label">${pm}</span>
            <div class="ea-nws-track"><div class="ea-nws-fill" style="width:${w}%;background:#6366f1"></div></div>
            <span class="ea-nws-val">${fmt(amt)}</span>
          </div>`;
      }).join('');

    const html = `
      <div class="ea-sheet-header">
        <div class="ea-sheet-title">👁 ${name}</div>
        <button class="ea-sheet-close" onclick="EnvelopeActions._closeInfoSheet()">×</button>
      </div>

      <div class="ea-stat-row">
        <div class="ea-stat"><div class="ea-stat-val">${fmt(total)}</div><div class="ea-stat-lbl">Spent</div></div>
        <div class="ea-stat"><div class="ea-stat-val">${fmt(budgetAmt)}</div><div class="ea-stat-lbl">Budget</div></div>
        <div class="ea-stat" style="color:${remaining >= 0 ? '#059669' : '#dc2626'}">
          <div class="ea-stat-val">${remaining >= 0 ? fmt(remaining) : '-'+fmt(remaining)}</div>
          <div class="ea-stat-lbl">${remaining >= 0 ? 'Left' : 'Over'}</div>
        </div>
      </div>

      <div class="ea-budget-bar-wrap">
        <div class="ea-budget-bar-track">
          <div class="ea-budget-bar-fill" style="width:${Math.min(pct,100)}%;background:${barColor}"></div>
        </div>
        <span class="ea-budget-pct" style="color:${barColor}">${pct}% used</span>
      </div>

      ${(need + want + save) > 0 ? `
        <div class="ea-section-label">Need · Want · Save</div>
        ${nwsBar('Need', '🎯', need, '#6366f1')}
        ${nwsBar('Want', '🎉', want, '#f43f5e')}
        ${nwsBar('Save', '💰', save, '#10b981')}
      ` : ''}

      ${Object.keys(byPM).length > 0 ? `
        <div class="ea-section-label">By Payment Method</div>
        ${pmBars}
      ` : ''}

      <div class="ea-sheet-actions">
        <button class="ea-action-btn ea-action-add" onclick="EnvelopeActions._closeInfoSheet();EnvelopeActions.addExpense('${name.replace(/'/g,"\\'")}')">➕ Add Expense</button>
        <button class="ea-action-btn ea-action-hist" onclick="EnvelopeActions._closeInfoSheet();EnvelopeActions.viewHistory('${name.replace(/'/g,"\\'")}')">📊 History</button>
      </div>
    `;

    _openInfoSheet(html);
  }

  // ── History Sheet ─────────────────────────────────────────────

  function _openHistorySheet(name) {
    const transactions = fromStorage('transactions');

    const monthEl = el('monthSelect');
    const yearEl  = el('yearSelect');
    const ym   = monthEl ? monthEl.value : 'ALL';
    const year = yearEl  ? yearEl.value  : String(new Date().getFullYear());

    const txs = transactions
      .filter(t => {
        if (t.type !== 'expense' || t.envelope !== name || !t.date) return false;
        try {
          const d = new Date(t.date);
          if (ym === 'ALL') return d.getFullYear().toString() === year;
          return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === ym;
        } catch { return false; }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = txs.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    const nwsColor = { need: '#6366f1', want: '#f43f5e', save: '#10b981' };
    const nwsIcon  = { need: '🎯', want: '🎉', save: '💰' };

    const rows = txs.length === 0
      ? `<div class="ea-empty">No transactions for this period</div>`
      : txs.map(t => {
          const color = nwsColor[t.expenseType] || '#6b7280';
          const icon  = nwsIcon[t.expenseType]  || '📁';
          const tags  = [
            t.payment     ? `<span class="ea-tag">${t.payment}</span>` : '',
            t.expenseType ? `<span class="ea-tag" style="color:${color}">${icon} ${t.expenseType}</span>` : '',
          ].join('');
          return `
            <div class="ea-tx-row">
              <div class="ea-tx-icon" style="background:${color}20;color:${color}">${icon}</div>
              <div class="ea-tx-body">
                <div class="ea-tx-desc">${t.description || name}</div>
                <div class="ea-tx-meta"><span>${fmtDate(t.date)}</span>${tags}</div>
              </div>
              <div class="ea-tx-amt" style="color:#dc2626">-${fmt(t.amount)}</div>
            </div>`;
        }).join('');

    const html = `
      <div class="ea-sheet-header">
        <div class="ea-sheet-title">📊 ${name}</div>
        <button class="ea-sheet-close" onclick="EnvelopeActions._closeInfoSheet()">×</button>
      </div>
      <div class="ea-history-summary">
        <span>${txs.length} transaction${txs.length !== 1 ? 's' : ''}</span>
        <span style="font-weight:800">${fmt(total)}</span>
      </div>
      <div class="ea-tx-list">${rows}</div>
      <div class="ea-sheet-actions">
        <button class="ea-action-btn ea-action-add" onclick="EnvelopeActions._closeInfoSheet();EnvelopeActions.addExpense('${name.replace(/'/g,"\\'")}')">➕ Add Expense</button>
      </div>
    `;

    _openInfoSheet(html);
  }

  // ── Info sheet (shared bottom sheet) ─────────────────────────

  function _openInfoSheet(html) {
    let sheet = el('envelopeInfoSheet');
    let bd    = el('envelopeInfoBackdrop');

    if (!sheet) {
      bd = document.createElement('div');
      bd.id = 'envelopeInfoBackdrop';
      bd.className = 'ea-backdrop';
      bd.addEventListener('click', _closeInfoSheet);

      sheet = document.createElement('div');
      sheet.id = 'envelopeInfoSheet';
      sheet.className = 'ea-sheet';

      document.body.appendChild(bd);
      document.body.appendChild(sheet);
    }

    sheet.innerHTML = `<div class="ea-sheet-inner">${html}</div>`;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      bd.classList.add('ea-backdrop--visible');
      sheet.classList.add('ea-sheet--open');
    });
  }

  function _closeInfoSheet() {
    const sheet = el('envelopeInfoSheet');
    const bd    = el('envelopeInfoBackdrop');
    if (!sheet) return;
    sheet.classList.remove('ea-sheet--open');
    if (bd) bd.classList.remove('ea-backdrop--visible');
    document.body.style.overflow = '';
  }

  // ── Long-press + swipe wiring ─────────────────────────────────

  function _wireCard(card) {
    let pressTimer = null;
    let touchStartX = 0;

    // Long press
    card.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      pressTimer = setTimeout(() => {
        const name = card.dataset.envelope;
        if (name) show(name, card);
      }, 500);
    }, { passive: true });

    card.addEventListener('touchend', () => clearTimeout(pressTimer));
    card.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - touchStartX;
      // Swipe left → show actions
      if (dx < -40) {
        clearTimeout(pressTimer);
        const name = card.dataset.envelope;
        if (name) show(name, card);
      } else if (dx > 40) {
        clearTimeout(pressTimer);
        hide();
      }
    }, { passive: true });
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    // Close strip when tapping outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.envelope-item')) hide();
    });

    // Wire existing cards + observe future renders
    function wireAll() {
      document.querySelectorAll('.envelope-item[data-envelope]').forEach(card => {
        if (!card._eaWired) { _wireCard(card); card._eaWired = true; }
      });
    }

    wireAll();
    const obs = new MutationObserver(wireAll);
    const list = el('envelopeBudgetList');
    if (list) obs.observe(list, { childList: true, subtree: true });
  }

  window.EnvelopeActions = { init, show, hide, addExpense, viewDetails, viewHistory, _closeInfoSheet };

})();
