import { googleSheetsService } from './optimizedGoogleSheetsService.js';

export class OptimizedDataService {
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
      let result;
      
      switch (transaction.type) {
        case 'income':
          result = await googleSheetsService.saveIncome(transaction, period);
          break;
        case 'transfer':
          result = await googleSheetsService.saveTransfer(transaction, period);
          break;
        default:
          result = await googleSheetsService.saveExpense(transaction, period);
      }
      
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

  // Load operations
  async loadTransactions(period = null) {
    await this.initialize();
    
    try {
      const [income, expenses, transfers] = await Promise.all([
        googleSheetsService.loadIncome(period),
        googleSheetsService.loadExpenses(period),
        googleSheetsService.loadTransfers(period)
      ]);
      
      const transactions = [...income, ...expenses, ...transfers];
      return { success: true, data: transactions };
    } catch (error) {
      console.error('Load transactions error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async loadBudgets(period = null) {
    await this.initialize();
    
    try {
      const budgets = await googleSheetsService.loadBudgets(period);
      return { success: true, data: budgets };
    } catch (error) {
      console.error('Load budgets error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async load(period = null) {
    await this.initialize();
    
    try {
      const data = await googleSheetsService.loadAllData(period);
      
      // Transform data to match existing app structure
      const monthlyData = {};
      const currentPeriod = period || googleSheetsService.getCurrentPeriod();
      
      // Initialize monthly data structure
      if (!monthlyData[currentPeriod]) {
        monthlyData[currentPeriod] = {
          income: 0,
          envelopes: {},
          transactions: []
        };
      }
      
      // Process transactions
      data.transactions.forEach(transaction => {
        const tPeriod = transaction.month || currentPeriod;
        
        if (!monthlyData[tPeriod]) {
          monthlyData[tPeriod] = {
            income: 0,
            envelopes: {},
            transactions: []
          };
        }
        
        monthlyData[tPeriod].transactions.push(transaction);
        
        if (transaction.type === 'income') {
          monthlyData[tPeriod].income += transaction.amount;
        }
      });
      
      // Process budgets
      data.budgets.forEach(budget => {
        const bPeriod = budget.month || currentPeriod;
        
        if (!monthlyData[bPeriod]) {
          monthlyData[bPeriod] = {
            income: 0,
            envelopes: {},
            transactions: []
          };
        }
        
        if (!monthlyData[bPeriod].envelopes[budget.category]) {
          monthlyData[bPeriod].envelopes[budget.category] = {};
        }
        
        monthlyData[bPeriod].envelopes[budget.category][budget.envelope] = {
          budgeted: budget.budgeted,
          spent: budget.spent
        };
      });
      
      return {
        success: true,
        data: {
          currentPeriod,
          monthlyData
        }
      };
    } catch (error) {
      console.error('Load error:', error);
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

  // OAuth methods
  async getAccessToken() {
    return googleSheetsService.getAccessToken();
  }

  isInitialized() {
    return this.initialized;
  }
}