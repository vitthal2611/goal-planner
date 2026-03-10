import { googleOAuthService } from '../../services/googleOAuthService';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

export class GoogleSheetsRepository {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 30000;
    this.sheetId = null;
    this.SHEET_NAMES = {
      TRANSACTIONS: 'Transactions',
      INCOME: 'Income', 
      EXPENSES: 'Expenses',
      TRANSFERS: 'Transfers',
      BUDGETS: 'Budgets'
    };
  }

  async initialize() {
    if (!this.sheetId) {
      this.sheetId = SHEET_ID || await this.createSpreadsheet();
      await this.ensureSheets();
    }
    return this.sheetId;
  }

  async createSpreadsheet() {
    const token = await googleOAuthService.getAccessToken();
    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        properties: { title: 'Budget Planner Data' }
      })
    });
    if (!response.ok) throw new Error('Failed to create spreadsheet');
    const data = await response.json();
    return data.spreadsheetId;
  }

  async ensureSheets() {
    const token = await googleOAuthService.getAccessToken();
    const url = `${BASE_URL}/${this.sheetId}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get spreadsheet info');
    const data = await response.json();
    
    const existingSheets = data.sheets.map(s => s.properties.title);
    const requiredSheets = Object.values(this.SHEET_NAMES);
    
    for (const sheetName of requiredSheets) {
      if (!existingSheets.includes(sheetName)) {
        await this.createSheet(sheetName);
        await this.initializeSheetHeaders(sheetName);
      }
    }
  }

  async createSheet(title) {
    const token = await googleOAuthService.getAccessToken();
    const url = `${BASE_URL}/${this.sheetId}:batchUpdate`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requests: [{
          addSheet: { properties: { title } }
        }]
      })
    });
  }

  async initializeSheetHeaders(sheetName) {
    const headers = this.getSheetHeaders(sheetName);
    await this.writeRange(`${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`, [headers]);
  }

  getSheetHeaders(sheetName) {
    const commonHeaders = ['Month', 'Type', 'Description', 'Envelope', 'Category', 'Amount', 'Payment Method'];
    switch (sheetName) {
      case this.SHEET_NAMES.TRANSACTIONS:
        return [...commonHeaders, 'ID', 'Date', 'Over Budget'];
      case this.SHEET_NAMES.INCOME:
        return ['Month', 'Description', 'Amount', 'Payment Method', 'ID', 'Date'];
      case this.SHEET_NAMES.EXPENSES:
        return commonHeaders;
      case this.SHEET_NAMES.TRANSFERS:
        return ['Month', 'From', 'To', 'Amount', 'Description', 'ID', 'Date'];
      case this.SHEET_NAMES.BUDGETS:
        return ['Month', 'Category', 'Envelope', 'Budgeted', 'Spent', 'Available'];
      default:
        return commonHeaders;
    }
  }

  async readRange(range) {
    await this.initialize();
    const token = await googleOAuthService.getAccessToken();
    const url = `${BASE_URL}/${this.sheetId}/values/${range}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to read from Google Sheets');
    const data = await response.json();
    return data.values || [];
  }

  async writeRange(range, values) {
    await this.initialize();
    const token = await googleOAuthService.getAccessToken();
    const url = `${BASE_URL}/${this.sheetId}/values/${range}?valueInputOption=RAW`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ values })
    });
    if (!response.ok) throw new Error('Failed to write to Google Sheets');
    return await response.json();
  }

  async appendRange(range, values) {
    await this.initialize();
    const token = await googleOAuthService.getAccessToken();
    const url = `${BASE_URL}/${this.sheetId}/values/${range}:append?valueInputOption=RAW`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ values })
    });
    if (!response.ok) throw new Error('Failed to append to Google Sheets');
    return await response.json();
  }

  async saveTransaction(transaction, month) {
    const sheetName = this.getSheetByType(transaction.type);
    const row = this.serializeTransaction(transaction, month);
    await this.appendRange(`${sheetName}!A:Z`, [row]);
    this.clearCache();
  }

  async saveBudget(budget, month) {
    const row = [month, budget.category, budget.envelope, budget.budgeted, budget.spent, budget.budgeted - budget.spent];
    await this.appendRange(`${this.SHEET_NAMES.BUDGETS}!A:Z`, [row]);
    this.clearCache();
  }

  async loadTransactions(month = null) {
    const sheets = [this.SHEET_NAMES.TRANSACTIONS, this.SHEET_NAMES.INCOME, this.SHEET_NAMES.EXPENSES, this.SHEET_NAMES.TRANSFERS];
    const allTransactions = [];
    
    for (const sheet of sheets) {
      const rows = await this.readRange(`${sheet}!A:Z`);
      if (rows.length > 1) {
        const transactions = this.deserializeTransactions(rows, sheet);
        allTransactions.push(...transactions.filter(t => !month || t.month === month));
      }
    }
    
    return allTransactions;
  }

  async loadBudgets(month = null) {
    const rows = await this.readRange(`${this.SHEET_NAMES.BUDGETS}!A:Z`);
    if (rows.length <= 1) return [];
    
    return rows.slice(1).map(row => ({
      month: row[0],
      category: row[1],
      envelope: row[2],
      budgeted: parseFloat(row[3]) || 0,
      spent: parseFloat(row[4]) || 0,
      available: parseFloat(row[5]) || 0
    })).filter(b => !month || b.month === month);
  }

  getSheetByType(type) {
    switch (type) {
      case 'income': return this.SHEET_NAMES.INCOME;
      case 'transfer-in':
      case 'transfer-out': return this.SHEET_NAMES.TRANSFERS;
      default: return this.SHEET_NAMES.EXPENSES;
    }
  }

  serializeTransaction(transaction, month) {
    const baseData = [
      month,
      transaction.type || 'expense',
      transaction.description || '',
      transaction.envelope || '',
      transaction.category || transaction.envelope?.split('.')[0] || '',
      transaction.amount || 0,
      transaction.paymentMethod || ''
    ];
    
    if (transaction.type === 'income') {
      return [month, transaction.description, transaction.amount, transaction.paymentMethod, transaction.id, transaction.date];
    }
    
    if (transaction.type?.includes('transfer')) {
      return [month, transaction.from || transaction.paymentMethod, transaction.to || '', transaction.amount, transaction.description, transaction.id, transaction.date];
    }
    
    return [...baseData, transaction.id, transaction.date, transaction.overBudget || false];
  }

  deserializeTransactions(rows, sheetName) {
    if (!rows || rows.length <= 1) return [];
    
    return rows.slice(1).map(row => {
      if (sheetName === this.SHEET_NAMES.INCOME) {
        return {
          month: row[0],
          type: 'income',
          description: row[1],
          amount: parseFloat(row[2]) || 0,
          paymentMethod: row[3],
          id: row[4],
          date: row[5]
        };
      }
      
      if (sheetName === this.SHEET_NAMES.TRANSFERS) {
        return {
          month: row[0],
          type: 'transfer',
          from: row[1],
          to: row[2],
          amount: parseFloat(row[3]) || 0,
          description: row[4],
          id: row[5],
          date: row[6]
        };
      }
      
      return {
        month: row[0],
        type: row[1] || 'expense',
        description: row[2],
        envelope: row[3],
        category: row[4],
        amount: parseFloat(row[5]) || 0,
        paymentMethod: row[6],
        id: row[7],
        date: row[8],
        overBudget: row[9] === 'true'
      };
    });
  }

  clearCache() {
    this.cache.clear();
  }
}