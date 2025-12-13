import React from 'react';
import { Box, Typography, Chip, Grid, Grow } from '@mui/material';
import { HabitCard } from './HabitCard';

export const HabitTimeGroup = ({ label, icon, color, habits, logs, onLogHabit, animatingHabit, formatDate }) => {
  if (habits.length === 0) return null;

  const today = formatDate(new Date());
  const getTodaysLog = (habitId) => logs.find(log => log.habitId === habitId && log.date === today);

  const handleToggle = (habitId, currentStatus) => {
    if (!currentStatus) {
      onLogHabit(habitId, 'done');
    } else if (currentStatus === 'done') {
      onLogHabit(habitId, 'skipped');
    } else {
      onLogHabit(habitId, 'done');
    }
  };

  const completedCount = habits.filter(h => getTodaysLog(h.id)?.status === 'done').length;
  const allCompleted = completedCount === habits.length;

  return (
    <Box sx={{ mb: 5 }}>
      {/* Section header with visual anchor */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'grey.200',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 1, sm: 0 }
        }}
      >
        <Box 
          sx={{ 
            color, 
            mr: 1.5,
            display: 'flex',
            alignItems: 'center',
            fontSize: { xs: 24, sm: 28 }
          }}
        >
          {icon}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 600, flex: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {label}
        </Typography>
        <Chip 
          label={`${completedCount}/${habits.length}`}
          size="medium"
          color={allCompleted ? 'success' : 'default'}
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            height: { xs: 28, sm: 32 },
            minWidth: 60
          }}
        />
      </Box>

      {/* Habit cards with spacing */}
      <Grid container spacing={2}>
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