import { useEffect, useState } from 'react';
import { googleOAuthService } from '../services/googleOAuthService';

export const useGoogleOAuth = () => {
  const [oauthReady, setOauthReady] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initOAuth = async () => {
      try {
        await googleOAuthService.initializeTokenClient();
        setOauthReady(true);
      } catch (err) {
        console.error('OAuth initialization error:', err);
        setError(err.message);
        setOauthReady(true);
      }
    };

    let timeout;
    const checkGoogleLoaded = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(checkGoogleLoaded);
        clearTimeout(timeout);
        initOAuth();
      }
    }, 100);

    timeout = setTimeout(() => {
      clearInterval(checkGoogleLoaded);
      setOauthReady(true);
      setError('Google OAuth library failed to load');
    }, 5000);

    return () => {
      clearInterval(checkGoogleLoaded);
      clearTimeout(timeout);
    };
  }, []);

  const logout = async () => {
    googleOAuthService.clearAccessToken();
    setUser(null);
  };

  const login = async () => {
    try {
      setError(null);
      const token = await googleOAuthService.getAccessToken();
      if (token) {
        setUser({ authenticated: true });
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return false;
    }
  };

  return { oauthReady, error, user, logout, login };
};
