import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  Psychology,
  Target
} from '@mui/icons-material';

export const NextYearSuggestionCard = ({ suggestion, onApply }) => {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'increase': return <TrendingUp />;
      case 'focus': return <Target />;
      case 'habit': return <Psychology />;
      default: return <Lightbulb />;
    }
  };

  const getColor = () => {
    switch (suggestion.type) {
      case 'increase': return 'success';
      case 'focus': return 'primary';
      case 'habit': return 'secondary';
      default: return 'info';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ color: `${getColor()}.main`, mt: 0.5 }}>
            {getIcon()}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6">{suggestion.title}</Typography>
              <Chip
                label={suggestion.category}
                color={getColor()}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {suggestion.message}
            </Typography>
            
            {suggestion.actionable && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => onApply(suggestion)}
              >
                Apply Suggestion
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};