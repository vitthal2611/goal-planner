const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let tokenClient;
let accessToken = null;

export const googleOAuthService = {
  async initializeTokenClient() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(' '),
          callback: '' // Will be set when requesting token
        });
        resolve(tokenClient);
      } else {
        reject(new Error('Google OAuth library not loaded'));
      }
    });
  },

  async getAccessToken() {
    if (accessToken) return accessToken;
    
    if (!tokenClient) {
      await this.initializeTokenClient();
    }
    
    return new Promise((resolve, reject) => {
      tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          accessToken = response.access_token;
          resolve(accessToken);
        }
      };
      
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  setAccessToken(token) {
    accessToken = token;
  },

  clearAccessToken() {
    accessToken = null;
  }
};
