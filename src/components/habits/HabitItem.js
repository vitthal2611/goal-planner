import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, LinearProgress, Grid } from '@mui/material';
import { LocalFireDepartment, CheckCircle, Cancel, Delete } from '@mui/icons-material';
import { calculateHabitConsistency, formatDate } from '../../utils/calculations';

export const HabitItem = ({ habit, goal, habitLogs, onLogHabit, onDeleteHabit }) => {
  const consistency = calculateHabitConsistency(habit, habitLogs);
  const today = formatDate(new Date());
  const todaysLog = habitLogs.find(log => log.habitId === habit.id && log.date === today);

  const handleLog = (status) => {
    onLogHabit(habit.id, status);
  };

  const getConsistencyColor = (value) => {
    if (value >= 80) return 'success.main';
    if (value >= 60) return 'primary.main';
    if (value >= 40) return 'warning.main';
    return 'error.main';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {habit.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Goal: {goal?.title || 'Unknown'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LocalFireDepartment
                  sx={{
                    fontSize: 20,
                    mr: 0.5,
                    color: consistency.currentStreak > 0 ? 'warning.main' : 'grey.400'
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {consistency.currentStreak}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                day streak
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => onDeleteHabit(habit.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>

        {/* Context Info */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Trigger</Typography>
              <Typography variant="body2">{habit.trigger}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Time</Typography>
              <Typography variant="body2">{habit.time}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Location</Typography>
              <Typography variant="body2">{habit.location}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Today's Status */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Today's Status:
          </Typography>
          {todaysLog ? (
            <Chip
              icon={todaysLog.status === 'done' ? <CheckCircle /> : <Cancel />}
              label={todaysLog.status === 'done' ? 'Completed' : 'Skipped'}
              color={todaysLog.status === 'done' ? 'success' : 'default'}
              sx={{ mr: 1 }}
            />
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<CheckCircle />}
                label="Mark Done"
                clickable
                color="success"
                variant="outlined"
                onClick={() => handleLog('done')}
              />
              <Chip
                icon={<Cancel />}
                label="Mark Skipped"
                clickable
                variant="outlined"
                onClick={() => handleLog('skipped')}
              />
            </Box>
          )}
        </Box>

        {/* Consistency Stats */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">30-Day Consistency</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {consistency.consistency}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={consistency.consistency}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: getConsistencyColor(consistency.consistency)
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {consistency.completed}/{consistency.expected} completed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best streak: {consistency.longestStreak} days
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
