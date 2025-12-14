import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert
} from '@mui/material';

export const ArchiveYearDialog = ({ open, onClose, onConfirm, year }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Archive Year {year}?</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone
        </Alert>
        <Typography variant="body1" paragraph>
          Archiving year {year} will:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>Make all data read-only</li>
          <li>Hide it from the default year selector</li>
          <li>Move it to "Archived Years" section</li>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Archive Year
        </Button>
      </DialogActions>
    </Dialog>
  );
};