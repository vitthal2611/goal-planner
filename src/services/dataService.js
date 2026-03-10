import { GoogleSheetsService } from './googleSheetsService';

export class DataService {
  constructor() {
    this.sheetsService = new GoogleSheetsService();
  }

  async saveExpense(expense, month) {
    const expenseData = {
      ...expense,
      type: 'expense',
      category: expense.envelope?.split('.')[0] || '',
      id: expense.id || Date.now() + Math.random(),
      date: expense.date || new Date().toISOString().split('T')[0]
    };
    
    return await this.sheetsService.addTransaction(expenseData, month);
  }

  async saveIncome(income, month) {
    const incomeData = {
      ...income,
      type: 'income',
      id: income.id || Date.now() + Math.random(),
      date: income.date || new Date().toISOString().split('T')[0]
    };
    
    return await this.sheetsService.addIncome(incomeData, month);
  }

  async saveTransfer(transfer, month) {
    const transferData = {
      ...transfer,
      id: transfer.id || Date.now() + Math.random(),
      date: transfer.date || new Date().toISOString().split('T')[0]
    };
    
    return await this.sheetsService.addTransfer(transferData, month);
  }

  async saveBudget(budget, month) {
    const budgetData = {
      category: budget.category,
      envelope: budget.envelope,
      budgeted: budget.budgeted || 0,
      spent: budget.spent || 0
    };
    
    return await this.sheetsService.saveBudget(budgetData, month);
  }

  async loadData(month = null) {
    return await this.sheetsService.load(month);
  }

  async loadTransactions(month = null) {
    return await this.sheetsService.loadTransactions(month);
  }

  async loadBudgets(month = null) {
    return await this.sheetsService.loadBudgets(month);
  }

  getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  clearCache() {
    this.sheetsService.clearCache();
  }
}