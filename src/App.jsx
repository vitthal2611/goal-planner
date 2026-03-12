import React, { useState, useEffect } from 'react';
import { initGoogleAuth, authorize, isAuthorized } from './services/googleSheets';
import QuickTrackUI from './components/QuickTrackUI';
import './App.css';

const App = () => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initGoogleAuth(import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID);
      setAuthorized(isAuthorized());
      setLoading(false);
    };
    init();
  }, []);

  const handleAuthorize = async () => {
    setLoading(true);
    const success = await authorize();
    setAuthorized(success);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>💰 Budget Planner</h1>
          <p>Manage your budget with Google Sheets</p>
          <button onClick={handleAuthorize} className="btn-primary">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return <QuickTrackUI />;
};

export default App;
