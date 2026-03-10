import { googleSheetsService } from './googleSheetsService.js';

export class DataService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await googleSheetsService.initialize();
      this.initialized = true;
    }
    return true;
  }

  // Transaction operations
  async addTransaction(transaction, period) {
    await this.initialize();
    
    try {
      const result = await googleSheetsService.saveTransaction(transaction, period);
      return { success: true, data: result };
    } catch (error) {
      console.error('Add transaction error:', error);
      return { success: false, error: error.message };
    }
  }

  async addIncome(income, period) {
    return this.addTransaction({ ...income, type: 'income' }, period);
  }

  async addExpense(expense, period) {
    return this.addTransaction({ ...expense, type: 'expense' }, period);
  }

  async addTransfer(transfer, period) {
    return this.addTransaction({ ...transfer, type: 'transfer' }, period);
  }

  // Budget operations
  async saveBudget(budget, period) {
    await this.initialize();
    
    try {
      await googleSheetsService.saveBudget(budget, period);
      return { success: true };
    } catch (error) {
      console.error('Save budget error:', error);
      return { success: false, error: error.message };
    }
  }

  // Payment method operations
  async savePaymentMethod(method) {
    await this.initialize();
    
    try {
      await googleSheetsService.savePaymentMethod(method);
      return { success: true };
    } catch (error) {
      console.error('Save payment method error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load operations
  async loadData(period = null) {
    await this.initialize();
    
    try {
      const data = await googleSheetsService.loadAllData(period);
      
      // Transform data to match app structure
      const currentPeriod = period || googleSheetsService.getCurrentPeriod();
      const monthlyData = {};
      
      // Initialize monthly data
      monthlyData[currentPeriod] = {
        income: 0,
        envelopes: {},
        transactions: data.transactions
      };
      
      // Calculate income
      data.transactions
        .filter(t => t.type === 'income')
        .forEach(t => {
          monthlyData[currentPeriod].income += t.amount;
        });
      
      // Process budgets into envelopes structure
      data.budgets.forEach(budget => {
        if (!monthlyData[currentPeriod].envelopes[budget.category]) {
          monthlyData[currentPeriod].envelopes[budget.category] = {};
        }
        
        monthlyData[currentPeriod].envelopes[budget.category][budget.envelope] = {
          budgeted: budget.budgeted,
          spent: budget.spent
        };
      });
      
      return {
        success: true,
        data: {
          currentPeriod,
          monthlyData,
          paymentMethods: data.paymentMethods.filter(pm => pm.active).map(pm => pm.name)
        }
      };
    } catch (error) {
      console.error('Load data error:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  getCurrentPeriod() {
    return googleSheetsService.getCurrentPeriod();
  }

  clearCache() {
    googleSheetsService.clearCache();
  }

  logout() {
    googleSheetsService.logout();
  }

  async getAccessToken() {
    return googleSheetsService.getAccessToken();
  }
}