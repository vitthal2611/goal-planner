const SPREADSHEET_NAME = 'Budget Tracker';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let accessToken = null;
let spreadsheetId = null;

export const initGoogleAuth = (clientId) => {
  return new Promise((resolve) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          resolve(true);
        }
      },
    });
    resolve(false);
  });
};

export const authorize = () => {
  return new Promise((resolve) => {
    tokenClient.callback = (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
        resolve(true);
      } else {
        resolve(false);
      }
    };
    tokenClient.requestAccessToken({ prompt: '' });
  });
};

export const isAuthorized = () => !!accessToken;

const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  return response.json();
};

const findOrCreateSpreadsheet = async () => {
  if (spreadsheetId) return spreadsheetId;

  // Search for existing spreadsheet
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
  const searchResult = await apiCall(searchUrl);

  if (searchResult.files && searchResult.files.length > 0) {
    spreadsheetId = searchResult.files[0].id;
    return spreadsheetId;
  }

  // Create new spreadsheet
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const createResult = await apiCall(createUrl, {
    method: 'POST',
    body: JSON.stringify({
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        { properties: { title: 'Transactions', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Envelopes', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'PaymentMethods', gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });

  spreadsheetId = createResult.spreadsheetId;

  // Initialize headers
  await batchUpdate([
    { range: 'Transactions!A1:F1', values: [['Month', 'Type', 'Description', 'Envelope', 'Amount', 'Payment Method']] },
    { range: 'Envelopes!A1:C1', values: [['Name', 'Month', 'Budget']] },
    { range: 'PaymentMethods!A1:B1', values: [['Name', 'Type']] },
  ]);

  return spreadsheetId;
};

export const batchUpdate = async (data) => {
  const id = await findOrCreateSpreadsheet();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchUpdate`;
  return apiCall(url, {
    method: 'POST',
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: data.map(d => ({ range: d.range, values: d.values })),
    }),
  });
};

export const getSheetData = async (range) => {
  const id = await findOrCreateSpreadsheet();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}`;
  const result = await apiCall(url);
  return result.values || [];
};

export const appendRow = async (sheet, values) => {
  const id = await findOrCreateSpreadsheet();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${sheet}!A:Z:append?valueInputOption=USER_ENTERED`;
  return apiCall(url, {
    method: 'POST',
    body: JSON.stringify({ values: [values] }),
  });
};

export const updateRow = async (range, values) => {
  const id = await findOrCreateSpreadsheet();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?valueInputOption=USER_ENTERED`;
  return apiCall(url, {
    method: 'PUT',
    body: JSON.stringify({ values: [values] }),
  });
};

export const deleteRow = async (sheet, rowIndex) => {
  const id = await findOrCreateSpreadsheet();
  const sheetId = await getSheetId(sheet);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}:batchUpdate`;
  return apiCall(url, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 }
        }
      }]
    }),
  });
};

const getSheetId = async (sheetName) => {
  const id = await findOrCreateSpreadsheet();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}`;
  const result = await apiCall(url);
  const sheet = result.sheets.find(s => s.properties.title === sheetName);
  return sheet?.properties?.sheetId || 0;
};
