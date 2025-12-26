import React from 'react';
import { Box, Typography, Chip, LinearProgress, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown, CheckCircle, Whatshot } from '@mui/icons-material';

export const GoalMetrics = ({ goal, metrics }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'on-track': return 'primary';
      case 'behind': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Chip
        icon={metrics.onTrack ? <TrendingUp /> : <TrendingDown />}
        label={`${metrics.completionRate}%`}
        color={getStatusColor(metrics.status)}
        size="small"
      />
      <Tooltip title={`${metrics.daysRemaining} days remaining`}>
        <Chip
          label={`${metrics.daysRemaining}d`}
          size="small"
          variant="outlined"
        />
      </Tooltip>
      {metrics.status === 'behind' && (
        <Tooltip title={`Need ${metrics.requiredDailyRate} per day`}>
          <Chip
            label={`${metrics.requiredDailyRate}/day`}
            color="warning"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}
    </Box>
  );
};

export const HabitMetrics = ({ habit, metrics }) => {
  const getConsistencyColor = (consistency) => {
    switch (consistency) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Chip
        icon={<CheckCircle />}
        label={`${metrics.completionRate}%`}
        color={getConsistencyColor(metrics.consistency)}
        size="small"
      />
      {metrics.currentStreak > 0 && (
        <Chip
          icon={<Whatshot />}
          label={`${metrics.currentStreak}`}
          color="warning"
          size="small"
          variant="outlined"
        />
      )}
      <Typography variant="caption" color="text.secondary">
        Best: {metrics.longestStreak}
      </Typography>
    </Box>
  );
};