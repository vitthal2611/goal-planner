import React from 'react';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';

export const SummaryCard = ({ title, value, subtitle, color = 'primary' }) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': { 
          boxShadow: 4,
          borderColor: `${color}.main`
        }
      }}
    >
      <CardHeader 
        title={title}
        titleTypographyProps={{ 
          variant: 'overline',
          color: 'text.secondary'
        }}
        sx={{ pb: 1.5 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h2" color={`${color}.main`} sx={{ mb: 1.5, fontWeight: 700 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};