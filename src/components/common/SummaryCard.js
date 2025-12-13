import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export const SummaryCard = ({ title, value, subtitle, color = 'primary' }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h2" 
          color={`${color}.main`} 
          sx={{ mb: 1.5, fontWeight: 700 }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};