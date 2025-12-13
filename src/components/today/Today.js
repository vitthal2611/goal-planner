import React, { useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
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
    <Box>
      {/* Header - Primary screen intent */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>
          Today
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {currentDate}
        </Typography>
      </Box>

      {/* Progress Summary - Encouraging feedback */}
      <Card 
        sx={{ 
          mb: 5, 
          bgcolor: completedToday === totalHabits && totalHabits > 0 ? 'success.50' : 'primary.50',
          borderRadius: 3,
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 700, 
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
            <Box sx={{ textAlign: 'right' }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  color: completedToday === totalHabits && totalHabits > 0 ? 'success.main' : 'primary.main',
                  mb: 1
                }}
              >
                {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Completion rate
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Time-based Groups - One primary action per habit */}
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

      {/* Empty state - Encouraging */}
      {habits.length === 0 && (
        <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'text.secondary' }}>
              ✨ Ready to start?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first habit to begin tracking your daily progress.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go to the Habits tab to get started
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
