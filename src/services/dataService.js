import { sheetsAPI } from './sheetsAPI.js';

class DataService {
  // Transaction Operations
  async addTransaction(type, description, envelope, amount, paymentMethod, month) {
    const id = sheetsAPI.generateId();
    const row = [
      month,
      type,
      description,
      envelope || '',
      parseFloat(amount),
      paymentMethod,
      new Date().toISOString(),
      id,
    ];

    await sheetsAPI.appendRow('Transactions', row);
    return { id, month, type, description, envelope, amount: parseFloat(amount), paymentMethod };
  }

  async getTransactions(month = null) {
    const rows = await sheetsAPI.getSheetData('Transactions');
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter(row => !month || row[0] === month)
      .map(row => ({
        month: row[0],
        type: row[1],
        description: row[2],
        envelope: row[3] || '',
        amount: parseFloat(row[4]) || 0,
        paymentMethod: row[5],
        date: row[6],
        id: row[7],
      }));
  }

  // Budget Operations
  async allocateBudget(envelope, budgeted, month) {
    const rows = await sheetsAPI.getSheetData('Budgets');
    const existingIndex = rows.findIndex(
      (row, idx) => idx > 0 && row[0] === month && row[1] === envelope
    );

    if (existingIndex > 0) {
      const spent = parseFloat(rows[existingIndex][3]) || 0;
      await sheetsAPI.updateRow('Budgets', existingIndex + 1, [
        month,
        envelope,
        parseFloat(budgeted),
        spent,
      ]);
    } else {
      await sheetsAPI.appendRow('Budgets', [month, envelope, parseFloat(budgeted), 0]);
    }

    return { month, envelope, budgeted: parseFloat(budgeted) };
  }

  async getBudgets(month = null) {
    const rows = await sheetsAPI.getSheetData('Budgets');
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter(row => !month || row[0] === month)
      .map(row => ({
        month: row[0],
        envelope: row[1],
        budgeted: parseFloat(row[2]) || 0,
        spent: parseFloat(row[3]) || 0,
      }));
  }

  async updateBudgetSpent(envelope, month) {
    const transactions = await this.getTransactions(month);
    const spent = transactions
      .filter(t => t.type === 'Expense' && t.envelope === envelope)
      .reduce((sum, t) => sum + t.amount, 0);

    const rows = await sheetsAPI.getSheetData('Budgets');
    const budgetIndex = rows.findIndex(
      (row, idx) => idx > 0 && row[0] === month && row[1] === envelope
    );

    if (budgetIndex > 0) {
      const budgeted = parseFloat(rows[budgetIndex][2]) || 0;
      await sheetsAPI.updateRow('Budgets', budgetIndex + 1, [
        month,
        envelope,
        budgeted,
        spent,
      ]);
    }
  }

  // Payment Method Operations
  async addPaymentMethod(name, type = 'Bank') {
    const rows = await sheetsAPI.getSheetData('PaymentMethods');
    const exists = rows.some((row, idx) => idx > 0 && row[0] === name);

    if (!exists) {
      await sheetsAPI.appendRow('PaymentMethods', [name, type, 'TRUE']);
    }

    return { name, type, active: true };
  }

  async getPaymentMethods() {
    const rows = await sheetsAPI.getSheetData('PaymentMethods');
    if (rows.length <= 1) return [];

    return rows
      .slice(1)
      .filter(row => row[2] === 'TRUE')
      .map(row => ({
        name: row[0],
        type: row[1] || 'Bank',
        active: true,
      }));
  }

  async removePaymentMethod(name) {
    const rows = await sheetsAPI.getSheetData('PaymentMethods');
    const methodIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === name);

    if (methodIndex > 0) {
      await sheetsAPI.updateRow('PaymentMethods', methodIndex + 1, [
        name,
        rows[methodIndex][1],
        'FALSE',
      ]);
    }
  }

  // Dashboard Data
  async getDashboardData(month) {
    const [transactions, budgets, paymentMethods] = await Promise.all([
      this.getTransactions(month),
      this.getBudgets(month),
      this.getPaymentMethods(),
    ]);

    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const envelopeSpending = {};
    transactions
      .filter(t => t.type === 'Expense' && t.envelope)
      .forEach(t => {
        envelopeSpending[t.envelope] = (envelopeSpending[t.envelope] || 0) + t.amount;
      });

    const budgetSummary = budgets.map(b => ({
      ...b,
      spent: envelopeSpending[b.envelope] || 0,
      remaining: b.budgeted - (envelopeSpending[b.envelope] || 0),
    }));

    return {
      month,
      income,
      expenses,
      balance: income - expenses,
      transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
      budgets: budgetSummary,
      paymentMethods,
    };
  }

  // Utility
  getCurrentMonth() {
    return sheetsAPI.getCurrentMonth();
  }
}

export const dataService = new DataService();
