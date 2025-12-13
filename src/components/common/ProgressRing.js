import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const ProgressRing = ({ progress, size = 120, thickness = 6, label, subtitle }) => {
  const getColor = (percentage) => {
    if (percentage >= 90) return 'success.main';
    if (percentage >= 70) return 'primary.main';
    if (percentage >= 50) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', m: 2 }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(progress, 100)}
        size={size}
        thickness={thickness}
        sx={{ color: getColor(progress) }}
      />
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600 }}>
          {Math.round(progress)}%
        </Typography>
        {label && (
          <Typography variant="caption" color="text.secondary" align="center">
            {label}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" align="center">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};