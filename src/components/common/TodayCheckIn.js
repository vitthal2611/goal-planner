import React from 'react';
import { Card, CardHeader, CardContent, Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Divider } from '@mui/material';
import { CheckCircle, Schedule, TrendingUp } from '@mui/icons-material';
import { format } from 'date-fns';
import { HabitCheckIn } from './HabitCheckIn';

export const TodayCheckIn = ({ habits, logs, goals, logHabit }) => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const todayHabits = habits.filter(habit => {
    if (!habit.isActive) return false;
    
    // Check if habit is scheduled for today based on linked goals
    if (habit.goalIds && habit.goalIds.length > 0) {
      const isActiveForAnyGoal = habit.goalIds.some(goalId => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return true;
        const goalStart = goal.startDate ? new Date(goal.startDate) : new Date(0);
        const goalEnd = goal.endDate ? new Date(goal.endDate) : new Date(2099, 11, 31);
        return today >= goalStart && today <= goalEnd;
      });
      if (!isActiveForAnyGoal) return false;
    }
    
    return true;
  });

  const completedCount = todayHabits.filter(habit => {
    const log = logs.find(l => l.habitId === habit.id && l.date === todayStr);
    return log?.status === 'done';
  }).length;

  const getGoalName = (habitGoalIds) => {
    if (!habitGoalIds || habitGoalIds.length === 0) return null;
    const goal = goals.find(g => habitGoalIds.includes(g.id));
    return goal?.title;
  };

  if (todayHabits.length === 0) {
    return (
      <Card>
        <CardHeader 
          title="Today's Check-in"
          avatar={<CheckCircle color="primary" />}
        />
        <CardContent>
          <Typography color="text.secondary">
            No habits scheduled for today
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Today's Check-in"
        subheader={`${completedCount} of ${todayHabits.length} completed`}
        avatar={<CheckCircle color="primary" />}
        action={
          <Chip 
            label={`${Math.round((completedCount / todayHabits.length) * 100)}%`}
            color={completedCount === todayHabits.length ? 'success' : 'primary'}
            variant="outlined"
          />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <List disablePadding>
          {todayHabits.map((habit, index) => {
            const goalName = getGoalName(habit.goalIds);
            
            return (
              <React.Fragment key={habit.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {habit.name}
                        </Typography>
                        {habit.time && (
                          <Chip 
                            icon={<Schedule />}
                            label={habit.time}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      goalName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <TrendingUp fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {goalName}
                          </Typography>
                        </Box>
                      )
                    }
                  />
                  <ListItemSecondaryAction>
                    <HabitCheckIn 
                      habit={habit}
                      logs={logs}
                      logHabit={logHabit}
                      date={today}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < todayHabits.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};