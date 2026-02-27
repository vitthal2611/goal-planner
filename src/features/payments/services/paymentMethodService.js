import { sanitizeInput, validatePaymentMethod } from '../../../utils/sanitize';

export class PaymentMethodService {
  constructor(repository) {
    this.repo = repository;
  }

  async save(userId, methods) {
    await this.repo.savePaymentMethods(userId, methods);
  }

  async load(userId) {
    return await this.repo.loadPaymentMethods(userId) || ['Cash', 'UPI', 'Credit Card', 'Debit Card'];
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
