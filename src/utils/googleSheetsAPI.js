import { googleOAuthService } from '../services/googleOAuthService';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

const getHeaders = async () => {
  const token = await googleOAuthService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const googleSheetsAPI = {
  async readSheet(range = 'Sheet1!A:C') {
    const headers = await getHeaders();
    const url = `${BASE_URL}/${SHEET_ID}/values/${range}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to read from Google Sheets');
    const data = await response.json();
    return data.values || [];
  },

  async writeSheet(range, values) {
    const headers = await getHeaders();
    const url = `${BASE_URL}/${SHEET_ID}/values/${range}?valueInputOption=RAW`;
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ values })
    });
    if (!response.ok) throw new Error('Failed to write to Google Sheets');
    return await response.json();
  },

  async appendSheet(range, values) {
    const headers = await getHeaders();
    const url = `${BASE_URL}/${SHEET_ID}/values/${range}:append?valueInputOption=RAW`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ values })
    });
    if (!response.ok) throw new Error('Failed to append to Google Sheets');
    return await response.json();
  },

  async clearSheet(range) {
    const headers = await getHeaders();
    const url = `${BASE_URL}/${SHEET_ID}/values/${range}:clear`;
    const response = await fetch(url, {
      method: 'POST',
      headers
    });
    if (!response.ok) throw new Error('Failed to clear Google Sheets');
    return await response.json();
  }
};
