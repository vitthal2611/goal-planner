import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Card, CardContent, Divider, useMediaQuery, useTheme } from '@mui/material';
import { WbSunny, LightMode, Brightness3, NightsStay } from '@mui/icons-material';
import { formatDate } from '../../utils/calculations';
import { format, isToday } from 'date-fns';
import { DateNavigator } from '../common/DateNavigator';
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
  const dateStr = formatDate(selectedDate);
  const isTodaySelected = isToday(selectedDate);

  const getTodaysLog = (habitId) => {
    return logs.find(log => log.habitId === habitId && log.date === dateStr);
  };

  // Filter habits scheduled for selected date AND linked to active goals
  const daysHabits = useMemo(() => {
    return habits.filter(habit => {
      // Check if habit is scheduled for selected date
      if (!isHabitScheduledForDate(habit, selectedDate)) return false;
      
      // Check if any linked goal is active
      const linkedGoals = goals.filter(g => habit.goalIds.includes(g.id));
      if (linkedGoals.length === 0) return true; // Show if no goals linked
      
      return linkedGoals.some(goal => isGoalActive(goal, selectedDate));
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
  const completedToday = daysHabits.filter(h => getTodaysLog(h.id)?.status === 'done').length;

  const timeGroups = [
    { key: 'morning', label: 'Morning', icon: <WbSunny />, color: 'warning.main' },
    { key: 'afternoon', label: 'Afternoon', icon: <LightMode />, color: 'primary.main' },
    { key: 'evening', label: 'Evening', icon: <Brightness3 />, color: 'info.main' },
    { key: 'night', label: 'Night', icon: <NightsStay />, color: 'secondary.main' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 0, sm: 5 }, px: { xs: 0, sm: 3 } }}>
      {/* Date Navigator */}
      <Box sx={{ px: { xs: 2, sm: 0 } }}>
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          preventFuture={true}
        />
      </Box>

      {!isMobile && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>Today</Typography>
          <Typography variant="body1" color="text.secondary">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>
      )}

      <Card 
        elevation={completedToday === totalHabits && totalHabits > 0 ? 3 : 0}
        sx={{ 
          mb: { xs: 3, sm: 7 },
          mx: { xs: 2, sm: 0 },
          border: '1px solid',
          borderColor: completedToday === totalHabits && totalHabits > 0 ? 'success.main' : 'divider',
          transition: 'all 0.2s'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
                {isTodaySelected ? 'Progress' : 'Completed'}
              </Typography>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: { xs: '2.5rem', sm: '4rem' },
                  color: completedToday === totalHabits && totalHabits > 0 ? 'success.main' : 'primary.main',
                  lineHeight: 1
                }}
              >
                {completedToday}/{totalHabits}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
                Rate
              </Typography>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', sm: '3rem' },
                  color: completedToday === totalHabits && totalHabits > 0 ? 'success.main' : 'primary.main',
                  lineHeight: 1
                }}
              >
                {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
              </Typography>
            </Box>
          </Box>
          {completedToday === totalHabits && totalHabits > 0 && (
            <Typography variant="body2" color="success.main" sx={{ mt: 2, fontWeight: 500 }}>
              🎉 {isTodaySelected ? 'All habits completed!' : 'Perfect day!'}
            </Typography>
          )}
        </CardContent>
      </Card>

      {!isMobile && (
        <Divider sx={{ mb: 6 }}>
          <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
            Your Habits
          </Typography>
        </Divider>
      )}

      {/* Time-based Groups */}
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

      {habits.length === 0 && (
        <Card elevation={0} sx={{ textAlign: 'center', border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.50', mx: { xs: 2, sm: 0 } }}>
          <CardContent sx={{ py: { xs: 8, sm: 12 }, px: { xs: 3, sm: 4 } }}>
            <Box sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, mb: { xs: 2, sm: 3 }, opacity: 0.6 }}>✨</Box>
            <Typography variant="h5" sx={{ mb: { xs: 2, sm: 2.5 }, fontWeight: 600 }}>
              {isTodaySelected ? 'Ready to start?' : 'No habits scheduled'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
              {isTodaySelected
                ? 'Create your first habit to begin tracking your daily progress.'
                : `No habits were scheduled for ${format(selectedDate, 'MMMM d, yyyy')}.`}
            </Typography>
            {isTodaySelected && (
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
