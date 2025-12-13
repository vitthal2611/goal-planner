import React from 'react';
import { Box, Typography } from '@mui/material';
import { GoalForm } from './GoalForm';
import { GoalList } from './GoalList';
import { useAppContext } from '../../context/AppContext';

export const GoalManagement = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppContext();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Goal Management
      </Typography>

      <Box sx={{ mb: 4 }}>
        <GoalForm onAddGoal={addGoal} />
      </Box>

      <GoalList 
        goals={goals} 
        onUpdateGoal={updateGoal}
        onDeleteGoal={deleteGoal}
      />
    </Box>
  );
};
