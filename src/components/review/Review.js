import React from 'react';
import { Box, Typography, Card, CardHeader, CardContent, Grid, LinearProgress, Chip, Container, Divider } from '@mui/material';
import { TrendingUp, TrendingDown, CheckCircle, Warning, Info } from '@mui/icons-material';
import { calculateGoalProgress } from '../../utils/goalUtils';
import { calculateHabitConsistency } from '../../utils/habitUtils';
import { useAppContext } from '../../context/AppContext';

const generateInsights = (goals, habits, logs) => {
  const insights = [];

  // Goal insights
  const goalsOnTrack = goals.filter(g => calculateGoalProgress(g).onTrack).length;
  const goalsBehind = goals.length - goalsOnTrack;

  if (goalsOnTrack === goals.length && goals.length > 0) {
    insights.push({
      type: 'positive',
      icon: <CheckCircle />,
      message: `All ${goals.length} goals are on track! Excellent progress this month.`
    });
  } else if (goalsBehind > goals.length / 2) {
    insights.push({
      type: 'warning',
      icon: <Warning />,
      message: `${goalsBehind} of ${goals.length} goals are behind schedule. Consider reviewing your daily habits.`
    });
  } else if (goalsBehind > 0) {
    insights.push({
      type: 'info',
      icon: <Info />,
      message: `${goalsOnTrack} goals on track, ${goalsBehind} need attention.`
    });
  }

  // Habit insights
  const habitStats = habits.map(h => {
    const goal = goals.find(g => h.goalIds.includes(g.id));
    return {
      habit: h,
      consistency: calculateHabitConsistency(h, logs, goal)
    };
  });

  const excellentHabits = habitStats.filter(h => h.consistency.consistency >= 90);
  const strugglingHabits = habitStats.filter(h => h.consistency.consistency < 50);

  if (excellentHabits.length > 0) {
    insights.push({
      type: 'positive',
      icon: <TrendingUp />,
      message: `${excellentHabits.length} habit${excellentHabits.length > 1 ? 's' : ''} with 90%+ consistency: ${excellentHabits.map(h => h.habit.name).join(', ')}`
    });
  }

  if (strugglingHabits.length > 0) {
    insights.push({
      type: 'warning',
      icon: <TrendingDown />,
      message: `${strugglingHabits.length} habit${strugglingHabits.length > 1 ? 's need' : ' needs'} improvement: ${strugglingHabits.map(h => h.habit.name).join(', ')}`
    });
  }

  // Streak insights
  const bestStreak = Math.max(...habitStats.map(h => h.consistency.currentStreak), 0);
  if (bestStreak >= 7) {
    insights.push({
      type: 'positive',
      icon: <CheckCircle />,
      message: `Longest current streak: ${bestStreak} days! Keep the momentum going.`
    });
  }

  // Overall consistency
  const avgConsistency = habitStats.length > 0
    ? habitStats.reduce((sum, h) => sum + h.consistency.consistency, 0) / habitStats.length
    : 0;

  if (avgConsistency >= 80) {
    insights.push({
      type: 'positive',
      icon: <CheckCircle />,
      message: `Outstanding habit consistency at ${Math.round(avgConsistency)}%. You're building strong routines!`
    });
  } else if (avgConsistency < 50) {
    insights.push({
      type: 'warning',
      icon: <Warning />,
      message: `Habit consistency is at ${Math.round(avgConsistency)}%. Focus on one habit at a time to build momentum.`
    });
  }

  return insights;
};

export const Review = () => {
  const { goals, habits, logs } = useAppContext();
  const insights = generateInsights(goals, habits, logs);

  const goalStats = goals.map(goal => {
    const progress = calculateGoalProgress(goal);
    return { goal, progress };
  });

  const habitStats = habits.map(habit => {
    const goal = goals.find(g => habit.goalIds.includes(g.id));
    const consistency = calculateHabitConsistency(habit, logs, goal);
    return { habit, consistency };
  });

  const avgGoalProgress = goalStats.length > 0
    ? goalStats.reduce((sum, g) => sum + g.progress.yearlyProgress, 0) / goalStats.length
    : 0;

  const avgHabitConsistency = habitStats.length > 0
    ? habitStats.reduce((sum, h) => sum + h.consistency.consistency, 0) / habitStats.length
    : 0;

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'success';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Review
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monthly insights and progress analysis
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'primary.main',
              transition: 'all 0.2s',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardHeader 
              title="Average Goal Progress"
              titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                {Math.round(avgGoalProgress)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={avgGoalProgress}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: avgGoalProgress >= 70 ? 'success.main' : 'primary.main',
                    transition: 'transform 0.4s ease'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'success.main',
              transition: 'all 0.2s',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardHeader 
              title="Average Habit Consistency"
              titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 2 }}>
                {Math.round(avgHabitConsistency)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={avgHabitConsistency}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: avgHabitConsistency >= 80 ? 'success.main' : 'warning.main',
                    transition: 'transform 0.4s ease'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
          INSIGHTS & ANALYSIS
        </Typography>
      </Divider>

      {/* Insights */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: 3 }
        }}
      >
        <CardHeader 
          title="Key Insights"
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            {insights.map((insight, index) => (
              <Grid item xs={12} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: 2,
                    borderRadius: 1,
                    bgcolor: `${getInsightColor(insight.type)}.50`
                  }}
                >
                  <Box sx={{ color: `${getInsightColor(insight.type)}.main`, mr: 2, mt: 0.5 }}>
                    {insight.icon}
                  </Box>
                  <Typography variant="body1">{insight.message}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Goal Comparison */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: 3 }
        }}
      >
        <CardHeader 
          title="Goal Progress: Planned vs Actual"
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {goalStats.map(({ goal, progress }) => (
            <Box key={goal.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {goal.title}
                </Typography>
                <Chip
                  icon={progress.onTrack ? <TrendingUp /> : <TrendingDown />}
                  label={progress.onTrack ? 'On Track' : 'Behind'}
                  size="small"
                  color={progress.onTrack ? 'success' : 'warning'}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Expected Progress
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {progress.expected} {goal.unit}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: progress.onTrack ? 'success.50' : 'warning.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Actual Progress
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {progress.actual} {goal.unit}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <LinearProgress
                variant="determinate"
                value={Math.min(progress.yearlyProgress, 100)}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress.onTrack ? 'success.main' : 'warning.main',
                    transition: 'transform 0.4s ease'
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress.yearlyProgress)}% complete
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progress.remaining} {goal.unit} remaining
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Habit Adherence */}
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
          title="Habit Adherence (Last 30 Days)"
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {habitStats.map(({ habit, consistency }) => (
            <Box key={habit.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {habit.name}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {consistency.consistency}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={consistency.consistency}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: consistency.consistency >= 80 ? 'success.main' : consistency.consistency >= 60 ? 'primary.main' : 'warning.main',
                    transition: 'transform 0.4s ease'
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {consistency.completed}/{consistency.expected} completed • {consistency.skipped} skipped
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current streak: {consistency.currentStreak} days
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};
