import { useState, useEffect } from 'react';
import { googleSheetsService } from '../services/optimizedGoogleSheetsService.js';

export function useOptimizedGoogleOAuth() {
  const [oauthReady, setOauthReady] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeOAuth = async () => {
      try {
        // Wait for Google OAuth library to load
        if (!window.google?.accounts?.oauth2) {
          // Load Google OAuth library
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          
          script.onload = async () => {
            try {
              await googleSheetsService.initialize();
              setOauthReady(true);
              setError(null);
            } catch (err) {
              setError(err.message);
              setOauthReady(false);
            } finally {
              setLoading(false);
            }
          };
          
          script.onerror = () => {
            setError('Failed to load Google OAuth library');
            setOauthReady(false);
            setLoading(false);
          };
          
          document.head.appendChild(script);
        } else {
          await googleSheetsService.initialize();
          setOauthReady(true);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setOauthReady(false);
        setLoading(false);
      }
    };

    initializeOAuth();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await googleSheetsService.getAccessToken();
      
      if (token) {
        setUser({ 
          authenticated: true, 
          token,
          email: 'Google Sheets User' // We don't need actual user info for sheets access
        });
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      googleSheetsService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    oauthReady,
    user,
    error,
    loading,
    login,
    logout
  };
}