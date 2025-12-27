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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <Chip
        icon={metrics.onTrack ? <TrendingUp /> : <TrendingDown />}
        label={`${metrics.completionRate}%`}
        color={getStatusColor(metrics.status)}
        size="small"
        sx={{ 
          fontWeight: 600,
          borderRadius: 2,
          '& .MuiChip-icon': { fontSize: '1rem' }
        }}
      />
      <Tooltip title={`${metrics.daysRemaining} days remaining`} arrow>
        <Chip
          label={`${metrics.daysRemaining}d left`}
          size="small"
          variant="outlined"
          sx={{ 
            fontWeight: 500,
            borderRadius: 2,
            borderColor: 'text.secondary',
            color: 'text.secondary'
          }}
        />
      </Tooltip>
      {metrics.status === 'behind' && (
        <Tooltip title={`Need ${metrics.requiredDailyRate} per day to catch up`} arrow>
          <Chip
            label={`${metrics.requiredDailyRate}/day`}
            color="warning"
            size="small"
            variant="filled"
            sx={{ 
              fontWeight: 600,
              borderRadius: 2
            }}
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <Chip
        icon={<CheckCircle />}
        label={`${metrics.completionRate}%`}
        color={getConsistencyColor(metrics.consistency)}
        size="small"
        sx={{ 
          fontWeight: 600,
          borderRadius: 2,
          '& .MuiChip-icon': { fontSize: '1rem' }
        }}
      />
      {metrics.currentStreak > 0 && (
        <Chip
          icon={<Whatshot />}
          label={`${metrics.currentStreak} streak`}
          color="warning"
          size="small"
          variant="filled"
          sx={{ 
            fontWeight: 600,
            borderRadius: 2,
            '& .MuiChip-icon': { fontSize: '1rem' }
          }}
        />
      )}
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Best: {metrics.longestStreak}
      </Typography>
    </Box>
  );
};