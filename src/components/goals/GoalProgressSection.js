import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box, LinearProgress, Skeleton } from '@mui/material';
import { ProgressRing } from '../common/ProgressRing';
import { calculateGoalProgress } from '../../utils/calculations';

export const GoalProgressSection = ({ goals }) => {
  if (goals.length === 0) {
    return (
      <Card elevation={0} sx={{ border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <Box sx={{ fontSize: '2.5rem', mb: 2, opacity: 0.6 }}>📊</Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No goals yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your first goal to see progress tracking here
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      elevation={0}
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 3 }
      }}
    >
      <CardHeader 
        title="Goal Progress"
        titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mb: 4 }}>
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

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
                    transition: 'transform 0.4s ease'
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