import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import AuthScreen from './components/Auth/AuthScreen';
import MainApp from './components/MainApp';

function App() {
  const { user, loading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f1f5f9'
      }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
      </div>
    );
  }

  return (
    <>
      {user ? <MainApp /> : <AuthScreen />}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '15px',
            fontWeight: '600'
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #10b981, #059669)'
            }
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)'
            }
          }
        }}
      />
    </>
  );
}

export default App;
