import React from 'react';
import { Button, Avatar, Box, Typography, CircularProgress } from '@mui/material';
import { Google as GoogleIcon, CloudDone, CloudOff } from '@mui/icons-material';

const AuthButton = ({ user, loading, syncing, onSignIn, onSignOut }) => {
  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {syncing ? (
          <CloudOff color="action" />
        ) : (
          <CloudDone color="success" />
        )}
        <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }} />
        <Typography variant="body2">{user.displayName}</Typography>
        <Button size="small" onClick={onSignOut}>
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <Button
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={onSignIn}
    >
      Sign In to Sync
    </Button>
  );
};

export default AuthButton;
