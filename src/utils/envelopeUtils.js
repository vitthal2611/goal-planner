export const getPreviousPeriod = (currentPeriodStr) => {
  if (!currentPeriodStr) return null;
  const [year, month] = currentPeriodStr.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
};

export const getSpentAmount = (category, name, forPeriod, currentPeriod, monthlyData, transactions) => {
  const periodData = monthlyData[forPeriod] || { transactions: transactions };
  if (!periodData?.transactions) return 0;
  
  return periodData.transactions
    .filter(t => t.envelope === `${category}.${name}` && !t.type)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getRolloverAmount = (category, name, forPeriod, currentPeriod, monthlyData, transactions) => {
  const targetPeriod = forPeriod || currentPeriod;
  const previousPeriod = getPreviousPeriod(targetPeriod);
  const previousData = monthlyData[previousPeriod];
  
  if (!previousData?.envelopes?.[category]?.[name]) return 0;
  
  const prevEnv = previousData.envelopes[category][name];
  const prevRollover = getRolloverAmount(category, name, previousPeriod, currentPeriod, monthlyData, transactions);
  const prevSpent = getSpentAmount(category, name, previousPeriod, currentPeriod, monthlyData, transactions);
  const lastMonthBalance = prevEnv.budgeted + prevRollover - prevSpent;
  
  return Math.max(0, lastMonthBalance);
};

export const getEnvelopeBalance = (category, name, envelopes, currentPeriod, monthlyData, transactions) => {
  const env = envelopes[category]?.[name];
  if (!env) return 0;
  
  const rollover = getRolloverAmount(category, name, currentPeriod, currentPeriod, monthlyData, transactions);
  const spent = getSpentAmount(category, name, currentPeriod, currentPeriod, monthlyData, transactions);
  return env.budgeted + rollover - spent;
};

export const getStatusColor = (category, name, envelopes, currentPeriod, monthlyData, transactions) => {
  if (!envelopes[category]?.[name]) return '#dc2626';
  
  const env = envelopes[category][name];
  const rollover = getRolloverAmount(category, name, currentPeriod, currentPeriod, monthlyData, transactions);
  const spent = getSpentAmount(category, name, currentPeriod, currentPeriod, monthlyData, transactions);
  const balance = env.budgeted + rollover - spent;
  const percentage = env.budgeted > 0 ? (spent / env.budgeted) * 100 : 0;
  
  if (balance <= 0) return '#dc2626';
  if (percentage > 80) return '#f59e0b';
  return '#10b981';
};

export const calculateDashboardData = (transactions, envelopes, customPaymentMethods, currentPeriod, monthlyData) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => !t.type || t.type === 'expense');
  const transferTransactions = transactions.filter(t => t.type && t.type.includes('transfer'));
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransfers = transactions.filter(t => t.type === 'transfer-out').reduce((sum, t) => sum + t.amount, 0);
  
  const paymentMethodBalances = {};
  customPaymentMethods.forEach(method => {
    let balance = 0;
    transactions.forEach(transaction => {
      if (transaction.paymentMethod === method) {
        if (transaction.type === 'income' || transaction.type === 'transfer-in') {
          balance += transaction.amount;
        } else if (transaction.type === 'transfer-out') {
          balance -= transaction.amount;
        } else {
          balance -= transaction.amount;
        }
      }
    });
    paymentMethodBalances[method] = balance;
  });
  
  const envelopeBalances = {};
  
  Object.keys(envelopes).forEach(category => {
    envelopeBalances[category] = {};
    Object.keys(envelopes[category]).forEach(name => {
      const env = envelopes[category][name];
      const rollover = getRolloverAmount(category, name, currentPeriod, currentPeriod, monthlyData, transactions);
      const spent = getSpentAmount(category, name, currentPeriod, currentPeriod, monthlyData, transactions);
      envelopeBalances[category][name] = {
        balance: env.budgeted + rollover - spent,
        budgeted: env.budgeted,
        rollover,
        spent,
        statusColor: getStatusColor(category, name, envelopes, currentPeriod, monthlyData, transactions)
      };
    });
  });
  
  const cats = new Set(transactions.filter(t => t.envelope).map(t => t.envelope.split('.')[1] || t.envelope));
  
  return {
    income: { count: incomeTransactions.length, total: totalIncome },
    expenses: { count: expenseTransactions.length, total: totalExpenses },
    transfers: { count: transferTransactions.length / 2, total: totalTransfers },
    paymentMethodBalances,
    envelopeBalances,
    categories: ['all', ...Array.from(cats)]
  };
};
