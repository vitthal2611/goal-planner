# Google OAuth 2.0 Setup Guide

## Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (goal-planner-b604e)
3. Navigate to **APIs & Services > Credentials**
4. Click **+ Create Credentials > OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (if using different port)
   - Your production domain (e.g., `https://yourdomain.com`)
7. Add Authorized redirect URIs:
   - `http://localhost:5173` (development)
   - Your production domain
8. Click **Create**
9. Copy the **Client ID** (not the secret)

## Step 2: Update Environment Variables

1. Open `.env` file in your project root
2. Replace `YOUR_OAUTH_CLIENT_ID_HERE` with your actual Client ID:
   ```
   VITE_GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID_HERE
   VITE_GOOGLE_SHEETS_ID=1Eqa25EkEi4zj2wCGDamuYsDK6blEUHfbAnENqE9Nvsw
   ```

## Step 3: Share Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Eqa25EkEi4zj2wCGDamuYsDK6blEUHfbAnENqE9Nvsw
2. Click **Share** button
3. Add the email address of your Google account (the one you'll use to test)
4. Give it **Editor** access
5. Click **Share**

## Step 4: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services > Library**
4. Search for "Google Sheets API"
5. Click on it and press **Enable**

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Log in with your Firebase credentials
3. The app will automatically request Google Sheets access
4. A popup will appear asking for permission to access your Google Sheets
5. Click **Allow**
6. The app should now be able to read/write to your Google Sheet

## How It Works

- When you log in, the app initializes the Google OAuth token client
- When you interact with payment methods or other sheet data, the app requests an access token
- The access token is used to authenticate all Google Sheets API requests
- No API key is exposed in the browser
- Each user authenticates with their own Google account

## Troubleshooting

**"The caller does not have permission" error:**
- Make sure the Google Sheet is shared with your Google account
- Verify the OAuth Client ID is correct in `.env`
- Check that Google Sheets API is enabled in Google Cloud Console

**"Google OAuth library not loaded" error:**
- Make sure the Google GSI script is loaded in `index.html`
- Check browser console for any script loading errors

**Token request timeout:**
- The user may have declined the permission request
- Try logging out and logging back in
- Check browser console for detailed error messages
