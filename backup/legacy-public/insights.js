/**
 * insights.js — Smart financial insights module
 *
 * Generates contextual insights by comparing current period vs previous period.
 * Depends on globals: transactions, monthSelect, yearSelect
 */

(function () {

  function el(id) { return document.getElementById(id); }

  // ── Period helpers ────────────────────────────────────────────

  function filterPeriod(allTx, ym) {
    // ym = "YYYY-MM" or "ALL"
    if (!ym || ym === 'ALL') return allTx.filter(t => t.date);
    return allTx.filter(t => {
      if (!t.date) return false;
      try {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === ym;
      } catch { return false; }
    });
  }

  function prevYM(ym) {
    if (!ym || ym === 'ALL') return null;
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  function sumBy(txs, predicate) {
    return txs.filter(predicate).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  }

  function pctChange(curr, prev) {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }

  function fmt(n) { return `₹${Math.round(n).toLocaleString('en-IN')}`; }

  // ── Insight generators ────────────────────────────────────────

  function generateInsights(allTx, currentYM) {
    const insights = [];
    const curr = filterPeriod(allTx, currentYM);
    const prev = currentYM !== 'ALL' ? filterPeriod(allTx, prevYM(currentYM)) : [];

    const currExpenses = curr.filter(t => t.type === 'expense');
    const prevExpenses = prev.filter(t => t.type === 'expense');

    const currIncome  = sumBy(curr, t => t.type === 'income');
    const prevIncome  = sumBy(prev, t => t.type === 'income');
    const currTotal   = sumBy(curr, t => t.type === 'expense');
    const prevTotal   = sumBy(prev, t => t.type === 'expense');
    const currNet     = currIncome - currTotal;
    const prevNet     = prevIncome - prevTotal;

    // 1. Top expense envelope
    const envelopeTotals = {};
    currExpenses.forEach(t => {
      if (t.envelope) envelopeTotals[t.envelope] = (envelopeTotals[t.envelope] || 0) + parseFloat(t.amount || 0);
    });
    const topEnvelope = Object.entries(envelopeTotals).sort((a, b) => b[1] - a[1])[0];
    if (topEnvelope) {
      insights.push({
        icon: '🏆', type: 'info',
        text: `Top expense: <em>${topEnvelope[0]}</em> at <em>${fmt(topEnvelope[1])}</em>`,
        sub: `${Math.round((topEnvelope[1] / (currTotal || 1)) * 100)}% of total spending`,
      });
    }

    // 2. NWS category changes vs last month
    ['need', 'want', 'save'].forEach(cat => {
      const c = sumBy(currExpenses, t => t.expenseType === cat);
      const p = sumBy(prevExpenses, t => t.expenseType === cat);
      const chg = pctChange(c, p);
      if (chg === null || Math.abs(chg) < 10 || c === 0) return;
      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      const up = chg > 0;
      const icons = { need: '🎯', want: '🎉', save: '💰' };
      insights.push({
        icon: icons[cat],
        type: up ? (cat === 'save' ? 'good' : 'warn') : (cat === 'save' ? 'danger' : 'good'),
        text: `<em>${label}</em> spending ${up ? 'up' : 'down'} <em>${Math.abs(chg)}%</em> vs last month`,
        sub: `${fmt(p)} → ${fmt(c)}`,
      });
    });

    // 3. Overspending vs income
    if (currIncome > 0 && currTotal > currIncome) {
      const over = currTotal - currIncome;
      insights.push({
        icon: '⚠️', type: 'danger',
        text: `Spending exceeds income by <em>${fmt(over)}</em>`,
        sub: `Income ${fmt(currIncome)} · Expenses ${fmt(currTotal)}`,
      });
    }

    // 4. Savings rate
    if (currIncome > 0 && currNet > 0) {
      const rate = Math.round((currNet / currIncome) * 100);
      if (rate >= 20) {
        insights.push({
          icon: '🎯', type: 'good',
          text: `Saving <em>${rate}%</em> of income this month`,
          sub: `${fmt(currNet)} saved out of ${fmt(currIncome)}`,
        });
      }
    }

    // 5. Most used payment method (by transaction count)
    const pmCount = {};
    currExpenses.forEach(t => {
      if (t.payment) pmCount[t.payment] = (pmCount[t.payment] || 0) + 1;
    });
    const topPM = Object.entries(pmCount).sort((a, b) => b[1] - a[1])[0];
    if (topPM && topPM[1] >= 3) {
      insights.push({
        icon: '💳', type: 'info',
        text: `Most used: <em>${topPM[0]}</em>`,
        sub: `${topPM[1]} transactions this period`,
      });
    }

    // 6. No transactions yet
    if (curr.length === 0) {
      return [];
    }

    return insights.slice(0, 5); // cap at 5
  }

  // ── Render ────────────────────────────────────────────────────

  function update() {
    const wrapper = el('insightsList');
    if (!wrapper) return;

    const monthSelect = el('monthSelect');
    const currentYM   = monthSelect ? monthSelect.value : 'ALL';
    const allTx       = (typeof transactions !== 'undefined') ? transactions : [];

    // Update period label
    const periodEl = el('insightsPeriod');
    if (periodEl) {
      if (currentYM === 'ALL') {
        periodEl.textContent = 'All time';
      } else {
        const [y, m] = currentYM.split('-').map(Number);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        periodEl.textContent = `${months[m-1]} ${y}`;
      }
    }

    const items = generateInsights(allTx, currentYM);

    if (items.length === 0) {
      wrapper.innerHTML = '<div class="insights-empty">No insights yet — add some transactions first.</div>';
      return;
    }

    wrapper.innerHTML = items.map(i => `
      <div class="insight-item">
        <div class="insight-icon ${i.type}">${i.icon}</div>
        <div class="insight-body">
          <div class="insight-text">${i.text}</div>
          ${i.sub ? `<div class="insight-sub">${i.sub}</div>` : ''}
        </div>
      </div>`).join('');
  }

  function init() { /* wired externally */ }

  window.Insights = { update, init };

})();
