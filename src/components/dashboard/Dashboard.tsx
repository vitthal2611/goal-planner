import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { SummaryCard } from '../common/SummaryCard';
import { GoalProgressSection } from '../goals/GoalProgressSection';
import { HabitStreakSection } from '../habits/HabitStreakSection';
import { Goal, Habit, HabitLog } from '../../types';
import { calculateGoalProgress, calculateHabitConsistency } from '../../utils/calculations';

interface DashboardProps {
  goals: Goal[];
  habits: Habit[];
  habitLogs: HabitLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ goals, habits, habitLogs }) => {
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Goal Planner Dashboard
      </Typography>

      {/* Top Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <GoalProgressSection goals={goals} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <HabitStreakSection habits={habits} habitLogs={habitLogs} />
        </Grid>
      </Grid>
    </Box>
  );
};