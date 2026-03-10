const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

class OptimizedGoogleSheetsService {
  constructor() {
    this.accessToken = null;
    this.tokenClient = null;
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.cache = new Map();
    this.CACHE_TTL = 30000; // 30 seconds
    
    this.SHEETS = {
      INCOME: 'Income',
      EXPENSES: 'Expenses', 
      TRANSFERS: 'Transfers',
      BUDGETS: 'Budgets'
    };
    
    this.HEADERS = {
      [this.SHEETS.INCOME]: ['Month', 'Description', 'Amount', 'Payment Method', 'Date', 'ID'],
      [this.SHEETS.EXPENSES]: ['Month', 'Type', 'Description', 'Envelope', 'Category', 'Amount', 'Payment Method', 'Date', 'ID'],
      [this.SHEETS.TRANSFERS]: ['Month', 'From', 'To', 'Amount', 'Description', 'Date', 'ID'],
      [this.SHEETS.BUDGETS]: ['Month', 'Category', 'Envelope', 'Budgeted', 'Spent']
    };
  }

  async initialize() {
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google OAuth library not loaded');
    }
    
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      callback: ''
    });
    
    if (!this.spreadsheetId) {
      this.spreadsheetId = await this.createSpreadsheet();
    }
    
    await this.ensureSheets();
    return true;
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken;
    
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.accessToken = response.access_token;
          resolve(this.accessToken);
        }
      };
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  async createSpreadsheet() {
    const token = await this.getAccessToken();
    const response = await fetch(BASE_URL, {
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
    const token = await this.getAccessToken();
    const response = await fetch(`${BASE_URL}/${this.spreadsheetId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to get spreadsheet info');
    const data = await response.json();
    
    const existingSheets = data.sheets.map(s => s.properties.title);
    
    for (const [key, sheetName] of Object.entries(this.SHEETS)) {
      if (!existingSheets.includes(sheetName)) {
        await this.createSheet(sheetName);
        await this.initializeHeaders(sheetName);
      }
    }
  }

  async createSheet(title) {
    const token = await this.getAccessToken();
    await fetch(`${BASE_URL}/${this.spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title } } }]
      })
    });
  }

  async initializeHeaders(sheetName) {
    const headers = this.HEADERS[sheetName];
    if (headers) {
      await this.writeToSheet(sheetName, 'A1', [headers]);
    }
  }

  async writeToSheet(sheetName, range, values) {
    const token = await this.getAccessToken();
    const fullRange = `${sheetName}!${range}`;
    
    const response = await fetch(`${BASE_URL}/${this.spreadsheetId}/values/${fullRange}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ values })
    });
    
    if (!response.ok) throw new Error(`Failed to write to ${sheetName}`);
    this.clearCache();
  }

  async appendToSheet(sheetName, values) {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${BASE_URL}/${this.spreadsheetId}/values/${sheetName}:append?valueInputOption=RAW`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ values: [values] })
    });
    
    if (!response.ok) throw new Error(`Failed to append to ${sheetName}`);
    this.clearCache();
  }

  async readFromSheet(sheetName, range = 'A:Z') {
    const cacheKey = `${sheetName}_${range}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    const token = await this.getAccessToken();
    const response = await fetch(`${BASE_URL}/${this.spreadsheetId}/values/${sheetName}!${range}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`Failed to read from ${sheetName}`);
    const data = await response.json();
    const values = data.values || [];
    
    this.cache.set(cacheKey, { data: values, timestamp: Date.now() });
    return values;
  }

  // Income operations
  async saveIncome(income, month) {
    const id = this.generateId();
    const row = [
      month,
      income.description,
      income.amount,
      income.paymentMethod,
      new Date().toISOString(),
      id
    ];
    
    await this.appendToSheet(this.SHEETS.INCOME, row);
    return { ...income, id, month, type: 'income' };
  }

  // Expense operations
  async saveExpense(expense, month) {
    const id = this.generateId();
    const row = [
      month,
      'expense',
      expense.description,
      expense.envelope,
      expense.category,
      expense.amount,
      expense.paymentMethod,
      new Date().toISOString(),
      id
    ];
    
    await this.appendToSheet(this.SHEETS.EXPENSES, row);
    return { ...expense, id, month, type: 'expense' };
  }

  // Transfer operations
  async saveTransfer(transfer, month) {
    const id = this.generateId();
    const row = [
      month,
      transfer.from,
      transfer.to,
      transfer.amount,
      transfer.description,
      new Date().toISOString(),
      id
    ];
    
    await this.appendToSheet(this.SHEETS.TRANSFERS, row);
    return { ...transfer, id, month, type: 'transfer' };
  }

  // Budget operations
  async saveBudget(budget, month) {
    const existingBudgets = await this.loadBudgets(month);
    const existingIndex = existingBudgets.findIndex(
      b => b.category === budget.category && b.envelope === budget.envelope
    );
    
    if (existingIndex >= 0) {
      // Update existing budget
      const rowIndex = existingIndex + 2; // +1 for header, +1 for 0-based index
      await this.writeToSheet(this.SHEETS.BUDGETS, `A${rowIndex}:E${rowIndex}`, [[
        month,
        budget.category,
        budget.envelope,
        budget.budgeted,
        budget.spent
      ]]);
    } else {
      // Add new budget
      await this.appendToSheet(this.SHEETS.BUDGETS, [
        month,
        budget.category,
        budget.envelope,
        budget.budgeted,
        budget.spent
      ]);
    }
  }

  // Load operations
  async loadIncome(month = null) {
    const rows = await this.readFromSheet(this.SHEETS.INCOME);
    if (rows.length <= 1) return [];
    
    return rows.slice(1)
      .filter(row => !month || row[0] === month)
      .map(row => ({
        month: row[0],
        description: row[1],
        amount: parseFloat(row[2]) || 0,
        paymentMethod: row[3],
        date: row[4],
        id: row[5],
        type: 'income'
      }));
  }

  async loadExpenses(month = null) {
    const rows = await this.readFromSheet(this.SHEETS.EXPENSES);
    if (rows.length <= 1) return [];
    
    return rows.slice(1)
      .filter(row => !month || row[0] === month)
      .map(row => ({
        month: row[0],
        type: row[1],
        description: row[2],
        envelope: row[3],
        category: row[4],
        amount: parseFloat(row[5]) || 0,
        paymentMethod: row[6],
        date: row[7],
        id: row[8]
      }));
  }

  async loadTransfers(month = null) {
    const rows = await this.readFromSheet(this.SHEETS.TRANSFERS);
    if (rows.length <= 1) return [];
    
    return rows.slice(1)
      .filter(row => !month || row[0] === month)
      .map(row => ({
        month: row[0],
        from: row[1],
        to: row[2],
        amount: parseFloat(row[3]) || 0,
        description: row[4],
        date: row[5],
        id: row[6],
        type: 'transfer'
      }));
  }

  async loadBudgets(month = null) {
    const rows = await this.readFromSheet(this.SHEETS.BUDGETS);
    if (rows.length <= 1) return [];
    
    return rows.slice(1)
      .filter(row => !month || row[0] === month)
      .map(row => ({
        month: row[0],
        category: row[1],
        envelope: row[2],
        budgeted: parseFloat(row[3]) || 0,
        spent: parseFloat(row[4]) || 0
      }));
  }

  async loadAllData(month = null) {
    const [income, expenses, transfers, budgets] = await Promise.all([
      this.loadIncome(month),
      this.loadExpenses(month),
      this.loadTransfers(month),
      this.loadBudgets(month)
    ]);
    
    const transactions = [...income, ...expenses, ...transfers];
    
    return {
      transactions,
      budgets,
      currentPeriod: month || this.getCurrentPeriod()
    };
  }

  getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  clearCache() {
    this.cache.clear();
  }

  logout() {
    this.accessToken = null;
    this.clearCache();
  }
}

export const googleSheetsService = new OptimizedGoogleSheetsService();