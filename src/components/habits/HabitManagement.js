import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import { HabitForm } from './HabitForm';
import { HabitList } from './HabitList';
import { useAppContext } from '../../context/AppContext';
import { useYear } from '../../context/YearContext';

export const HabitManagement = () => {
  const { goals, habits, logs, addHabit, logHabit, deleteHabit } = useAppContext();
  const { isReadOnly } = useYear();
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>Habits</Typography>
        <Typography variant="body1" color="text.secondary">Build daily routines linked to your goals</Typography>
      </Box>

      {!isReadOnly && (
        <Box sx={{ mb: 7 }}>
          <HabitForm goals={goals} onAddHabit={addHabit} />
        </Box>
      )}

      <Divider sx={{ mb: 6 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
          Your Habits ({habits.length})
        </Typography>
      </Divider>

      {/* Habit List */}
      <HabitList
        habits={habits}
        goals={goals}
        habitLogs={logs}
        onLogHabit={logHabit}
        onDeleteHabit={deleteHabit}
      />
    </Container>
  );
};
