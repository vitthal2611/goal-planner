import React from 'react';
import { Box, Container, Typography, Divider, Stack } from '@mui/material';
import { GoalForm } from './GoalForm';
import { GoalList } from './GoalList';
import { PlanNextYear } from '../common/PlanNextYear';
import { useAppContext } from '../../context/AppContext';
import { useYear } from '../../context/YearContext';

export const GoalManagement = () => {
  const { goals, habits, addGoal, updateGoal, deleteGoal, addHabit } = useAppContext();
  const { isCurrentYear, isReadOnly, selectedYear } = useYear();
  
  const handlePlanNextYear = ({ goals: newGoals, habits: newHabits }) => {
    newGoals.forEach(g => addGoal(g));
    newHabits.forEach(h => addHabit(h));
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>Goals</Typography>
          <Typography variant="body1" color="text.secondary">Set and track your yearly objectives</Typography>
        </Box>
        {isCurrentYear && (
          <PlanNextYear 
            goals={goals} 
            habits={habits}
            onPlan={handlePlanNextYear}
            currentYear={selectedYear}
          />
        )}
      </Stack>

      {!isReadOnly && (
        <Box sx={{ mb: 7 }}>
          <GoalForm onAddGoal={addGoal} />
        </Box>
      )}

      <Divider sx={{ mb: 6 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
          Your Goals ({goals.length})
        </Typography>
      </Divider>

      {/* Goal List */}
      <GoalList 
        goals={goals}
        habits={habits}
        onUpdateGoal={updateGoal}
        onDeleteGoal={deleteGoal}
      />
    </Container>
  );
};
