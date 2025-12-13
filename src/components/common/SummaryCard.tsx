import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  color = 'primary'
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3" color={`${color}.main`} sx={{ mb: 1, fontWeight: 700 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};