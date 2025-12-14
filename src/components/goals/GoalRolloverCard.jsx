import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
  Chip,
  LinearProgress
} from '@mui/material';

export const GoalRolloverCard = ({ goal, selected, onToggle, disabled = false }) => {
  const completionRate = (goal.actualProgress / goal.yearlyTarget) * 100;
  const isCompleted = completionRate >= 100;

  return (
    <Card 
      sx={{ 
        opacity: disabled ? 0.6 : 1,
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Checkbox
            checked={selected}
            onChange={onToggle}
            disabled={disabled}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6">{goal.title}</Typography>
              <Chip
                label={isCompleted ? 'Completed' : 'Incomplete'}
                color={isCompleted ? 'success' : 'warning'}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {goal.actualProgress} / {goal.yearlyTarget} {goal.unit}
            </Typography>
            
            <LinearProgress
              variant="determinate"
              value={Math.min(completionRate, 100)}
              sx={{ mb: 1 }}
            />
            
            <Typography variant="caption" color="text.secondary">
              {Math.round(completionRate)}% completed
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};