import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

export const YearComparisonCard = ({ title, currentValue, previousValue, unit = '%', format = 'percentage' }) => {
  const difference = currentValue - previousValue;
  const percentageChange = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
  
  const getTrendIcon = () => {
    if (Math.abs(percentageChange) < 1) return <TrendingFlat />;
    return percentageChange > 0 ? <TrendingUp /> : <TrendingDown />;
  };
  
  const getTrendColor = () => {
    if (Math.abs(percentageChange) < 1) return 'default';
    return percentageChange > 0 ? 'success' : 'error';
  };
  
  const formatValue = (value) => {
    if (format === 'percentage') return `${Math.round(value)}${unit}`;
    if (format === 'number') return `${value}${unit}`;
    return `${value.toFixed(1)}${unit}`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" color="primary">
            {formatValue(currentValue)}
          </Typography>
          <Chip
            icon={getTrendIcon()}
            label={`${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`}
            color={getTrendColor()}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Previous year: {formatValue(previousValue)}
        </Typography>
      </CardContent>
    </Card>
  );
};