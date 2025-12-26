import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Box, Typography, IconButton, Grid, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { isHabitScheduledForDate } from '../../utils/frequencyRules';
import { HabitCheckIn } from './HabitCheckIn';

export const DateWiseCheckIn = ({ habits, logs, goals, logHabit }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const getHabitsForDate = (date) => {
    return habits.filter(habit => {
      if (!habit.isActive) return false;
      return isHabitScheduledForDate(habit, date, goals);
    });
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  const isToday = (date) => {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  const isFuture = (date) => {
    const today = new Date();
    return date > today;
  };

  const getCompletionStatus = (date) => {
    const habitsForDate = getHabitsForDate(date);
    if (habitsForDate.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const completed = habitsForDate.filter(habit => {
      const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
      return log?.status === 'done';
    }).length;
    
    return {
      completed,
      total: habitsForDate.length,
      percentage: Math.round((completed / habitsForDate.length) * 100)
    };
  };

  const selectedDateHabits = getHabitsForDate(selectedDate);
  const weekDays = getWeekDays();

  return (
    <Card>
      <CardHeader
        title="Date-wise Check-in"
        subheader={format(selectedDate, 'EEEE, MMMM d, yyyy')}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={() => setSelectedDate(new Date())}>
              <Today />
            </IconButton>
            <IconButton onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              <ChevronRight />
            </IconButton>
          </Box>
        }
      />
      <CardContent>
        {/* Week Overview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Week Overview</Typography>
          <Grid container spacing={1}>
            {weekDays.map((day) => {
              const status = getCompletionStatus(day);
              const isSelectedDay = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              
              return (
                <Grid item xs key={format(day, 'yyyy-MM-dd')}>
                  <Box
                    onClick={() => setSelectedDate(day)}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 1,
                      border: isSelectedDay ? 2 : 1,
                      borderColor: isSelectedDay ? 'primary.main' : 'divider',
                      bgcolor: isToday(day) ? 'primary.50' : 'transparent',
                      '&:hover': { bgcolor: 'grey.50' }
                    }}
                  >
                    <Typography variant="caption" display="block">
                      {format(day, 'EEE')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {format(day, 'd')}
                    </Typography>
                    {status.total > 0 && (
                      <Chip
                        label={`${status.completed}/${status.total}`}
                        size="small"
                        color={status.percentage === 100 ? 'success' : status.percentage > 0 ? 'primary' : 'default'}
                        sx={{ mt: 0.5, fontSize: '0.7rem', height: 16 }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Selected Date Habits */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Habits for {format(selectedDate, 'MMMM d')}
          </Typography>
          
          {selectedDateHabits.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No habits scheduled for this date
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedDateHabits.map((habit) => {
                const goalName = habit.goalIds?.length > 0 
                  ? goals.find(g => habit.goalIds.includes(g.id))?.title 
                  : null;
                
                return (
                  <Box
                    key={habit.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {habit.name}
                      </Typography>
                      {habit.time && (
                        <Typography variant="caption" color="text.secondary">
                          {habit.time}
                        </Typography>
                      )}
                      {goalName && (
                        <Typography variant="caption" color="primary.main" display="block">
                          → {goalName}
                        </Typography>
                      )}
                    </Box>
                    
                    {isFuture(selectedDate) ? (
                      <Chip label="Future" size="small" variant="outlined" />
                    ) : (
                      <HabitCheckIn
                        habit={habit}
                        logs={logs}
                        logHabit={logHabit}
                        date={selectedDate}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};