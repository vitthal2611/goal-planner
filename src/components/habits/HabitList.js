import React from 'react';
import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { HabitItem } from './HabitItem';

export const HabitList = ({ habits, goals, habitLogs, onLogHabit, onUpdateHabit, onDeleteHabit }) => {
  if (habits.length === 0) {
    return (
      <Card elevation={0} sx={{ border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <Box sx={{ fontSize: '2.5rem', mb: 2, opacity: 0.6 }}>✅</Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No habits yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first habit above to start building your routine
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
              goals={goals}
              habitLogs={habitLogs}
              onLogHabit={onLogHabit}
              onUpdateHabit={onUpdateHabit}
              onDeleteHabit={onDeleteHabit}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};
