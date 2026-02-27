import { sanitizeInput } from '../../../utils/sanitize';

export class TransactionService {
  constructor(envelopeService) {
    this.envelopeService = envelopeService;
  }

  createTransaction(data, monthlyData, currentPeriod) {
    const { envelope, amount, description, paymentMethod, date, allowOverspend } = data;
    const expenseAmount = parseFloat(amount);

    if (!expenseAmount || expenseAmount <= 0) {
      throw new Error('Enter valid amount');
    }

    if (!envelope) {
      throw new Error('Select envelope');
    }

    if (!paymentMethod) {
      throw new Error('Select payment method');
    }

    const [category, name] = envelope.split('.');
    const available = this.envelopeService.getAvailableBalance(monthlyData, category, name, currentPeriod);

    if (available < expenseAmount && !allowOverspend) {
      throw new Error('Insufficient funds!');
    }

    return {
      id: Date.now() + Math.random(),
      date: date || new Date().toISOString().split('T')[0],
      envelope,
      amount: expenseAmount,
      description: sanitizeInput(description || 'Quick expense'),
      paymentMethod: sanitizeInput(paymentMethod),
      overBudget: available < expenseAmount
    };
  }

  createIncomeTransaction(data) {
    const { amount, description, paymentMethod, date } = data;
    const incomeAmount = parseFloat(amount);

    if (!incomeAmount || incomeAmount <= 0) {
      throw new Error('Enter valid income amount');
    }

    return {
      id: Date.now() + Math.random(),
      date: date || new Date().toISOString().split('T')[0],
      envelope: 'INCOME',
      amount: incomeAmount,
      description: sanitizeInput(description || 'Monthly Income'),
      paymentMethod: sanitizeInput(paymentMethod),
      type: 'income'
    };
  }

  createTransfer(from, to, amount) {
    const transferAmount = parseFloat(amount);
    
    if (!from || !to || !transferAmount || transferAmount <= 0) {
      throw new Error('Fill all transfer details');
    }
    
    if (from === to) {
      throw new Error('Cannot transfer to same payment method');
    }

    const transferOut = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString().split('T')[0],
      envelope: 'TRANSFER',
      amount: transferAmount,
      description: `Transfer to ${to}`,
      paymentMethod: from,
      type: 'transfer-out'
    };
    
    const transferIn = {
      id: Date.now() + Math.random() + 1,
      date: new Date().toISOString().split('T')[0],
      envelope: 'TRANSFER',
      amount: transferAmount,
      description: `Transfer from ${from}`,
      paymentMethod: to,
      type: 'transfer-in'
    };

    return [transferOut, transferIn];
  }

  getPaymentMethodBalance(transactions, paymentMethod) {
    let balance = 0;
    transactions.forEach(t => {
      if (t.paymentMethod === paymentMethod) {
        if (t.type === 'income' || t.type === 'transfer-in') {
          balance += t.amount;
        } else if (t.type === 'transfer-out') {
          balance -= t.amount;
        } else {
          balance -= t.amount;
        }
      }
    });
    return balance;
  }
}
