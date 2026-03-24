/**
 * nws.js — Need / Want / Save module
 *
 * Responsibilities:
 *  1. updateNWSSummary(filteredTransactions) — compute totals & update the bar UI
 *  2. openNWSModal(type)                     — open the drill-down modal
 *
 * Depends on: DOM elements in index.html, localStorage key 'transactions'
 */

(function () {

  const CONFIG = {
    need: { label: 'Need', icon: '🎯', accent: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
    want: { label: 'Want', icon: '🎉', accent: '#f43f5e', bg: '#fff1f2', border: '#fecdd3' },
    save: { label: 'Save', icon: '💰', accent: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  };

  // ── Bar update ────────────────────────────────────────────────

  /**
   * Called from updateEnvelopeBudget() with the already-filtered transaction list.
   * @param {Array} filteredTransactions
   */
  function updateNWSSummary(filteredTransactions) {
    let needTotal = 0, wantTotal = 0, saveTotal = 0;

    // Get envelopes with categories
    const envelopes = (() => { 
      try { 
        const envs = JSON.parse(localStorage.getItem('envelopes') || '[]');
        // Handle old format (array of strings)
        if (envs.length > 0 && typeof envs[0] === 'string') {
          return envs.map(name => ({ name, category: 'need' }));
        }
        return envs;
      } catch { return []; }
    })();
    
    const getEnvelopeCategory = (envelopeName) => {
      const env = envelopes.find(e => e.name === envelopeName);
      return env ? env.category : 'need';
    };

    filteredTransactions.forEach(t => {
      if (t.type === 'expense' && t.envelope) {
        const amount = parseFloat(t.amount || 0);
        const category = getEnvelopeCategory(t.envelope);
        if      (category === 'need') needTotal += amount;
        else if (category === 'want') wantTotal += amount;
        else if (category === 'save') saveTotal += amount;
      }
    });

    const grand = needTotal + wantTotal + saveTotal;
    const pct   = v => grand > 0 ? Math.round((v / grand) * 100) : 0;
    const needP = pct(needTotal), wantP = pct(wantTotal), saveP = pct(saveTotal);

    _set('needTotalTop', `₹${needTotal.toLocaleString('en-IN')}`);
    _set('wantTotalTop', `₹${wantTotal.toLocaleString('en-IN')}`);
    _set('saveTotalTop', `₹${saveTotal.toLocaleString('en-IN')}`);
    _set('needPct', `${needP}%`);
    _set('wantPct', `${wantP}%`);
    _set('savePct', `${saveP}%`);
    
    // Update compact view
    _set('needPctCompact', `${needP}%`);
    _set('wantPctCompact', `${wantP}%`);
    _set('savePctCompact', `${saveP}%`);
    
    // Update inline view (sticky header)
    _set('needPctInline', `${needP}%`);
    _set('wantPctInline', `${wantP}%`);
    _set('savePctInline', `${saveP}%`);
    
    _width('needBar', needP);
    _width('wantBar', wantP);
    _width('saveBar', saveP);
  }

  function _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _width(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${pct}%`;
  }

  // ── Modal ─────────────────────────────────────────────────────

  function openNWSModal(type) {
    const cfg = CONFIG[type];
    const selectedMonth = (document.getElementById('monthSelect') || {}).value || 'ALL';
    const selectedYear  = (document.getElementById('yearSelect')  || {}).value || String(new Date().getFullYear());

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

    const txs = (JSON.parse(localStorage.getItem('transactions') || '[]'))
      .filter(t => {
        if (t.type !== 'expense' || !t.envelope || !t.date) return false;
        const category = getEnvelopeCategory(t.envelope);
        if (category !== type) return false;
        try {
          const d = new Date(t.date);
          if (selectedMonth === 'ALL') return d.getFullYear().toString() === selectedYear;
          const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return ym === selectedMonth;
        } catch { return false; }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = txs.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    // Title
    document.getElementById('nwsModalTitle').innerHTML = `${cfg.icon} ${cfg.label} Transactions`;

    // Summary pill
    const summaryEl = document.getElementById('nwsModalSummary');
    summaryEl.style.background = cfg.bg;
    summaryEl.style.border     = `1.5px solid ${cfg.border}`;
    summaryEl.innerHTML = `
      <span style="color:${cfg.accent};flex:1;">${txs.length} transaction${txs.length !== 1 ? 's' : ''}</span>
      <span style="color:${cfg.accent};font-size:14px;font-weight:800;">₹${total.toLocaleString('en-IN')}</span>`;

    // List
    const list = document.getElementById('nwsModalList');
    if (txs.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:32px 0;color:#9ca3af;font-size:13px;">No ${cfg.label.toLowerCase()} transactions for this period</div>`;
    } else {
      list.innerHTML = txs.map(t => {
        const date     = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const envelope = t.envelope      ? `<span style="background:#f3f4f6;color:#6b7280;font-size:10px;padding:2px 6px;border-radius:99px;">${t.envelope}</span>`      : '';
        const payment  = t.paymentMethod ? `<span style="background:#f3f4f6;color:#6b7280;font-size:10px;padding:2px 6px;border-radius:99px;">${t.paymentMethod}</span>` : '';
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f3f4f6;">
            <div style="width:36px;height:36px;border-radius:10px;background:${cfg.bg};border:1.5px solid ${cfg.border};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${cfg.icon}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.description || 'Expense'}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px;align-items:center;">
                <span style="font-size:10px;color:#9ca3af;">${date}</span>${envelope}${payment}
              </div>
            </div>
            <div style="font-size:14px;font-weight:800;color:${cfg.accent};flex-shrink:0;">-₹${parseFloat(t.amount).toLocaleString('en-IN')}</div>
          </div>`;
      }).join('');
    }

    document.getElementById('nwsModal').classList.add('show');
  }

  // ── Init (wire close buttons) ─────────────────────────────────

  function init() {
    const modal     = document.getElementById('nwsModal');
    const closeBtn  = document.getElementById('closeNwsModal');
    if (!modal || !closeBtn) return;
    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
  }

  // ── Public API ────────────────────────────────────────────────

  window.NWS = { updateNWSSummary, openNWSModal, init };

})();
