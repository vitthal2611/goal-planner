import React from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress, LinearProgress, Chip, useMediaQuery, useTheme } from '@mui/material';
import { LocalFireDepartment, TrendingUp, TrendingDown } from '@mui/icons-material';
import { calculateGoalProgress, breakdownGoalTargets } from '../../utils/goalUtils';
import { calculateHabitConsistency } from '../../utils/habitUtils';
import { useAppContext } from '../../context/AppContext';

export const DashboardScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { goals, habits, logs } = useAppContext();
  // Overall metrics
  const avgYearlyProgress = goals.length > 0
    ? goals.reduce((sum, g) => sum + calculateGoalProgress(g).yearlyProgress, 0) / goals.length
    : 0;

  const monthlyData = goals.reduce((acc, goal) => {
    const progress = calculateGoalProgress(goal);
    const monthlyActual = Math.floor(goal.actualProgress % progress.targets.monthly);
    return {
      actual: acc.actual + monthlyActual,
      target: acc.target + progress.targets.monthly
    };
  }, { actual: 0, target: 0 });

  const avgHabitConsistency = habits.length > 0
    ? habits.reduce((sum, h) => {
        const goal = goals.find(g => h.goalIds.includes(g.id));
        return sum + calculateHabitConsistency(h, logs, goal).consistency;
      }, 0) / habits.length
    : 0;

  const getColor = (value, thresholds = [90, 70, 50]) => {
    if (value >= thresholds[0]) return 'success.main';
    if (value >= thresholds[1]) return 'primary.main';
    if (value >= thresholds[2]) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 0 } }}>
      {!isMobile && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Track your progress across all goals and habits</Typography>
        </Box>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 5 } }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                Yearly Progress
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, color: getColor(avgYearlyProgress), my: 2 }}>
                {Math.round(avgYearlyProgress)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average across {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                Monthly Target
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', my: 2 }}>
                {Math.round(monthlyData.actual)}/{Math.round(monthlyData.target)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round((monthlyData.actual / monthlyData.target) * 100)}% complete this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                Habit Consistency
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, color: getColor(avgHabitConsistency, [80, 60, 40]), my: 2 }}>
                {Math.round(avgHabitConsistency)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Goal Progress</Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', my: 3 }}>
                {goals.map(goal => {
                  const progress = calculateGoalProgress(goal);
                  return (
                    <Box key={goal.id} sx={{ textAlign: 'center', m: 2 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={Math.min(progress.yearlyProgress, 100)}
                          size={100}
                          thickness={5}
                          sx={{ color: getColor(progress.yearlyProgress) }}
                        />
                        <Box sx={{
                          position: 'absolute',
                          top: 0, left: 0, bottom: 0, right: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {Math.round(progress.yearlyProgress)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {goal.actualProgress}/{goal.yearlyTarget}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, maxWidth: 120 }}>
                        {goal.title}
                      </Typography>
                      {progress.onTrack ? (
                        <Chip icon={<TrendingUp />} label="On Track" size="small" color="success" sx={{ mt: 1 }} />
                      ) : (
                        <Chip icon={<TrendingDown />} label="Behind" size="small" color="warning" sx={{ mt: 1 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Monthly Progress Bars */}
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>Monthly Breakdown</Typography>
              {goals.map(goal => {
                const progress = calculateGoalProgress(goal);
                const monthlyActual = Math.floor(goal.actualProgress % progress.targets.monthly);
                const monthlyPct = (monthlyActual / progress.targets.monthly) * 100;

                return (
                  <Box key={goal.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{goal.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {monthlyActual.toFixed(1)}/{progress.targets.monthly.toFixed(1)} {goal.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(monthlyPct, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: monthlyPct >= 80 ? 'success.main' : 'primary.main'
                        }
                      }}
                    />
                  </Box>
                );
              })}

              {/* Quarterly Progress Bars */}
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>Quarterly Breakdown</Typography>
              {goals.map(goal => {
                const progress = calculateGoalProgress(goal);
                const quarterlyActual = Math.floor(goal.actualProgress % progress.targets.quarterly);
                const quarterlyPct = (quarterlyActual / progress.targets.quarterly) * 100;

                return (
                  <Box key={goal.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{goal.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quarterlyActual.toFixed(1)}/{progress.targets.quarterly.toFixed(1)} {goal.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(quarterlyPct, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: quarterlyPct >= 80 ? 'success.main' : 'primary.main'
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Habit Streaks</Typography>
              
              {habits.map(habit => {
                const goal = goals.find(g => habit.goalIds.includes(g.id));
                const consistency = calculateHabitConsistency(habit, logs, goal);
                
                return (
                  <Card key={habit.id} variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {habit.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {habit.trigger} • {habit.time}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'right', ml: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <LocalFireDepartment
                              sx={{
                                fontSize: 18,
                                mr: 0.5,
                                color: consistency.currentStreak > 0 ? 'warning.main' : 'grey.400'
                              }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {consistency.currentStreak}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            days streak
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">Consistency</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {consistency.consistency}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={consistency.consistency}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            bgcolor: 'grey.300',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getColor(consistency.consistency, [80, 60, 40])
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {consistency.completed}/{consistency.expected} completed
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Best: {consistency.longestStreak}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
