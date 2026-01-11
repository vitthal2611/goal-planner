export const calculateSpendingTrends = (transactions, period = 30) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (period * 24 * 60 * 60 * 1000));
  
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate && t.type !== 'income';
  });

  const dailySpending = {};
  filteredTransactions.forEach(t => {
    const date = t.date;
    dailySpending[date] = (dailySpending[date] || 0) + t.amount;
  });

  const trend = Object.entries(dailySpending)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, amount]) => ({ date, amount }));

  const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const avgDaily = totalSpent / period;

  return { trend, totalSpent, avgDaily, period };
};

export const calculateBudgetVsActual = (envelopes, transactions) => {
  const analysis = {};
  
  Object.entries(envelopes).forEach(([key, envelope]) => {
    const envelopeTransactions = transactions.filter(t => 
      t.envelope === key && t.type !== 'income'
    );
    
    const actualSpent = envelopeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const budgeted = envelope.allocated || 0;
    const remaining = budgeted - actualSpent;
    const percentUsed = budgeted > 0 ? (actualSpent / budgeted) * 100 : 0;
    
    analysis[key] = {
      name: envelope.name,
      budgeted,
      actualSpent,
      remaining,
      percentUsed,
      status: percentUsed > 100 ? 'over' : percentUsed > 80 ? 'warning' : 'good'
    };
  });
  
  return analysis;
};

export const calculateCategoryInsights = (transactions) => {
  const categories = {};
  const expenses = transactions.filter(t => t.type !== 'income');
  
  expenses.forEach(t => {
    const category = t.envelope;
    if (!categories[category]) {
      categories[category] = {
        name: category,
        totalSpent: 0,
        transactionCount: 0,
        avgTransaction: 0
      };
    }
    
    categories[category].totalSpent += t.amount;
    categories[category].transactionCount += 1;
  });
  
  // Calculate averages and percentages
  const totalSpent = Object.values(categories).reduce((sum, cat) => sum + cat.totalSpent, 0);
  
  Object.values(categories).forEach(category => {
    category.avgTransaction = category.totalSpent / category.transactionCount;
    category.percentage = totalSpent > 0 ? (category.totalSpent / totalSpent) * 100 : 0;
  });
  
  return Object.values(categories).sort((a, b) => b.totalSpent - a.totalSpent);
};

export const calculateMonthlyComparison = (transactions) => {
  const monthlyData = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 };
    }
    
    if (t.type === 'income') {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].expenses += t.amount;
    }
    
    monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
  });
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
};