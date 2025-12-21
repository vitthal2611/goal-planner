import React from 'react';
import { Box, Grid, Grow, useMediaQuery, useTheme } from '@mui/material';
import { HabitCard } from './HabitCard';
import { SectionHeader } from '../common/SectionHeader';

export const HabitTimeGroup = ({ label, icon, color, habits, logs, dateStr, onLogHabit, animatingHabit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (habits.length === 0) return null;

  const getTodaysLog = (habitId) => logs.find(log => log.habitId === habitId && log.date === dateStr);

  const handleToggle = (habitId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? null : 'done';
    if (newStatus) {
      onLogHabit(habitId, 'done');
    } else {
      // Remove the log entry
      const existingLog = logs.find(log => log.habitId === habitId && log.date === dateStr);
      if (existingLog) {
        onLogHabit(habitId, 'remove');
      }
    }
  };

  const completedCount = habits.filter(h => getTodaysLog(h.id)?.status === 'done').length;
  const allCompleted = completedCount === habits.length;

  return (
    <Box sx={{ mb: { xs: 3, sm: 5 }, px: { xs: 2, sm: 0 } }}>
      <SectionHeader
        title={label}
        icon={icon}
        iconColor={color}
        count={`${completedCount}/${habits.length}`}
        countColor={allCompleted ? 'success' : 'default'}
      />

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {habits.map(habit => {
          const log = getTodaysLog(habit.id);
          return (
            <Grid item xs={12} key={habit.id}>
              <Grow in={true} timeout={300}>
                <div>
                  <HabitCard
                    habit={habit}
                    log={log}
                    onToggle={handleToggle}
                    isAnimating={animatingHabit === habit.id}
                  />
                </div>
              </Grow>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};