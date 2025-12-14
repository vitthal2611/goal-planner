import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import { Warning } from '@mui/icons-material';

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, warnings = [], confirmText = 'Confirm', cancelText = 'Cancel', severity = 'warning' }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color={severity} />
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        {warnings.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {warnings.map((warning, index) => (
              <Alert key={index} severity={severity} sx={{ mb: 1 }}>
                {warning}
              </Alert>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={severity}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
