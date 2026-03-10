import { sanitizeInput, validatePaymentMethod } from '../../../utils/sanitize';
import { googleSheetsAPI } from '../../../utils/googleSheetsAPI';

export class PaymentMethodService {
  async save(userId, methods) {
    try {
      const rows = await googleSheetsAPI.readSheet('PaymentMethods!A:C');
      const header = rows.length > 0 ? rows[0] : ['UserID', 'PaymentMethod', 'UsageCount'];
      const otherUserRows = rows.slice(1).filter(row => row[0] !== userId);
      const newRows = methods.map(method => [userId, method, '0']);
      await googleSheetsAPI.writeSheet('PaymentMethods!A:C', [header, ...otherUserRows, ...newRows]);
    } catch (err) {
      console.error('Error saving payment methods:', err);
      throw err;
    }
  }

  async load(userId) {
    try {
      const rows = await googleSheetsAPI.readSheet('PaymentMethods!A:C');
      if (rows.length <= 1) {
        await googleSheetsAPI.writeSheet('PaymentMethods!A:C', [['UserID', 'PaymentMethod', 'UsageCount']]);
        return [];
      }
      return rows.slice(1).filter(row => row[0] === userId).map(row => row[1]);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      return [];
    }
  }

  add(currentMethods, method) {
    if (!method || currentMethods.includes(method) || !validatePaymentMethod(method)) {
      throw new Error('Invalid payment method');
    }
    const sanitized = sanitizeInput(method);
    return [...currentMethods, sanitized].sort((a, b) => a.localeCompare(b));
  }

  remove(currentMethods, method, transactions) {
    const isUsed = transactions.some(t => t.paymentMethod === method);
    if (isUsed) {
      throw new Error(`Cannot delete ${method}. It is used in transactions.`);
    }
    return currentMethods.filter(m => m !== method);
  }
}
