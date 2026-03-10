# Quick Setup Guide

## 1. Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create/select project
3. Enable **Google Sheets API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized origins: `http://localhost:5173`

## 2. Environment Variables
Create `.env` file:
```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

## 3. Test
Run `npm run dev` - app will prompt for Google authorization on first use.

That's it! The app automatically creates spreadsheets and sheets as needed.