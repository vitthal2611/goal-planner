/**
 * drill-down.js — Unified drill-down modal for NWS categories and payment methods.
 *
 * Public API:
 *   DrillDown.openNWS(type)        — 'need' | 'want' | 'save'
 *   DrillDown.openPayment(method)  — payment method name string
 *   DrillDown.init()               — wire close handlers
 */

(function () {

  const NWS_CFG = {
    need: { label: 'Need',  icon: '🎯', accent: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
    want: { label: 'Want',  icon: '🎉', accent: '#f43f5e', bg: '#fff1f2', border: '#fecdd3' },
    save: { label: 'Save',  icon: '💰', accent: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  };

  function el(id) { return document.getElementById(id); }

  function currentYM() {
    return (el('monthSelect') || {}).value || 'ALL';
  }

  function currentYear() {
    return (el('yearSelect') || {}).value || String(new Date().getFullYear());
  }

  function filterTx(predicate) {
    const ym   = currentYM();
    const year = currentYear();
    const all  = (typeof transactions !== 'undefined') ? transactions : [];
    return all.filter(t => {
      if (!t.date || !predicate(t)) return false;
      try {
        const d = new Date(t.date);
        if (ym === 'ALL') return d.getFullYear().toString() === year;
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === ym;
      } catch { return false; }
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function fmt(n)   { return `₹${Math.abs(parseFloat(n)).toLocaleString('en-IN')}`; }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  // ── Shared modal open ─────────────────────────────────────────

  function open(title, accentColor, bg, border, summaryHTML, bodyHTML) {
    el('ddTitle').textContent   = title;
    el('ddSummary').style.background = bg;
    el('ddSummary').style.border     = `1.5px solid ${border}`;
    el('ddSummary').style.color      = accentColor;
    el('ddSummary').innerHTML        = summaryHTML;
    el('ddBody').innerHTML           = bodyHTML;
    el('drillModal').classList.add('show');
  }

  function close() {
    el('drillModal').classList.remove('show');
  }

  // ── Transaction list renderer ─────────────────────────────────

  function txRow(t, iconHTML, accentColor, amtPrefix) {
    const date = fmtDate(t.date);
    const tags = [
      t.envelope      ? `<span class="dd-tag">${t.envelope}</span>`      : '',
      t.payment       ? `<span class="dd-tag">${t.payment}</span>`       : '',
      t.expenseType   ? `<span class="dd-tag">${t.expenseType}</span>`   : '',
    ].join('');
    return `
      <div class="dd-row">
        <div class="dd-row-icon">${iconHTML}</div>
        <div class="dd-row-body">
          <div class="dd-row-desc">${t.description || (t.type === 'income' ? 'Income' : 'Expense')}</div>
          <div class="dd-row-meta"><span class="dd-date">${date}</span>${tags}</div>
        </div>
        <div class="dd-row-amt" style="color:${accentColor}">${amtPrefix}${fmt(t.amount)}</div>
      </div>`;
  }

  // ── Breakdown bar (group totals) ──────────────────────────────

  function breakdownBars(groups, accentColor) {
    const max = Math.max(...Object.values(groups), 1);
    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .map(([label, total]) => {
        const pct = Math.round((total / max) * 100);
        return `
          <div class="dd-bar-row">
            <span class="dd-bar-label">${label}</span>
            <div class="dd-bar-track">
              <div class="dd-bar-fill" style="width:${pct}%;background:${accentColor}"></div>
            </div>
            <span class="dd-bar-val">${fmt(total)}</span>
          </div>`;
      }).join('');
  }

  // ── NWS drill-down ────────────────────────────────────────────

  function openNWS(type) {
    const cfg  = NWS_CFG[type];
    const txs  = filterTx(t => t.type === 'expense' && t.expenseType === type);
    const total = txs.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    // Breakdown by envelope
    const byEnvelope = {};
    txs.forEach(t => {
      const key = t.envelope || 'Uncategorised';
      byEnvelope[key] = (byEnvelope[key] || 0) + parseFloat(t.amount || 0);
    });

    const summaryHTML = `
      <span style="flex:1">${txs.length} transaction${txs.length !== 1 ? 's' : ''}</span>
      <span style="font-size:15px;font-weight:900">${fmt(total)}</span>`;

    const barsHTML = Object.keys(byEnvelope).length > 1
      ? `<div class="dd-section-label">By Envelope</div>
         <div class="dd-bars">${breakdownBars(byEnvelope, cfg.accent)}</div>`
      : '';

    const listHTML = txs.length === 0
      ? `<div class="dd-empty">No ${cfg.label.toLowerCase()} transactions this period</div>`
      : txs.map(t => txRow(t,
          `<span style="font-size:16px">${cfg.icon}</span>`,
          cfg.accent, '-')).join('');

    open(
      `${cfg.icon} ${cfg.label}`,
      cfg.accent, cfg.bg, cfg.border,
      summaryHTML,
      `${barsHTML}<div class="dd-section-label">Transactions</div>${listHTML}`
    );
  }

  // ── Payment method drill-down ─────────────────────────────────

  function openPayment(method) {
    const txs = filterTx(t =>
      t.payment === method || t.from === method || t.to === method
    );

    let totalIn = 0, totalOut = 0;
    txs.forEach(t => {
      const amt = parseFloat(t.amount || 0);
      if (t.type === 'income')                          totalIn  += amt;
      if (t.type === 'expense')                         totalOut += amt;
      if (t.type === 'transfer' && t.to   === method)   totalIn  += amt;
      if (t.type === 'transfer' && t.from === method)   totalOut += amt;
    });
    const net = totalIn - totalOut;

    // Breakdown by envelope (expenses only)
    const byEnvelope = {};
    txs.filter(t => t.type === 'expense').forEach(t => {
      const key = t.envelope || 'Uncategorised';
      byEnvelope[key] = (byEnvelope[key] || 0) + parseFloat(t.amount || 0);
    });

    const accent = net >= 0 ? '#059669' : '#dc2626';
    const bg     = net >= 0 ? '#f0fdf4' : '#fff1f2';
    const border = net >= 0 ? '#bbf7d0' : '#fecdd3';

    const summaryHTML = `
      <div style="display:flex;gap:16px;width:100%">
        <div style="flex:1;text-align:center">
          <div style="font-size:10px;font-weight:700;opacity:.7;margin-bottom:2px">IN</div>
          <div style="font-size:14px;font-weight:800;color:#059669">+${fmt(totalIn)}</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="font-size:10px;font-weight:700;opacity:.7;margin-bottom:2px">OUT</div>
          <div style="font-size:14px;font-weight:800;color:#dc2626">-${fmt(totalOut)}</div>
        </div>
        <div style="flex:1;text-align:center">
          <div style="font-size:10px;font-weight:700;opacity:.7;margin-bottom:2px">NET</div>
          <div style="font-size:14px;font-weight:800;color:${accent}">${net >= 0 ? '+' : '-'}${fmt(net)}</div>
        </div>
      </div>`;

    const barsHTML = Object.keys(byEnvelope).length > 0
      ? `<div class="dd-section-label">Spending by Envelope</div>
         <div class="dd-bars">${breakdownBars(byEnvelope, '#6366f1')}</div>`
      : '';

    const listHTML = txs.length === 0
      ? `<div class="dd-empty">No transactions for ${method} this period</div>`
      : txs.map(t => {
          const isIn  = t.type === 'income' || (t.type === 'transfer' && t.to === method);
          const color = isIn ? '#059669' : '#dc2626';
          const prefix = isIn ? '+' : '-';
          const icon  = t.type === 'income' ? '↓' : t.type === 'transfer' ? '⇄' : '↑';
          return txRow(t,
            `<span style="font-size:14px;font-weight:800;color:${color}">${icon}</span>`,
            color, prefix);
        }).join('');

    open(
      method,
      accent, bg, border,
      summaryHTML,
      `${barsHTML}<div class="dd-section-label">Transactions</div>${listHTML}`
    );
  }

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    const modal    = el('drillModal');
    const closeBtn = el('closeDrillModal');
    if (!modal || !closeBtn) return;
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
  }

  window.DrillDown = { openNWS, openPayment, init };

})();
