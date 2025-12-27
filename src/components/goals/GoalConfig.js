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
    <Box sx={{ mb: 5 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        py: 2
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            Goals
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {goals.length} {goals.length === 1 ? 'goal' : 'goals'} in progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddGoal}
          sx={{ 
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(91, 124, 153, 0.2)'
          }}
        >
          Add Goal
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          border: '2px dashed', 
          borderColor: 'divider', 
          borderRadius: 4,
          bgcolor: 'grey.25'
        }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
            No goals yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Set meaningful goals to give direction to your habits and track your progress
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleAddGoal}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Add Your First Goal
          </Button>
        </Box>
      ) : (
        <Stack 
          direction="row" 
          spacing={3} 
          sx={{ 
            overflowX: 'auto',
            pb: 2,
            px: 1,
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-track': { 
              bgcolor: 'grey.100', 
              borderRadius: 4,
              mx: 2
            },
            '&::-webkit-scrollbar-thumb': { 
              bgcolor: 'grey.400', 
              borderRadius: 4,
              '&:hover': { bgcolor: 'grey.500' }
            }
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