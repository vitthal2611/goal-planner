import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box, Chip } from '@mui/material';
import { LocalFireDepartment, CheckCircle } from '@mui/icons-material';
import { calculateHabitConsistency, formatDate } from '../../utils/calculations';

export const HabitStreakSection = ({ habits, habitLogs, onLogHabit }) => {
  const getTodaysLog = (habitId) => {
    const today = formatDate(new Date());
    return habitLogs.find(log => log.habitId === habitId && log.date === today);
  };

  if (habits.length === 0) {
    return (
      <Card elevation={0} sx={{ border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <Box sx={{ fontSize: '2.5rem', mb: 2, opacity: 0.6 }}>🔥</Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No habits yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create habits to track streaks and consistency
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
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
        title="Habit Streaks"
        titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        {habits.map(habit => {
          const consistency = calculateHabitConsistency(habit, habitLogs);
          const todaysLog = getTodaysLog(habit.id);
          
          return (
            <Card 
              key={habit.id}
              elevation={0}
              sx={{ 
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {habit.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                      {habit.trigger} • {habit.time} • {habit.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right', ml: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocalFireDepartment 
                        sx={{ 
                          fontSize: 18, 
                          mr: 0.5, 
                          color: consistency.currentStreak > 0 ? 'warning.main' : 'grey.400' 
                        }} 
                      />
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                        {consistency.currentStreak}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(consistency.consistency)}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {todaysLog ? (
                      <Chip
                        icon={<CheckCircle />}
                        label={todaysLog.status === 'done' ? 'Completed' : 'Skipped'}
                        color={todaysLog.status === 'done' ? 'success' : 'default'}
                        size="small"
                      />
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<CheckCircle />}
                          label="Done"
                          size="small"
                          clickable
                          color="success"
                          variant="outlined"
                          onClick={() => onLogHabit?.(habit.id, 'done')}
                          sx={{ '&:hover': { bgcolor: 'success.50' } }}
                        />
                        <Chip
                          label="Skip"
                          size="small"
                          clickable
                          variant="outlined"
                          onClick={() => onLogHabit?.(habit.id, 'skipped')}
                          sx={{ '&:hover': { bgcolor: 'grey.100' } }}
                        />
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Best: {consistency.longestStreak}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};