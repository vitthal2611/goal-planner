import { getSheetData, appendRow, updateRow, deleteRow } from './googleSheets';
import { withCache, cache } from './cacheService';

// Transactions
export const getTransactions = async (month = null) => {
  const data = await withCache('transactions', async () => {
    const sheetData = await getSheetData('Transactions!A2:F');
    return sheetData.map((row, idx) => ({
      id: idx + 2,
      month: row[0],
      type: row[1],
      description: row[2],
      envelope: row[3],
      amount: parseFloat(row[4]) || 0,
      paymentMethod: row[5],
    }));
  });
  
  return month ? data.filter(t => t.month === month) : data;
};

export const addTransaction = async (transaction) => {
  const { month, type, description, envelope, amount, paymentMethod } = transaction;
  await appendRow('Transactions', [month, type, description, envelope, amount, paymentMethod]);
  cache.invalidate('transactions');
};

export const updateTransaction = async (id, transaction) => {
  const { month, type, description, envelope, amount, paymentMethod } = transaction;
  await updateRow(`Transactions!A${id}:F${id}`, [month, type, description, envelope, amount, paymentMethod]);
  cache.invalidate('transactions');
};

export const deleteTransaction = async (id) => {
  await deleteRow('Transactions', id - 1);
  cache.invalidate('transactions');
};

// Envelopes
export const getEnvelopes = async () => {
  return withCache('envelopes', async () => {
    const data = await getSheetData('Envelopes!A2:C');
    return data.map((row, idx) => ({
      id: idx + 2,
      name: row[0],
      month: row[1],
      budget: parseFloat(row[2]) || 0,
    }));
  });
};

export const addEnvelope = async (envelope) => {
  const { name, month, budget } = envelope;
  await appendRow('Envelopes', [name, month, budget]);
  cache.invalidate('envelopes');
};

export const updateEnvelope = async (id, envelope) => {
  const { name, month, budget } = envelope;
  await updateRow(`Envelopes!A${id}:C${id}`, [name, month, budget]);
  cache.invalidate('envelopes');
};

export const deleteEnvelope = async (id) => {
  await deleteRow('Envelopes', id - 1);
  cache.invalidate('envelopes');
};

export const getEnvelopeNames = async () => {
  const envelopes = await getEnvelopes();
  return [...new Set(envelopes.map(e => e.name))];
};

// Payment Methods
export const getPaymentMethods = async () => {
  return withCache('paymentMethods', async () => {
    const data = await getSheetData('PaymentMethods!A2:B');
    return data.map((row, idx) => ({
      id: idx + 2,
      name: row[0],
      type: row[1],
    }));
  }, 60000); // Cache for 60 seconds (changes less frequently)
};

export const addPaymentMethod = async (method) => {
  const { name, type } = method;
  await appendRow('PaymentMethods', [name, type]);
  cache.invalidate('paymentMethods');
};

export const deletePaymentMethod = async (id) => {
  await deleteRow('PaymentMethods', id - 1);
  cache.invalidate('paymentMethods');
};

// Budget Summary
export const getBudgetSummary = async (month) => {
  const [envelopes, transactions] = await Promise.all([
    getEnvelopes(),
    getTransactions(month),
  ]);

  const monthEnvelopes = envelopes.filter(e => e.month === month);
  const expenses = transactions.filter(t => t.type === 'Expense');

  return monthEnvelopes.map(env => {
    const spent = expenses
      .filter(e => e.envelope === env.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      ...env,
      spent,
      remaining: env.budget - spent,
      percentage: env.budget > 0 ? (spent / env.budget) * 100 : 0,
    };
  });
};

// Income Summary
export const getIncomeSummary = async (month) => {
  const transactions = await getTransactions(month);
  return transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
};
