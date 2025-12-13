import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { ProgressRing } from '../common/ProgressRing';
import { calculateGoalProgress } from '../../utils/calculations';

export const GoalProgressSection = ({ goals }) => {
  if (goals.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Goal Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No goals created yet. Add your first goal to get started!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h2" sx={{ mb: 4 }}>
          Goal Progress
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mb: 5 }}>
          {goals.map(goal => {
            const progress = calculateGoalProgress(goal);
            return (
              <ProgressRing
                key={goal.id}
                progress={progress.yearlyProgress}
                label={goal.title}
                subtitle={`${goal.actualProgress}/${goal.yearlyTarget} ${goal.unit}`}
              />
            );
          })}
        </Box>

        <Typography variant="h4" sx={{ mb: 3 }}>
          Monthly Progress
        </Typography>
        {goals.map(goal => {
          const progress = calculateGoalProgress(goal);
          const monthlyActual = Math.floor(goal.actualProgress % progress.targets.monthly);
          const monthlyTarget = progress.targets.monthly;
          const monthlyPercentage = (monthlyActual / monthlyTarget) * 100;

          return (
            <Box key={goal.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {goal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {monthlyActual}/{Math.round(monthlyTarget)} {goal.unit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(monthlyPercentage, 100)}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  backgroundColor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: monthlyPercentage >= 80 ? 'success.main' : 'primary.main',
                    borderRadius: 5,
                    transition: 'all 0.3s ease'
                  }
                }}
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};