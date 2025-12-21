import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export const WeeklyProgress = ({ selectedDate, habits, logs }) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getDayProgress = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayHabits = habits.filter(h => h.frequency === 'daily' || h.frequency === 'weekly');
    const completed = dayHabits.filter(h => 
      logs.find(log => log.habitId === h.id && log.date === dateStr && log.status === 'done')
    ).length;
    return { total: dayHabits.length, completed };
  };

  return (
    <Card elevation={0} sx={{ mb: 3, mx: { xs: 2, sm: 0 }, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          This Week
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          {weekDays.map((day) => {
            const { total, completed } = getDayProgress(day);
            const isSelected = isSameDay(day, selectedDate);
            const completionRate = total > 0 ? (completed / total) * 100 : 0;
            
            return (
              <Box key={day.toISOString()} sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {format(day, 'EEE')}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: completionRate === 100 ? 'success.main' : completionRate > 0 ? 'warning.main' : 'grey.200',
                    border: isSelected ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 0.5
                  }}
                >
                  <Typography variant="caption" sx={{ color: completionRate > 0 ? 'white' : 'text.secondary', fontWeight: 600 }}>
                    {format(day, 'd')}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {completed}/{total}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};