// Updated updateEnvelopeBudget function with Need, Want, Save tracking
function updateEnvelopeBudget() {
  const container = document.getElementById('envelopeBudgetList');
  if (!container) return;
  const selectedMonth = monthSelect.value;
  const selectedYear = yearSelect.value;
  
  // Calculate Need, Want, Save totals
  let needTotal = 0;
  let wantTotal = 0;
  let saveTotal = 0;
  
  // Filter transactions by selected month/year
  let filteredTransactions = transactions;
  
  if (selectedMonth === 'ALL') {
    filteredTransactions = transactions.filter(t => {
      if (!t.date) return false;
      try {
        const transactionYear = new Date(t.date).getFullYear().toString();
        return transactionYear === selectedYear;
      } catch (e) {
        return false;
      }
    });
  } else {
    filteredTransactions = transactions.filter(t => {
      if (!t.date) return false;
      try {
        const date = new Date(t.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const transactionMonth = `${year}-${month}`;
        return transactionMonth === selectedMonth;
      } catch (e) {
        return false;
      }
    });
  }
  
  // Calculate totals by expense type
  filteredTransactions.forEach(t => {
    if (t.type === 'expense' && t.expenseType) {
      const amount = parseFloat(t.amount || 0);
      if (t.expenseType === 'need') needTotal += amount;
      else if (t.expenseType === 'want') wantTotal += amount;
      else if (t.expenseType === 'save') saveTotal += amount;
    }
  });
  
  // Update Need, Want, Save display
  const needTotalEl = document.getElementById('needTotal');
  const wantTotalEl = document.getElementById('wantTotal');
  const saveTotalEl = document.getElementById('saveTotal');
  
  if (needTotalEl) needTotalEl.textContent = `₹${needTotal.toLocaleString('en-IN')}`;
  if (wantTotalEl) wantTotalEl.textContent = `₹${wantTotal.toLocaleString('en-IN')}`;
  if (saveTotalEl) saveTotalEl.textContent = `₹${saveTotal.toLocaleString('en-IN')}`;
  
  if (envelopes.length === 0) {
    container.innerHTML = '<div style="padding: 16px; text-align: center; color: #6b7280;">No envelopes available.</div>';
    return;
  }
  
  container.innerHTML = envelopes.map(envelope => {
    let budgetAmount = 0;
    let actualSpent = 0;
    let needSpent = 0;
    let wantSpent = 0;
    let saveSpent = 0;
    
    if (selectedMonth === 'ALL') {
      budgetAmount = budgets
        .filter(b => b.envelope === envelope && b.month.startsWith(selectedYear))
        .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
      
      const envelopeTransactions = transactions.filter(t => {
        if (t.type !== 'expense' || t.envelope !== envelope) return false;
        if (!t.date) return false;
        
        try {
          const transactionYear = new Date(t.date).getFullYear().toString();
          return transactionYear === selectedYear;
        } catch (e) {
          return false;
        }
      });
      
      envelopeTransactions.forEach(t => {
        const amount = parseFloat(t.amount || 0);
        actualSpent += amount;
        if (t.expenseType === 'need') needSpent += amount;
        else if (t.expenseType === 'want') wantSpent += amount;
        else if (t.expenseType === 'save') saveSpent += amount;
      });
    } else {
      const budget = budgets.find(b => b.envelope === envelope && b.month === selectedMonth);
      budgetAmount = budget ? parseFloat(budget.amount) : 0;
      
      const envelopeTransactions = transactions.filter(t => {
        if (t.type !== 'expense' || t.envelope !== envelope) return false;
        if (!t.date) return false;
        
        try {
          const date = new Date(t.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const transactionMonth = `${year}-${month}`;
          return transactionMonth === selectedMonth;
        } catch (e) {
          return false;
        }
      });
      
      envelopeTransactions.forEach(t => {
        const amount = parseFloat(t.amount || 0);
        actualSpent += amount;
        if (t.expenseType === 'need') needSpent += amount;
        else if (t.expenseType === 'want') wantSpent += amount;
        else if (t.expenseType === 'save') saveSpent += amount;
      });
    }
    
    const percentage = budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0;
    let color = '#22c55e';
    if (percentage >= 100) color = '#ef4444';
    else if (percentage >= 90) color = '#f59e0b';
    
    // Build breakdown text
    let breakdownParts = [];
    if (needSpent > 0) breakdownParts.push(`🎯 ₹${needSpent.toLocaleString('en-IN')}`);
    if (wantSpent > 0) breakdownParts.push(`🎉 ₹${wantSpent.toLocaleString('en-IN')}`);
    if (saveSpent > 0) breakdownParts.push(`💰 ₹${saveSpent.toLocaleString('en-IN')}`);
    const breakdown = breakdownParts.length > 0 ? breakdownParts.join(' • ') : '';
    
    return `
      <div class="envelope-item">
        <div class="envelope-header">
          <span class="envelope-name">${envelope}</span>
          <span class="envelope-amounts">₹${actualSpent.toLocaleString('en-IN')} / ₹${budgetAmount.toLocaleString('en-IN')}</span>
        </div>
        ${breakdown ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 6px; font-weight: 600;">${breakdown}</div>` : ''}
        <div class="envelope-bar">
          <div class="envelope-progress" style="width: ${Math.min(percentage, 100)}%; background-color: ${color};"></div>
        </div>
      </div>
    `;
  }).join('');
}
