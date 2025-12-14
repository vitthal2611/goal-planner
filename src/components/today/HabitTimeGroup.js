import React from 'react';
import { Box, Typography, Chip, Grid, Grow, useMediaQuery, useTheme } from '@mui/material';
import { HabitCard } from './HabitCard';

export const HabitTimeGroup = ({ label, icon, color, habits, logs, onLogHabit, animatingHabit, formatDate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
    <Box sx={{ mb: { xs: 3, sm: 5 }, px: { xs: 2, sm: 0 } }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: { xs: 2, sm: 3 },
          pb: { xs: 1.5, sm: 2 },
          borderBottom: '2px solid',
          borderColor: 'grey.200'
        }}
      >
        <Box 
          sx={{ 
            color, 
            mr: { xs: 1, sm: 1.5 },
            display: 'flex',
            alignItems: 'center',
            fontSize: { xs: 22, sm: 28 }
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
          {label}
        </Typography>
        <Chip 
          label={`${completedCount}/${habits.length}`}
          size="small"
          color={allCompleted ? 'success' : 'default'}
          sx={{ 
            fontWeight: 600,
            minWidth: 50
          }}
        />
      </Box>

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