import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const EmptyState = ({ 
  icon = '✨', 
  title, 
  message, 
  action 
}) => {
  return (
    <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
      <CardContent sx={{ p: 6 }}>
        <Box sx={{ fontSize: '3rem', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h3" sx={{ mb: 2, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: action ? 3 : 0 }}>
          {message}
        </Typography>
        {action && (
          <Box sx={{ mt: 3 }}>
            {action}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
