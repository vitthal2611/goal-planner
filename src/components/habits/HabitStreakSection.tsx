import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { LocalFireDepartment, CheckCircle } from '@mui/icons-material';
import { Habit, HabitLog } from '../../types';
import { calculateHabitConsistency, formatDate } from '../../utils/calculations';

interface HabitStreakSectionProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onLogHabit?: (habitId: string, status: 'done' | 'skipped') => void;
}

export const HabitStreakSection: React.FC<HabitStreakSectionProps> = ({ 
  habits, 
  habitLogs, 
  onLogHabit 
}) => {
  const getTodaysLog = (habitId: string) => {
    const today = formatDate(new Date());
    return habitLogs.find(log => log.habitId === habitId && log.date === today);
  };

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Habit Streaks</Typography>
          <Typography variant="body2" color="text.secondary">
            No habits created yet. Add habits to track your daily actions!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Habit Streaks
        </Typography>
        
        {habits.map(habit => {
          const consistency = calculateHabitConsistency(habit, habitLogs);
          const todaysLog = getTodaysLog(habit.id);
          
          return (
            <Card key={habit.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {habit.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {habit.trigger} • {habit.time} • {habit.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right', ml: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocalFireDepartment 
                        sx={{ 
                          fontSize: 16, 
                          mr: 0.5, 
                          color: consistency.currentStreak > 0 ? 'warning.main' : 'grey.400' 
                        }} 
                      />
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        {consistency.currentStreak}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(consistency.consistency)}% consistent
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
                          label="Done"
                          size="small"
                          clickable
                          color="success"
                          variant="outlined"
                          onClick={() => onLogHabit?.(habit.id, 'done')}
                        />
                        <Chip
                          label="Skip"
                          size="small"
                          clickable
                          variant="outlined"
                          onClick={() => onLogHabit?.(habit.id, 'skipped')}
                        />
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Best: {consistency.longestStreak} days
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