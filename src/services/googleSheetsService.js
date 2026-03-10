const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

class GoogleSheetsService {
  constructor() {
    this.accessToken = null;
    this.tokenClient = null;
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
    this.cache = new Map();
    this.CACHE_TTL = 60000; // Increased cache time for better performance
    this.requestQueue = [];
    this.processing = false;
    
    this.SHEETS = {
      TRANSACTIONS: 'Transactions',
      BUDGETS: 'Budgets', 
      PAYMENT_METHODS: 'PaymentMethods'
    };
  }

  async initialize() {
    try {
      if (!window.google?.accounts?.oauth2) {
        await this.loadGoogleScript();
      }
      
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.join(' '),
        callback: ''
      });
      
      return true;
    } catch (error) {
      console.error('Initialize error:', error);
      throw new Error('Failed to initialize Google Sheets service');
    }
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
      this.tokenClient.callback = async (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.accessToken = response.access_token;
          
          // Initialize spreadsheet after getting token
          try {
            if (!this.spreadsheetId) {
              this.spreadsheetId = await this.createSpreadsheet();
            }
            await this.ensureSheets();
            resolve(this.accessToken);
          } catch (error) {
            reject(error);
          }
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
        properties: { title: 'Budget Planner - Google Sheets Dashboard' }
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
    return this.queueRequest(async () => {
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
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to write to ${sheetName}: ${error}`);
      }
      
      this.invalidateCache(sheetName);
      return response.json();
    });
  }

  async appendToSheet(sheetName, values) {
    return this.queueRequest(async () => {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${BASE_URL}/${this.spreadsheetId}/values/${sheetName}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ values: [values] })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to append to ${sheetName}: ${error}`);
      }
      
      this.invalidateCache(sheetName);
      return response.json();
    });
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

  // Budget operations
  async saveBudget(budget, month) {
    const existingBudgets = await this.loadBudgets(month);
    const existingIndex = existingBudgets.findIndex(
      b => b.category === budget.category && b.envelope === budget.envelope
    );
    
    if (existingIndex >= 0) {
      const rowIndex = existingIndex + 2;
      await this.writeToSheet(this.SHEETS.BUDGETS, `A${rowIndex}:E${rowIndex}`, [[
        month, budget.category, budget.envelope, budget.budgeted, budget.spent
      ]]);
    } else {
      await this.appendToSheet(this.SHEETS.BUDGETS, [
        month, budget.category, budget.envelope, budget.budgeted, budget.spent
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

  // Load operations
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

  async loadPaymentMethods() {
    const rows = await this.readFromSheet(this.SHEETS.PAYMENT_METHODS);
    if (rows.length <= 1) return [];
    
    return rows.slice(1).map(row => ({
      name: row[0],
      type: row[1] || 'card',
      active: row[2] !== 'false'
    }));
  }

  async loadAllData(month = null) {
    const [transactions, budgets, paymentMethods] = await Promise.all([
      this.loadTransactions(month),
      this.loadBudgets(month),
      this.loadPaymentMethods()
    ]);
    
    return { transactions, budgets, paymentMethods, currentPeriod: month || this.getCurrentPeriod() };
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

  // Request queue for better performance
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      
      try {
        const result = await requestFn();
        resolve(result);
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }

  invalidateCache(sheetName = null) {
    if (sheetName) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(sheetName)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  clearCache() {
    this.cache.clear();
  }

  logout() {
    this.accessToken = null;
    this.clearCache();
  }
}

export const googleSheetsService = new GoogleSheetsService();