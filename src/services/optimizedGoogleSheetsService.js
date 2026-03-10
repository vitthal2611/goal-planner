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
      TRANSACTIONS: 'Transactions',
      BUDGETS: 'Budgets', 
      PAYMENT_METHODS: 'PaymentMethods'
    };
  }

  async initialize() {
    if (!window.google?.accounts?.oauth2) {
      await this.loadGoogleScript();
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

  async loadGoogleScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
        properties: { title: 'Budget Planner Dashboard' }
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
    
    for (const sheetName of Object.values(this.SHEETS)) {
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
    const headers = {
      [this.SHEETS.TRANSACTIONS]: ['Month', 'Type', 'Description', 'Envelope', 'Category', 'Amount', 'Payment Method', 'Date', 'ID'],
      [this.SHEETS.BUDGETS]: ['Month', 'Category', 'Envelope', 'Budgeted', 'Spent'],
      [this.SHEETS.PAYMENT_METHODS]: ['Name', 'Type', 'Active']
    };
    
    if (headers[sheetName]) {
      await this.writeToSheet(sheetName, 'A1', [headers[sheetName]]);
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

  // Transaction operations
  async saveTransaction(transaction, month) {
    const id = this.generateId();
    const row = [
      month,
      transaction.type,
      transaction.description,
      transaction.envelope || '',
      transaction.category || '',
      transaction.amount,
      transaction.paymentMethod,
      new Date().toISOString(),
      id
    ];
    
    await this.appendToSheet(this.SHEETS.TRANSACTIONS, row);
    return { ...transaction, id, month };
  }

  // Budget operations with upsert logic
  async saveBudget(budget, month) {
    const existingBudgets = await this.loadBudgets(month);
    const existingIndex = existingBudgets.findIndex(
      b => b.category === budget.category && b.envelope === budget.envelope
    );
    
    if (existingIndex >= 0) {
      // Update existing budget
      const rowIndex = existingIndex + 2; // +2 for header and 1-based indexing
      await this.writeToSheet(this.SHEETS.BUDGETS, `A${rowIndex}:E${rowIndex}`, [[
        month, budget.category, budget.envelope, budget.budgeted, budget.spent || 0
      ]]);
    } else {
      // Create new budget
      await this.appendToSheet(this.SHEETS.BUDGETS, [
        month, budget.category, budget.envelope, budget.budgeted, budget.spent || 0
      ]);
    }
  }

  // Payment method operations
  async savePaymentMethod(method) {
    const existingMethods = await this.loadPaymentMethods();
    if (!existingMethods.find(m => m.name === method.name)) {
      await this.appendToSheet(this.SHEETS.PAYMENT_METHODS, [
        method.name, method.type || 'card', method.active !== false
      ]);
    }
  }

  // Load operations with optimized filtering
  async loadTransactions(month = null) {
    const rows = await this.readFromSheet(this.SHEETS.TRANSACTIONS);
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
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Latest first
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

  async loadPaymentMethods() {
    const rows = await this.readFromSheet(this.SHEETS.PAYMENT_METHODS);
    if (rows.length <= 1) return [];
    
    return rows.slice(1)
      .filter(row => row[2] !== 'false') // Only active methods
      .map(row => ({
        name: row[0],
        type: row[1] || 'card',
        active: row[2] !== 'false'
      }));
  }

  // Optimized data loading for dashboard
  async loadAllData(month = null) {
    const currentMonth = month || this.getCurrentPeriod();
    
    const [transactions, budgets, paymentMethods] = await Promise.all([
      this.loadTransactions(currentMonth),
      this.loadBudgets(currentMonth),
      this.loadPaymentMethods()
    ]);
    
    // Calculate spent amounts for budgets
    const spentByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const key = `${t.category}_${t.envelope}`;
        acc[key] = (acc[key] || 0) + t.amount;
        return acc;
      }, {});

    // Update budget spent amounts
    const updatedBudgets = budgets.map(budget => ({
      ...budget,
      spent: spentByCategory[`${budget.category}_${budget.envelope}`] || 0
    }));
    
    return { 
      transactions, 
      budgets: updatedBudgets, 
      paymentMethods, 
      currentPeriod: currentMonth 
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

export const optimizedGoogleSheetsService = new OptimizedGoogleSheetsService();