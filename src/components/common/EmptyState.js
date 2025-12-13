import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const EmptyState = ({ 
  icon = '✨', 
  title, 
  message, 
  action 
}) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        border: '2px dashed',
        borderColor: 'divider',
        textAlign: 'center',
        bgcolor: 'grey.50'
      }}
    >
      <CardContent sx={{ py: 8, px: 4 }}>
        <Box sx={{ fontSize: '3rem', mb: 2, opacity: 0.6 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 3 : 0, maxWidth: 400, mx: 'auto' }}>
          {message}
        </Typography>
        {action && action}
      </CardContent>
    </Card>
  );
};
