export const calculateRollover = (monthlyData, category, name, currentPeriod) => {
  const getPreviousPeriod = (period) => {
    const [year, month] = period.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  };

  const previousPeriod = getPreviousPeriod(currentPeriod);
  const previousData = monthlyData[previousPeriod];
  
  if (!previousData?.envelopes?.[category]?.[name]) return 0;
  
  const prevEnv = previousData.envelopes[category][name];
  const prevRollover = calculateRollover(monthlyData, category, name, previousPeriod);
  const prevSpent = calculateSpent(monthlyData, category, name, previousPeriod);
  const lastMonthBalance = prevEnv.budgeted + prevRollover - prevSpent;
  
  return Math.max(0, lastMonthBalance);
};

export const calculateSpent = (monthlyData, category, name, period) => {
  const periodData = monthlyData[period];
  if (!periodData?.transactions) return 0;
  
  return periodData.transactions
    .filter(t => t.envelope === `${category}.${name}` && !t.type)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateAvailable = (envelope, rollover, spent) => {
  return envelope.budgeted + rollover - spent;
};

export const calculatePercentage = (spent, budgeted) => {
  return budgeted > 0 ? (spent / budgeted) * 100 : 0;
};

export const getEnvelopeStatus = (available, percentage) => {
  if (available <= 0) return { status: 'blocked', icon: '🚫', color: 'var(--danger)' };
  if (percentage >= 90) return { status: 'critical', icon: '⚠️', color: '#dc2626' };
  if (percentage >= 75) return { status: 'warning', icon: '⚡', color: 'var(--warning)' };
  if (percentage >= 50) return { status: 'moderate', icon: '📊', color: '#3b82f6' };
  return { status: 'healthy', icon: '✅', color: 'var(--success)' };
};

export const calculateTotalBudgeted = (envelopes) => {
  return Object.values(envelopes).reduce((sum, category) =>
    sum + Object.values(category).reduce((catSum, env) => catSum + env.budgeted, 0), 0);
};

export const calculateTotalSpent = (transactions) => {
  return transactions
    .filter(t => !t.type || t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getPaymentMethodBalances = (monthlyData, currentPeriod) => {
  let relevantTransactions = [];
  if (currentPeriod.match(/^\d{4}$/)) {
    relevantTransactions = Object.keys(monthlyData)
      .filter(period => period.startsWith(currentPeriod))
      .flatMap(period => monthlyData[period]?.transactions || []);
  } else {
    relevantTransactions = monthlyData[currentPeriod]?.transactions || [];
  }
  
  const balances = {};
  relevantTransactions.forEach(transaction => {
    const method = transaction.paymentMethod || 'Unknown';
    if (!balances[method]) balances[method] = 0;
    
    if (transaction.type === 'income' || transaction.type === 'transfer-in' || transaction.type === 'loan') {
      balances[method] += transaction.amount;
    } else if (transaction.type === 'transfer-out') {
      balances[method] -= transaction.amount;
    } else {
      balances[method] -= transaction.amount;
    }
  });
  
  return balances;
};

export const getCategorySpending = (envelopes, monthlyData, currentPeriod) => {
  const categories = { needs: 0, wants: 0, savings: 0 };
  
  Object.keys(categories).forEach(category => {
    if (envelopes[category]) {
      Object.keys(envelopes[category]).forEach(name => {
        categories[category] += calculateSpent(monthlyData, category, name, currentPeriod);
      });
    }
  });
  
  return categories;
};

export const getInsights = (envelopes, monthlyData, currentPeriod) => {
  const healthy = [];
  const blocked = [];
  const warnings = [];

  Object.keys(envelopes).forEach(category => {
    Object.keys(envelopes[category]).forEach(name => {
      const env = envelopes[category][name];
      const rollover = calculateRollover(monthlyData, category, name, currentPeriod);
      const spent = calculateSpent(monthlyData, category, name, currentPeriod);
      const available = calculateAvailable(env, rollover, spent);
      const percentage = calculatePercentage(spent, env.budgeted);
      const status = getEnvelopeStatus(available, percentage);
      
      if (status.status === 'healthy') healthy.push(name);
      else if (status.status === 'blocked') blocked.push(name);
      else warnings.push(name);
    });
  });

  return { healthy, blocked, warnings };
};