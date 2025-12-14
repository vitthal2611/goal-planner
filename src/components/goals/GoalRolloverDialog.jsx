import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Stack
} from '@mui/material';
import { GoalRolloverCard } from './GoalRolloverCard';
import { categorizeGoalsForRollover, processGoalRollover } from '../../utils/rolloverUtils';

export const GoalRolloverDialog = ({ open, onClose, onConfirm, goals, newYear }) => {
  const { completed, incomplete } = categorizeGoalsForRollover(goals);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const handleToggleGoal = (goal) => {
    setSelectedGoals(prev => 
      prev.includes(goal.id)
        ? prev.filter(id => id !== goal.id)
        : [...prev, goal.id]
    );
  };

  const handleConfirm = () => {
    const goalsToRollover = incomplete.filter(goal => selectedGoals.includes(goal.id));
    const rolledOverGoals = processGoalRollover(goalsToRollover, newYear);
    onConfirm(rolledOverGoals);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Roll Over Goals to {newYear}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          Select which incomplete goals you'd like to continue working on next year.
        </Typography>

        {completed.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              ✅ Completed Goals ({completed.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These goals won't be rolled over
            </Typography>
            <Stack spacing={2}>
              {completed.map(goal => (
                <GoalRolloverCard
                  key={goal.id}
                  goal={goal}
                  selected={false}
                  onToggle={() => {}}
                  disabled={true}
                />
              ))}
            </Stack>
          </Box>
        )}

        {incomplete.length > 0 && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" color="warning.main" gutterBottom>
              📋 Incomplete Goals ({incomplete.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select goals to roll over to {newYear}
            </Typography>
            <Stack spacing={2}>
              {incomplete.map(goal => (
                <GoalRolloverCard
                  key={goal.id}
                  goal={goal}
                  selected={selectedGoals.includes(goal.id)}
                  onToggle={() => handleToggleGoal(goal)}
                />
              ))}
            </Stack>
          </Box>
        )}

        {incomplete.length === 0 && completed.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center">
            No goals found to roll over.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={selectedGoals.length === 0}
        >
          Roll Over {selectedGoals.length} Goal{selectedGoals.length !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
