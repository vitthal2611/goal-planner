import React from 'react';
import { Box, Container, Grid, Typography, Divider } from '@mui/material';
import { SummaryCard } from '../common/SummaryCard';
import { GoalProgressSection } from '../goals/GoalProgressSection';
import { HabitStreakSection } from '../habits/HabitStreakSection';
import { calculateGoalProgress, calculateHabitConsistency } from '../../utils/calculations';
import { useAppContext } from '../../context/AppContext';

export const Dashboard = () => {
  const { goals, habits, habitLogs, logHabit } = useAppContext();
  const calculateOverallProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => {
      const progress = calculateGoalProgress(goal);
      return sum + progress.yearlyProgress;
    }, 0);
    return totalProgress / goals.length;
  };

  const calculateMonthlyStatus = () => {
    if (goals.length === 0) return { actual: 0, target: 0 };
    const monthlyData = goals.map(goal => {
      const progress = calculateGoalProgress(goal);
      return {
        actual: Math.floor(goal.actualProgress % progress.targets.monthly),
        target: progress.targets.monthly
      };
    });
    
    const totalActual = monthlyData.reduce((sum, data) => sum + data.actual, 0);
    const totalTarget = monthlyData.reduce((sum, data) => sum + data.target, 0);
    
    return { actual: totalActual, target: Math.round(totalTarget) };
  };

  const calculateOverallHabitConsistency = () => {
    if (habits.length === 0) return 0;
    const consistencies = habits.map(habit => {
      const habitConsistency = calculateHabitConsistency(habit, habitLogs);
      return habitConsistency.consistency;
    });
    return consistencies.reduce((sum, consistency) => sum + consistency, 0) / consistencies.length;
  };

  const overallProgress = calculateOverallProgress();
  const monthlyStatus = calculateMonthlyStatus();
  const habitConsistency = calculateOverallHabitConsistency();

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 7 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your progress overview
        </Typography>
      </Box>

      {/* Summary Cards - Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 7 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Yearly Progress"
            value={`${Math.round(overallProgress)}%`}
            subtitle="Average across all goals"
            color={overallProgress >= 70 ? 'success' : overallProgress >= 50 ? 'primary' : 'warning'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Monthly Target"
            value={`${monthlyStatus.actual}/${monthlyStatus.target}`}
            subtitle="This month's progress"
            color={monthlyStatus.actual >= monthlyStatus.target * 0.8 ? 'success' : 'primary'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Habit Consistency"
            value={`${Math.round(habitConsistency)}%`}
            subtitle="Last 30 days average"
            color={habitConsistency >= 80 ? 'success' : habitConsistency >= 60 ? 'primary' : 'warning'}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 7 }} />

      {/* Detailed Progress */}
      <Grid container spacing={{ xs: 3, sm: 4, lg: 5 }}>
        <Grid item xs={12}>
          <GoalProgressSection goals={goals} />
        </Grid>
        <Grid item xs={12}>
          <HabitStreakSection habits={habits} habitLogs={habitLogs} onLogHabit={logHabit} />
        </Grid>
      </Grid>
    </Container>
  );
};