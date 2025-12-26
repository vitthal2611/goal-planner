import React, { useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Add } from '@mui/icons-material';
import { GoalCard } from './GoalCard';
import { GoalDialog } from './GoalDialog';
import { useAppContext } from '../../context/AppContext';

export const GoalConfig = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setDialogOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const handleSaveGoal = (goalData) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Goals ({goals.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddGoal}
          sx={{ borderRadius: 2 }}
        >
          Add Goal
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6, 
          border: '2px dashed', 
          borderColor: 'divider', 
          borderRadius: 2,
          bgcolor: 'grey.50'
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No goals yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first goal to start tracking progress
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={handleAddGoal}>
            Add Your First Goal
          </Button>
        </Box>
      ) : (
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-track': { bgcolor: 'grey.100', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 4 }
          }}
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </Stack>
      )}

      <GoalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />
    </Box>
  );
};