// Budget validation service - ensures income allocation matches before transactions
export const validateMonthBudget = (transactions, envelopes, month) => {
  const income = transactions
    .filter(t => t.month === month && t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const allocated = envelopes
    .filter(e => e.month === month)
    .reduce((sum, e) => sum + e.budget, 0);

  return {
    income,
    allocated,
    isValid: income === allocated,
    difference: income - allocated,
  };
};

export const canAddTransaction = (transactions, envelopes, month, type) => {
  if (type === 'Income' || type === 'Transfer') return true;
  
  const validation = validateMonthBudget(transactions, envelopes, month);
  return validation.isValid;
};
