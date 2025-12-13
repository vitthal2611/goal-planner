import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Stack, Divider, Alert, CircularProgress } from '@mui/material';
import { Google, FlagOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      isSignup ? await signup(email, password) : await login(email, password);
    } catch (err) {
      setError(err.code === 'auth/user-not-found' ? 'No account found with this email' :
               err.code === 'auth/wrong-password' ? 'Incorrect password' :
               err.code === 'auth/email-already-in-use' ? 'Email already in use' :
               err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FlagOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isSignup ? 'Start tracking your goals today' : 'Continue your journey'}
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading}
                required 
                fullWidth 
              />
              <TextField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={loading}
                helperText={isSignup ? 'Minimum 6 characters' : ''}
                required 
                fullWidth 
              />
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loading} 
                fullWidth
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (isSignup ? 'Sign Up' : 'Log In')}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button 
            variant="outlined" 
            startIcon={loading ? null : <Google />} 
            onClick={handleGoogleLogin} 
            disabled={loading} 
            fullWidth
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Continue with Google'}
          </Button>

          <Button 
            onClick={() => { setIsSignup(!isSignup); setError(''); }} 
            sx={{ mt: 2.5 }} 
            fullWidth
            disabled={loading}
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
