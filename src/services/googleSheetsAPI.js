const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];
const SPREADSHEET_NAME = 'Budget Tracker';
const SHEETS = {
  TRANSACTIONS: 'Transactions',
  BUDGETS: 'Budgets',
  ENVELOPES: 'Envelopes',
  PAYMENT_METHODS: 'PaymentMethods'
};

let tokenClient;
let accessToken = null;
let spreadsheetId = null;

export const googleSheetsAPI = {
  getAccessToken() {
    return accessToken;
  },

  setAccessToken(token) {
    accessToken = token;
  },

  async initialize() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  },

  async authenticate() {
    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
          scope: SCOPES.join(' '),
          callback: (response) => {
            if (response.access_token) {
              accessToken = response.access_token;
              resolve(accessToken);
            } else {
              reject(new Error('Authentication failed'));
            }
          },
          error_callback: (error) => {
            reject(new Error(`OAuth error: ${error.type}`));
          }
        });
      }
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  async ensureSpreadsheet() {
    if (spreadsheetId) return spreadsheetId;

    try {
      const existingId = await this.findSpreadsheet(SPREADSHEET_NAME);
      if (existingId) {
        spreadsheetId = existingId;
        return existingId;
      }

      const newId = await this.createSpreadsheet(SPREADSHEET_NAME);
      spreadsheetId = newId;
      await this.initializeSheets(newId);
      return newId;
    } catch (error) {
      throw new Error(`Failed to ensure spreadsheet: ${error.message}`);
    }
  },

  async findSpreadsheet(name) {
    if (!accessToken) throw new Error('Not authenticated');
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${name}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&spaces=drive&fields=files(id)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to find spreadsheet');
    }
    const data = await response.json();
    return data.files?.[0]?.id || null;
  },

  async createSpreadsheet(name) {
    if (!accessToken) throw new Error('Not authenticated');
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties: { title: name } })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create spreadsheet');
    }
    const data = await response.json();
    return data.spreadsheetId;
  },

  async initializeSheets(id) {
    if (!accessToken) throw new Error('Not authenticated');
    const requests = Object.values(SHEETS).map(title => ({
      addSheet: { properties: { title } }
    }));

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to initialize sheets');
    }

    await this.addHeaders(id);
  },

  async addHeaders(id) {
    if (!accessToken) throw new Error('Not authenticated');
    const updates = [
      {
        range: `${SHEETS.TRANSACTIONS}!A1:F1`,
        values: [['Month', 'Type', 'Description', 'Envelope', 'Amount', 'Payment Method']]
      },
      {
        range: `${SHEETS.BUDGETS}!A1:C1`,
        values: [['Month', 'Envelope', 'Amount']]
      },
      {
        range: `${SHEETS.ENVELOPES}!A1:B1`,
        values: [['Name', 'Active']]
      },
      {
        range: `${SHEETS.PAYMENT_METHODS}!A1:B1`,
        values: [['Name', 'Active']]
      }
    ];

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: updates, valueInputOption: 'RAW_INPUT' })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add headers');
    }
  },

  async addTransaction(month, type, description, envelope, amount, paymentMethod) {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const values = [[month, type, description, envelope, amount, paymentMethod]];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.TRANSACTIONS}:append?valueInputOption=RAW_INPUT`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add transaction');
    }
    return response.json();
  },

  async getTransactions(month = null) {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.TRANSACTIONS}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get transactions');
    }
    const data = await response.json();
    const rows = data.values || [];
    if (rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      month: row[0],
      type: row[1],
      description: row[2],
      envelope: row[3],
      amount: parseFloat(row[4]) || 0,
      paymentMethod: row[5]
    })).filter(t => !month || t.month === month);
  },

  async addBudget(month, envelope, amount) {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const existing = await this.getBudgets(month);
    
    const existingBudget = existing.find(b => b.envelope === envelope);
    if (existingBudget) {
      await this.updateBudget(month, envelope, amount);
      return;
    }

    const values = [[month, envelope, amount]];
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.BUDGETS}:append?valueInputOption=RAW_INPUT`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add budget');
    }
  },

  async updateBudget(month, envelope, amount) {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.BUDGETS}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get budgets');
    }
    const data = await response.json();
    const rows = data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === month && r[1] === envelope);

    if (rowIndex > -1) {
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.BUDGETS}!A${rowIndex + 1}:C${rowIndex + 1}?valueInputOption=RAW_INPUT`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [[month, envelope, amount]] })
        }
      );
      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error?.message || 'Failed to update budget');
      }
    }
  },

  async getBudgets(month = null) {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.BUDGETS}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get budgets');
    }
    const data = await response.json();
    const rows = data.values || [];
    if (rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      month: row[0],
      envelope: row[1],
      amount: parseFloat(row[2]) || 0
    })).filter(b => !month || b.month === month);
  },

  async addEnvelope(name) {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const existing = await this.getEnvelopes();
    
    if (existing.find(e => e.name === name)) return;

    const values = [[name, true]];
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.ENVELOPES}:append?valueInputOption=RAW_INPUT`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add envelope');
    }
  },

  async getEnvelopes() {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.ENVELOPES}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get envelopes');
    }
    const data = await response.json();
    const rows = data.values || [];
    if (rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      name: row[0],
      active: row[1] !== false
    })).filter(e => e.active);
  },

  async addPaymentMethod(name) {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const existing = await this.getPaymentMethods();
    
    if (existing.find(p => p.name === name)) return;

    const values = [[name, true]];
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.PAYMENT_METHODS}:append?valueInputOption=RAW_INPUT`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add payment method');
    }
  },

  async getPaymentMethods() {
    if (!accessToken) throw new Error('Not authenticated');
    const id = await this.ensureSpreadsheet();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${SHEETS.PAYMENT_METHODS}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get payment methods');
    }
    const data = await response.json();
    const rows = data.values || [];
    if (rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      name: row[0],
      active: row[1] !== false
    })).filter(p => p.active);
  },

  logout() {
    accessToken = null;
    spreadsheetId = null;
  }
};
