import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Divider } from '@mui/material';
import { WbSunny, LightMode, Brightness3, NightsStay } from '@mui/icons-material';
import { formatDate } from '../../utils/calculations';
import { HabitTimeGroup } from './HabitTimeGroup';
import { useAppContext } from '../../context/AppContext';

export const Today = () => {
  const { habits, habitLogs, logHabit } = useAppContext();
  const [animatingHabit, setAnimatingHabit] = useState(null);
  const today = formatDate(new Date());
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const getTodaysLog = (habitId) => {
    return habitLogs.find(log => log.habitId === habitId && log.date === today);
  };

  const groupHabitsByTime = () => {
    const groups = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    habits.forEach(habit => {
      const hour = parseInt(habit.time.split(':')[0]);
      if (hour >= 5 && hour < 12) groups.morning.push(habit);
      else if (hour >= 12 && hour < 17) groups.afternoon.push(habit);
      else if (hour >= 17 && hour < 21) groups.evening.push(habit);
      else groups.night.push(habit);
    });

    return groups;
  };

  const handleLogHabit = (habitId, status) => {
    setAnimatingHabit(habitId);
    setTimeout(() => setAnimatingHabit(null), 600);
    logHabit(habitId, status);
  };

  const groups = groupHabitsByTime();
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => getTodaysLog(h.id)?.status === 'done').length;

  const timeGroups = [
    { key: 'morning', label: 'Morning', icon: <WbSunny />, color: 'warning.main' },
    { key: 'afternoon', label: 'Afternoon', icon: <LightMode />, color: 'primary.main' },
    { key: 'evening', label: 'Evening', icon: <Brightness3 />, color: 'info.main' },
    { key: 'night', label: 'Night', icon: <NightsStay />, color: 'secondary.main' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>Today</Typography>
        <Typography variant="body1" color="text.secondary">{currentDate}</Typography>
      </Box>

      {/* Progress Summary Card - Elevated */}
      <Card 
        elevation={completedToday === totalHabits && totalHabits > 0 ? 3 : 0}
        sx={{ 
          mb: 7,
          border: '1px solid',
          borderColor: completedToday === totalHabits && totalHabits > 0 ? 'success.main' : 'divider',
          transition: 'all 0.2s',
          '&:hover': { boxShadow: 4 }
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 3, sm: 4 } }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                Progress
              </Typography>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: { xs: '3rem', sm: '4rem' },
                  color: completedToday === totalHabits && totalHabits > 0 ? 'success.main' : 'primary.main',
                  mb: 1
                }}
              >
                {completedToday}/{totalHabits}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {completedToday === totalHabits && totalHabits > 0 
                  ? '🎉 All habits completed!' 
                  : 'Habits completed today'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, width: { xs: '100%', sm: 'auto' } }}>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                Completion Rate
              </Typography>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                  color: completedToday === totalHabits && totalHabits > 0 ? 'success.main' : 'primary.main',
                  mb: 1
                }}
              >
                {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 6 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
          Your Habits
        </Typography>
      </Divider>

      {/* Time-based Groups */}
      {timeGroups.map(({ key, label, icon, color }) => (
        <HabitTimeGroup
          key={key}
          label={label}
          icon={icon}
          color={color}
          habits={groups[key]}
          logs={habitLogs}
          onLogHabit={handleLogHabit}
          animatingHabit={animatingHabit}
          formatDate={formatDate}
        />
      ))}

      {habits.length === 0 && (
        <Card elevation={0} sx={{ textAlign: 'center', border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <CardContent sx={{ py: 12, px: 4 }}>
            <Box sx={{ fontSize: '3rem', mb: 3, opacity: 0.6 }}>✨</Box>
            <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 600 }}>
              Ready to start?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
              Create your first habit to begin tracking your daily progress.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go to the Habits tab to get started
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};
