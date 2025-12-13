import React from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress } from '@mui/material';
import { ProgressRing } from '../common/ProgressRing';
import { Goal } from '../../types';
import { calculateGoalProgress } from '../../utils/calculations';

interface GoalProgressSectionProps {
  goals: Goal[];
}

export const GoalProgressSection: React.FC<GoalProgressSectionProps> = ({ goals }) => {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Goal Progress</Typography>
          <Typography variant="body2" color="text.secondary">
            No goals created yet. Add your first goal to get started!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Goal Progress
        </Typography>
        
        {/* Circular Progress Rings */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
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

        {/* Monthly Progress Bars */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Monthly Progress
        </Typography>
        {goals.map(goal => {
          const progress = calculateGoalProgress(goal);
          const monthlyActual = Math.floor(goal.actualProgress % progress.targets.monthly);
          const monthlyTarget = progress.targets.monthly;
          const monthlyPercentage = (monthlyActual / monthlyTarget) * 100;

          return (
            <Box key={goal.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{goal.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {monthlyActual}/{Math.round(monthlyTarget)} {goal.unit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(monthlyPercentage, 100)}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: monthlyPercentage >= 80 ? 'success.main' : 'primary.main'
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