import React from 'react';
import { Box, Container, Typography, Divider, Stack, Grid } from '@mui/material';
import { GoalFormSimple as GoalForm } from './GoalFormSimple';
import { ImprovedGoalCard } from './ImprovedGoalCard';
import { useAppContext } from '../../context/AppContext';
import { useYear } from '../../context/YearContext';

export const GoalManagement = () => {
  const { goals, habits, addGoal, updateGoal, deleteGoal, addHabit } = useAppContext();
  const { isCurrentYear, isReadOnly, selectedYear } = useYear();
  
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>Goals</Typography>
          <Typography variant="body1" color="text.secondary">Set and track your yearly objectives</Typography>
        </Box>
      </Stack>

      {!isReadOnly && (
        <>
          <Box sx={{ mb: 7 }}>
            <GoalForm onAddGoal={addGoal} />
          </Box>
        </>
      )}

      <Divider sx={{ mb: 6 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
          Your Goals ({goals.length})
        </Typography>
      </Divider>

      {/* Goal List */}
      <Box>
        <Grid container spacing={3}>
          {goals.map(goal => (
            <Grid item xs={12} key={goal.id}>
              <ImprovedGoalCard 
                goal={goal}
                onUpdate={(monthKey, value) => {
                  const updatedMonthlyData = { ...goal.monthlyData, [monthKey]: value };
                  const totalProgress = Object.values(updatedMonthlyData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                  updateGoal(goal.id, { monthlyData: updatedMonthlyData, actualProgress: totalProgress });
                  console.log('Updated:', monthKey, value, 'Total:', totalProgress);
                }}
                onDelete={deleteGoal}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};
