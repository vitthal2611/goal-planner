const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SPREADSHEET_NAME = 'Budget Tracker';

class SheetsAPI {
  constructor() {
    this.tokenClient = null;
    this.accessToken = null;
    this.spreadsheetId = null;
    this.gapiInited = false;
    this.gisInited = false;
  }

  async initialize() {
    await this.loadGapi();
    await this.loadGis();
    await this.initializeGapi();
    this.initializeGis();
  }

  loadGapi() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadGis() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async initializeGapi() {
    await new Promise((resolve) => window.gapi.load('client', resolve));
    await window.gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });
    this.gapiInited = true;
  }

  initializeGis() {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '',
    });
    this.gisInited = true;
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.accessToken = response.access_token;
          window.gapi.client.setToken({ access_token: this.accessToken });
          resolve(this.accessToken);
        }
      };
      this.tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  async findOrCreateSpreadsheet() {
    if (this.spreadsheetId) return this.spreadsheetId;

    try {
      const response = await window.gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/files',
        params: {
          q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
          fields: 'files(id, name)',
          pageSize: 1,
        },
      });

      if (response.result.files?.length > 0) {
        this.spreadsheetId = response.result.files[0].id;
        await this.ensureSheets();
        return this.spreadsheetId;
      }

      const createResponse = await window.gapi.client.sheets.spreadsheets.create({
        properties: { title: SPREADSHEET_NAME },
        sheets: [
          { properties: { title: 'Transactions' } },
          { properties: { title: 'Budgets' } },
          { properties: { title: 'PaymentMethods' } },
        ],
      });

      this.spreadsheetId = createResponse.result.spreadsheetId;
      await this.initializeHeaders();
      return this.spreadsheetId;
    } catch (error) {
      console.error('Error finding/creating spreadsheet:', error);
      throw error;
    }
  }

  async ensureSheets() {
    const response = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const existingSheets = response.result.sheets.map(s => s.properties.title);
    const requiredSheets = ['Transactions', 'Budgets', 'PaymentMethods'];

    for (const sheetName of requiredSheets) {
      if (!existingSheets.includes(sheetName)) {
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [{ addSheet: { properties: { title: sheetName } } }],
          },
        });
      }
    }

    await this.initializeHeaders();
  }

  async initializeHeaders() {
    const headers = {
      Transactions: ['Month', 'Type', 'Description', 'Envelope', 'Amount', 'Payment Method', 'Date', 'ID'],
      Budgets: ['Month', 'Envelope', 'Budgeted', 'Spent'],
      PaymentMethods: ['Name', 'Type', 'Active'],
    };

    for (const [sheetName, headerRow] of Object.entries(headers)) {
      try {
        const checkResponse = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:H1`,
        });

        if (!checkResponse.result.values?.length) {
          await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            resource: { values: [headerRow] },
          });
        }
      } catch (error) {
        console.error(`Error initializing headers for ${sheetName}:`, error);
      }
    }
  }

  async appendRow(sheetName, values) {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:H`,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    });
  }

  async getSheetData(sheetName, range = 'A:H') {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!${range}`,
    });
    return response.result.values || [];
  }

  async updateRow(sheetName, rowIndex, values) {
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    });
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  logout() {
    this.accessToken = null;
    if (window.gapi?.client?.setToken) {
      window.gapi.client.setToken(null);
    }
  }
}

export const sheetsAPI = new SheetsAPI();
