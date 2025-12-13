import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, CheckCircle } from '@mui/icons-material';
import { useApp } from '../context/AppContext';

export default function Review() {
  const { goals, habits, calculateGoalProgress, calculateConsistency } = useApp();

  const insights = [];
  
  goals.forEach(goal => {
    const { progress, onTrack } = calculateGoalProgress(goal);
    if (onTrack) {
      insights.push({ type: 'success', message: `${goal.title} is on track at ${Math.round(progress)}%` });
    } else {
      insights.push({ type: 'warning', message: `${goal.title} needs attention - behind schedule` });
    }
  });

  habits.forEach(habit => {
    const consistency = calculateConsistency(habit.id);
    if (consistency >= 80) {
      insights.push({ type: 'success', message: `${habit.name} has excellent consistency at ${consistency}%` });
    } else if (consistency < 50) {
      insights.push({ type: 'warning', message: `${habit.name} needs more focus - only ${consistency}% consistency` });
    }
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight="600" gutterBottom>Review</Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="600" mb={2}>Goal Progress</Typography>
            {goals.map(goal => {
              const { progress, onTrack, expected } = calculateGoalProgress(goal);
              return (
                <Box key={goal.id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1">{goal.title}</Typography>
                    <Chip
                      label={onTrack ? 'On Track' : 'Behind'}
                      color={onTrack ? 'success' : 'warning'}
                      size="small"
                      icon={onTrack ? <TrendingUp /> : <TrendingDown />}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Actual: {goal.actualProgress} {goal.unit} | Expected: {expected} {goal.unit} | Progress: {Math.round(progress)}%
                  </Typography>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="600" mb={2}>Habit Adherence</Typography>
            {habits.map(habit => {
              const consistency = calculateConsistency(habit.id);
              return (
                <Box key={habit.id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1">{habit.name}</Typography>
                    <Typography variant="body2" fontWeight="600">{consistency}%</Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ width: `${consistency}%`, height: '100%', bgcolor: consistency >= 80 ? '#4CAF50' : consistency >= 50 ? '#FF9800' : '#F44336' }} />
                  </Box>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="600" mb={2}>Insights</Typography>
            {insights.map((insight, i) => (
              <Box key={i} display="flex" alignItems="start" gap={1} mb={2}>
                {insight.type === 'success' ? (
                  <CheckCircle color="success" />
                ) : (
                  <TrendingDown color="warning" />
                )}
                <Typography variant="body2">{insight.message}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
