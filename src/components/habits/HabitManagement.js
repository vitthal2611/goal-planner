import React from 'react';
import { Box, Typography } from '@mui/material';
import { HabitForm } from './HabitForm';
import { HabitList } from './HabitList';
import { useAppContext } from '../../context/AppContext';

export const HabitManagement = () => {
  const { goals, habits, habitLogs, addHabit, logHabit, deleteHabit } = useAppContext();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Habit Management
      </Typography>

      <Box sx={{ mb: 4 }}>
        <HabitForm goals={goals} onAddHabit={addHabit} />
      </Box>

      <HabitList
        habits={habits}
        goals={goals}
        habitLogs={habitLogs}
        onLogHabit={logHabit}
        onDeleteHabit={deleteHabit}
      />
    </Box>
  );
};
