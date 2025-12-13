import React from 'react';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { HabitItem } from './HabitItem';

export const HabitList = ({ habits, goals, habitLogs, onLogHabit, onDeleteHabit }) => {
  if (habits.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            No habits yet. Create your first habit above!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {habits.map(habit => {
        const goal = goals.find(g => habit.goalIds.includes(g.id));
        
        return (
          <Grid item xs={12} md={6} key={habit.id}>
            <HabitItem
              habit={habit}
              goal={goal}
              habitLogs={habitLogs}
              onLogHabit={onLogHabit}
              onDeleteHabit={onDeleteHabit}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};
