import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { WbSunny, LightMode, Brightness3, NightsStay, TrendingUp } from '@mui/icons-material';
import { format, startOfDay } from 'date-fns';
import { DateNavigator } from '../common/DateNavigator';
import { SectionHeader } from '../common/SectionHeader';
import { HabitTimeGroup } from './HabitTimeGroup';
import { useAppContext } from '../../context/AppContext';
import { isHabitScheduledForDate } from '../../utils/frequencyRules';
import { isGoalActive } from '../../utils/goalTimelineRules';

export const Today = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { habits, logs, logHabit, goals } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [animatingHabit, setAnimatingHabit] = useState(null);

  const dateStr = format(startOfDay(selectedDate), 'yyyy-MM-dd');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  const getTodaysLog = (habitId) => {
    return logs.find(log => log.habitId === habitId && log.date === dateStr);
  };

  // Filter habits scheduled for selected date AND linked to active goals
  const daysHabits = useMemo(() => {
    return habits.filter(habit => {
      // First check if habit is scheduled for this date
      if (!isHabitScheduledForDate(habit, selectedDate)) return false;
      
      // If habit has no linked goals, show it (backward compatibility)
      if (!habit.goalIds || habit.goalIds.length === 0) return true;
      
      // Check if any linked goal is active on selected date
      const linkedGoals = goals.filter(g => habit.goalIds.includes(g.id));
      if (linkedGoals.length === 0) return true; // Show if goals don't exist
      
      return linkedGoals.some(goal => {
        // Goal must have start/end dates to be filtered
        if (!goal.startDate || !goal.endDate) return true;
        return isGoalActive(goal, selectedDate);
      });
    });
  }, [habits, goals, selectedDate]);

  const groupHabitsByTime = () => {
    const groups = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    daysHabits.forEach(habit => {
      const hour = parseInt(habit.time.split(':')[0]);
      if (hour >= 5 && hour < 12) groups.morning.push(habit);
      else if (hour >= 12 && hour < 17) groups.afternoon.push(habit);
      else if (hour >= 17 && hour < 21) groups.evening.push(habit);
      else groups.night.push(habit);
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.time.localeCompare(b.time));
    });

    return groups;
  };

  const handleLogHabit = (habitId, status) => {
    const habit = habits.find(h => h.id === habitId);
    setAnimatingHabit(habitId);
    setTimeout(() => setAnimatingHabit(null), 600);
    logHabit(habitId, status, habit, dateStr);
  };

  const groups = groupHabitsByTime();
  const totalHabits = daysHabits.length;
  const completedCount = daysHabits.filter(h => getTodaysLog(h.id)?.status === 'done').length;
  const completionRate = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
  const allCompleted = completedCount === totalHabits && totalHabits > 0;

  const timeGroups = [
    { key: 'morning', label: 'Morning', icon: <WbSunny />, color: 'warning.main' },
    { key: 'afternoon', label: 'Afternoon', icon: <LightMode />, color: 'primary.main' },
    { key: 'evening', label: 'Evening', icon: <Brightness3 />, color: 'info.main' },
    { key: 'night', label: 'Night', icon: <NightsStay />, color: 'secondary.main' }
  ];

  const getMotivationalMessage = () => {
    if (allCompleted) return '🎉 Perfect day! All habits completed!';
    if (completionRate >= 75) return '🔥 Great progress! Keep it up!';
    if (completionRate >= 50) return '💪 You\'re halfway there!';
    if (completionRate >= 25) return '🌱 Good start! Keep going!';
    return '✨ Ready to make progress today?';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 0, sm: 5 }, px: { xs: 0, sm: 3 } }}>
      {/* Screen Title - Desktop Only */}
      {!isMobile && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
            Today
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your daily habits and build consistency
          </Typography>
        </Box>
      )}

      {/* Date Navigator */}
      <Box sx={{ px: { xs: 2, sm: 0 } }}>
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          preventFuture={true}
        />
      </Box>

      {/* Progress Summary Card */}
      <Card
        elevation={allCompleted ? 2 : 0}
        sx={{
          mb: { xs: 3, sm: 5 },
          mx: { xs: 2, sm: 0 },
          border: '1px solid',
          borderColor: allCompleted ? 'success.main' : 'divider',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 4,
            borderColor: allCompleted ? 'success.dark' : 'primary.main'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            {/* Progress Numbers */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '3rem', sm: '4rem' },
                    color: allCompleted ? 'success.main' : 'primary.main',
                    lineHeight: 1
                  }}
                >
                  {completedCount}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    lineHeight: 1
                  }}
                >
                  / {totalHabits}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Habits completed {isToday ? 'today' : format(selectedDate, 'MMM d')}
              </Typography>
              
              {/* Progress Bar */}
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 8,
                  borderRadius: 10,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: allCompleted ? 'success.main' : 'primary.main',
                    borderRadius: 10
                  }
                }}
              />
            </Grid>

            {/* Completion Rate & Message */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1, mb: 1 }}>
                  <TrendingUp sx={{ color: allCompleted ? 'success.main' : 'primary.main', fontSize: 32 }} />
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                      color: allCompleted ? 'success.main' : 'primary.main',
                      lineHeight: 1
                    }}
                  >
                    {Math.round(completionRate)}%
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: allCompleted ? 'success.main' : 'text.secondary',
                    fontWeight: allCompleted ? 600 : 400
                  }}
                >
                  {getMotivationalMessage()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Habits by Time of Day */}
      {totalHabits > 0 ? (
        <Box sx={{ px: { xs: 0, sm: 0 } }}>
          {timeGroups.map(({ key, label, icon, color }) => (
            <HabitTimeGroup
              key={key}
              label={label}
              icon={icon}
              color={color}
              habits={groups[key]}
              logs={logs}
              dateStr={dateStr}
              onLogHabit={handleLogHabit}
              animatingHabit={animatingHabit}
            />
          ))}
        </Box>
      ) : (
        /* Empty State */
        <Card
          elevation={0}
          sx={{
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'grey.50',
            mx: { xs: 2, sm: 0 }
          }}
        >
          <CardContent sx={{ py: { xs: 8, sm: 12 }, px: { xs: 3, sm: 4 } }}>
            <Box sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, mb: { xs: 2, sm: 3 }, opacity: 0.6 }}>
              ✨
            </Box>
            <Typography variant="h5" sx={{ mb: { xs: 2, sm: 2.5 }, fontWeight: 600 }}>
              {isToday ? 'Ready to start?' : 'No habits scheduled'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
              {isToday
                ? 'Create your first habit to begin tracking your daily progress.'
                : `No habits were scheduled for ${format(selectedDate, 'MMMM d, yyyy')}.`}
            </Typography>
            {isToday && (
              <Typography variant="body2" color="text.secondary">
                Go to the Habits tab to get started
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};
