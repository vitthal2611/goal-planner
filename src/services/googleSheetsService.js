import { GoogleSheetsRepository } from '../core/repositories/googleSheetsRepository';

export class GoogleSheetsService {
  constructor() {
    this.repo = new GoogleSheetsRepository();
  }

  async addTransaction(transaction, period) {
    try {
      await this.repo.saveTransaction(transaction, period);
      return { success: true };
    } catch (error) {
      console.error('Add transaction error:', error);
      return { success: false, error: error.message };
    }
  }

  async addIncome(income, period) {
    try {
      const incomeTransaction = { ...income, type: 'income' };
      await this.repo.saveTransaction(incomeTransaction, period);
      return { success: true };
    } catch (error) {
      console.error('Add income error:', error);
      return { success: false, error: error.message };
    }
  }

  async addTransfer(transfer, period) {
    try {
      const transferOut = { ...transfer, type: 'transfer-out' };
      const transferIn = { ...transfer, type: 'transfer-in', paymentMethod: transfer.to, from: transfer.paymentMethod };
      await this.repo.saveTransaction(transferOut, period);
      await this.repo.saveTransaction(transferIn, period);
      return { success: true };
    } catch (error) {
      console.error('Add transfer error:', error);
      return { success: false, error: error.message };
    }
  }

  async saveBudget(budget, period) {
    try {
      await this.repo.saveBudget(budget, period);
      return { success: true };
    } catch (error) {
      console.error('Save budget error:', error);
      return { success: false, error: error.message };
    }
  }

  async loadTransactions(period = null) {
    try {
      const transactions = await this.repo.loadTransactions(period);
      return { success: true, data: transactions };
    } catch (error) {
      console.error('Load transactions error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async loadBudgets(period = null) {
    try {
      const budgets = await this.repo.loadBudgets(period);
      return { success: true, data: budgets };
    } catch (error) {
      console.error('Load budgets error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async load(period = null) {
    try {
      const [transactionsResult, budgetsResult] = await Promise.all([
        this.loadTransactions(period),
        this.loadBudgets(period)
      ]);

      const transactions = transactionsResult.data || [];
      const budgets = budgetsResult.data || [];
      const currentPeriod = period || this.getCurrentPeriod();

      // Reconstruct monthlyData structure
      const monthlyData = {};
      
      // Group transactions by period
      transactions.forEach(t => {
        const tPeriod = t.month || currentPeriod;
        if (!monthlyData[tPeriod]) {
          monthlyData[tPeriod] = { income: 0, envelopes: {}, transactions: [] };
        }
        monthlyData[tPeriod].transactions.push(t);
        
        if (t.type === 'income') {
          monthlyData[tPeriod].income += t.amount;
        }
      });

      // Group budgets by period
      budgets.forEach(b => {
        const bPeriod = b.month || currentPeriod;
        if (!monthlyData[bPeriod]) {
          monthlyData[bPeriod] = { income: 0, envelopes: {}, transactions: [] };
        }
        if (!monthlyData[bPeriod].envelopes[b.category]) {
          monthlyData[bPeriod].envelopes[b.category] = {};
        }
        monthlyData[bPeriod].envelopes[b.category][b.envelope] = {
          budgeted: b.budgeted,
          spent: b.spent
        };
      });

      return {
        success: true,
        data: { currentPeriod, monthlyData }
      };
    } catch (error) {
      console.error('Load error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTransaction(transactionId) {
    try {
      // This would require implementing delete functionality in repository
      // For now, we'll reload and filter - not optimal but functional
      console.warn('Delete transaction not fully implemented - requires sheet row deletion');
      return { success: false, error: 'Delete not implemented' };
    } catch (error) {
      console.error('Delete transaction error:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  clearCache() {
    this.repo.clearCache();
  }
}
