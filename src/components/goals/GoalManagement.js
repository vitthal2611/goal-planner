import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import { GoalForm } from './GoalForm';
import { GoalList } from './GoalList';
import { useAppContext } from '../../context/AppContext';

export const GoalManagement = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppContext();
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>Goals</Typography>
        <Typography variant="body1" color="text.secondary">Set and track your yearly objectives</Typography>
      </Box>

      {/* Primary Action - Create Goal */}
      <Box sx={{ mb: 7 }}>
        <GoalForm onAddGoal={addGoal} />
      </Box>

      <Divider sx={{ mb: 6 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
          Your Goals ({goals.length})
        </Typography>
      </Divider>

      {/* Goal List */}
      <GoalList 
        goals={goals} 
        onUpdateGoal={updateGoal}
        onDeleteGoal={deleteGoal}
      />
    </Container>
  );
};
