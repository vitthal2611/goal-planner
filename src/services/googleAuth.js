const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

class GoogleAuth {
  constructor() {
    this.accessToken = null;
    this.tokenClient = null;
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
  }

  loadGoogleScript() {
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

  logout() {
    this.accessToken = null;
  }
}

export const googleAuth = new GoogleAuth();
