import React from 'react';
import { Card, CardHeader, CardContent, CardActions, Typography, Box, Chip, IconButton, LinearProgress, Grid, Avatar } from '@mui/material';
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
    <Card 
      elevation={0}
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': { 
          elevation: 4,
          boxShadow: 3,
          borderColor: 'primary.main'
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: consistency.currentStreak > 0 ? 'warning.main' : 'grey.300', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
            <LocalFireDepartment sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Avatar>
        }
        action={
          <IconButton onClick={() => onDeleteHabit(habit.id)} color="error" sx={{ minWidth: 44, minHeight: 44 }}>
            <Delete />
          </IconButton>
        }
        title={habit.name}
        subheader={`Goal: ${goal?.title || 'Unknown'}`}
        titleTypographyProps={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.125rem' } }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={`${consistency.currentStreak} day streak`} icon={<LocalFireDepartment />} color={consistency.currentStreak > 0 ? 'warning' : 'default'} />
          <Chip label={`${consistency.consistency}%`} color="primary" />
        </Box>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Trigger</Typography>
              <Typography variant="body2">{habit.trigger}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Time</Typography>
              <Typography variant="body2">{habit.time}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Location</Typography>
              <Typography variant="body2">{habit.location}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
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
                bgcolor: getConsistencyColor(consistency.consistency),
                transition: 'transform 0.4s ease'
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {consistency.completed}/{consistency.expected} completed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best streak: {consistency.longestStreak} days
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
        {todaysLog ? (
          <Chip
            icon={todaysLog.status === 'done' ? <CheckCircle /> : <Cancel />}
            label={todaysLog.status === 'done' ? 'Completed' : 'Skipped'}
            color={todaysLog.status === 'done' ? 'success' : 'default'}
          />
        ) : (
          <>
            <Chip
              icon={<CheckCircle />}
              label="Done"
              clickable
              color="success"
              variant="outlined"
              onClick={() => handleLog('done')}
              sx={{ '&:hover': { bgcolor: 'success.50' } }}
            />
            <Chip
              label="Skip"
              clickable
              variant="outlined"
              onClick={() => handleLog('skipped')}
              sx={{ '&:hover': { bgcolor: 'grey.100' } }}
            />
          </>
        )}
      </CardActions>
    </Card>
  );
};
