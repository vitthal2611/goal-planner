export const calculatePaymentModeBalance = (transactions) => {
  const balances = {};
  
  transactions.forEach(transaction => {
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

export const carryForwardPaymentBalances = (monthlyData, currentPeriod) => {
  const [year, month] = currentPeriod.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevPeriod = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  
  const prevData = monthlyData[prevPeriod];
  if (!prevData?.transactions) return {};
  
  return calculatePaymentModeBalance(prevData.transactions);
};
