import { googleAuth } from './googleAuth.js';

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const SPREADSHEET_NAME = 'Budget Tracker';

class GoogleSheetsAPI {
  constructor() {
    this.spreadsheetId = null;
    this.cache = new Map();
    this.CACHE_TTL = 30000;
    
    this.SHEETS = {
      TRANSACTIONS: 'Transactions',
      BUDGETS: 'Budgets',
      ENVELOPES: 'Envelopes',
      PAYMENT_METHODS: 'PaymentMethods'
    };
  }

  async initialize() {
    await googleAuth.initialize();
    this.spreadsheetId = await this.findOrCreateSpreadsheet();
    await this.ensureSheets();
  }

  async findOrCreateSpreadsheet() {
    const token = await googleAuth.getAccessToken();
    
    // Search for existing spreadsheet
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and trashed=false&spaces=drive&pageSize=1`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files?.length > 0) {
        return data.files[0].id;
      }
    }

    // Create new spreadsheet
    const createRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        properties: { title: SPREADSHEET_NAME }
      })
    });

    if (!createRes.ok) throw new Error('Failed to create spreadsheet');
    const data = await createRes.json();
    return data.spreadsheetId;
  }

  async ensureSheets() {
    const token = await googleAuth.getAccessToken();
    const res = await fetch(`${BASE_URL}/${this.spreadsheetId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to get spreadsheet');
    const data = await res.json();
    const existingSheets = data.sheets.map(s => s.properties.title);

    for (const [key, sheetName] of Object.entries(this.SHEETS)) {
      if (!existingSheets.includes(sheetName)) {
        await this.createSheet(sheetName);
        await this.initializeHeaders(sheetName);
      }
    }
  }

  async createSheet(title) {
    const token = await googleAuth.getAccessToken();
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
      [this.SHEETS.TRANSACTIONS]: ['Month', 'Type', 'Description', 'Envelope', 'Amount', 'Payment Method', 'Date', 'ID'],
      [this.SHEETS.BUDGETS]: ['Month', 'Envelope', 'Budgeted', 'Spent'],
      [this.SHEETS.ENVELOPES]: ['Name', 'Active'],
      [this.SHEETS.PAYMENT_METHODS]: ['Name', 'Type', 'Active']
    };

    if (headers[sheetName]) {
      await this.writeRange(sheetName, 'A1', [headers[sheetName]]);
    }
  }

  async writeRange(sheetName, range, values) {
    const token = await googleAuth.getAccessToken();
    const fullRange = `${sheetName}!${range}`;

    const res = await fetch(`${BASE_URL}/${this.spreadsheetId}/values/${fullRange}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ values })
    });

    if (!res.ok) throw new Error(`Failed to write to ${sheetName}`);
    this.clearCache();
  }

  async appendRow(sheetName, values) {
    const token = await googleAuth.getAccessToken();

    const res = await fetch(`${BASE_URL}/${this.spreadsheetId}/values/${sheetName}:append?valueInputOption=RAW`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ values: [values] })
    });

    if (!res.ok) throw new Error(`Failed to append to ${sheetName}`);
    this.clearCache();
  }

  async readSheet(sheetName, range = 'A:Z') {
    const cacheKey = `${sheetName}_${range}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const token = await googleAuth.getAccessToken();
    const res = await fetch(`${BASE_URL}/${this.spreadsheetId}/values/${sheetName}!${range}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Failed to read from ${sheetName}`);
    const data = await res.json();
    const values = data.values || [];

    this.cache.set(cacheKey, { data: values, timestamp: Date.now() });
    return values;
  }

  // Transaction operations
  async addTransaction(month, type, description, envelope, amount, paymentMethod) {
    const row = [
      month,
      type,
      description,
      envelope,
      amount,
      paymentMethod,
      new Date().toISOString(),
      this.generateId()
    ];
    await this.appendRow(this.SHEETS.TRANSACTIONS, row);
  }

  async getTransactions(month) {
    const rows = await this.readSheet(this.SHEETS.TRANSACTIONS);
    if (rows.length <= 1) return [];

    return rows.slice(1)
      .filter(row => row[0] === month)
      .map(row => ({
        month: row[0],
        type: row[1],
        description: row[2],
        envelope: row[3],
        amount: parseFloat(row[4]) || 0,
        paymentMethod: row[5],
        date: row[6],
        id: row[7]
      }));
  }

  // Budget operations
  async setBudget(month, envelope, budgeted) {
    const rows = await this.readSheet(this.SHEETS.BUDGETS);
    const existingIndex = rows.findIndex(row => row[0] === month && row[1] === envelope);

    if (existingIndex >= 0) {
      const rowNum = existingIndex + 1;
      await this.writeRange(this.SHEETS.BUDGETS, `A${rowNum}:D${rowNum}`, [[month, envelope, budgeted, 0]]);
    } else {
      await this.appendRow(this.SHEETS.BUDGETS, [month, envelope, budgeted, 0]);
    }
  }

  async getBudgets(month) {
    const rows = await this.readSheet(this.SHEETS.BUDGETS);
    if (rows.length <= 1) return [];

    return rows.slice(1)
      .filter(row => row[0] === month)
      .map(row => ({
        month: row[0],
        envelope: row[1],
        budgeted: parseFloat(row[2]) || 0,
        spent: parseFloat(row[3]) || 0
      }));
  }

  // Envelope operations
  async addEnvelope(name) {
    const rows = await this.readSheet(this.SHEETS.ENVELOPES);
    if (!rows.slice(1).find(row => row[0] === name)) {
      await this.appendRow(this.SHEETS.ENVELOPES, [name, true]);
    }
  }

  async getEnvelopes() {
    const rows = await this.readSheet(this.SHEETS.ENVELOPES);
    if (rows.length <= 1) return [];

    return rows.slice(1)
      .filter(row => row[1] !== 'false')
      .map(row => row[0]);
  }

  // Payment method operations
  async addPaymentMethod(name, type = 'Bank') {
    const rows = await this.readSheet(this.SHEETS.PAYMENT_METHODS);
    if (!rows.slice(1).find(row => row[0] === name)) {
      await this.appendRow(this.SHEETS.PAYMENT_METHODS, [name, type, true]);
    }
  }

  async getPaymentMethods() {
    const rows = await this.readSheet(this.SHEETS.PAYMENT_METHODS);
    if (rows.length <= 1) return [];

    return rows.slice(1)
      .filter(row => row[2] !== 'false')
      .map(row => ({ name: row[0], type: row[1] }));
  }

  // Utility
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  clearCache() {
    this.cache.clear();
  }

  logout() {
    googleAuth.logout();
    this.clearCache();
  }
}

export const sheetsAPI = new GoogleSheetsAPI();
