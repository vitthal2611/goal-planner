import { addData, getData, saveData } from './database.js';

export const createRecurringTransaction = async (userId, recurringData) => {
  const path = `users/${userId}/recurring`;
  return await addData(path, {
    ...recurringData,
    createdAt: new Date().toISOString(),
    isActive: true
  });
};

export const getRecurringTransactions = async (userId) => {
  const path = `users/${userId}/recurring`;
  return await getData(path);
};

export const processRecurringTransactions = async (userId) => {
  const recurring = await getRecurringTransactions(userId);
  if (!recurring.success || !recurring.data) return { success: true, processed: 0 };

  const today = new Date();
  const processed = [];

  for (const [id, transaction] of Object.entries(recurring.data)) {
    if (!transaction.isActive) continue;

    const lastProcessed = transaction.lastProcessed ? new Date(transaction.lastProcessed) : new Date(transaction.createdAt);
    const shouldProcess = shouldProcessRecurring(lastProcessed, transaction.frequency, today);

    if (shouldProcess) {
      // Add the recurring transaction
      const transactionData = {
        date: today.toISOString().split('T')[0],
        type: transaction.type,
        description: `${transaction.description} (Recurring)`,
        envelope: transaction.envelope,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        isRecurring: true,
        recurringId: id
      };

      const result = await addData(`users/${userId}/transactions`, transactionData);
      if (result.success) {
        // Update last processed date
        await saveData(`users/${userId}/recurring/${id}/lastProcessed`, today.toISOString());
        processed.push(transaction);
      }
    }
  }

  return { success: true, processed: processed.length };
};

const shouldProcessRecurring = (lastProcessed, frequency, today) => {
  const daysDiff = Math.floor((today - lastProcessed) / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case 'daily': return daysDiff >= 1;
    case 'weekly': return daysDiff >= 7;
    case 'monthly': return daysDiff >= 30;
    case 'yearly': return daysDiff >= 365;
    default: return false;
  }
};