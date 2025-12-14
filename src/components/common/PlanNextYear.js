import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox, Typography, Box, Chip, Stack, Alert } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { generateId } from '../../utils/calculations';

export const PlanNextYear = ({ goals, habits, onPlan, currentYear }) => {
  const [open, setOpen] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState([]);

  const nextYear = currentYear + 1;

  const handleOpen = () => {
    setSelectedGoals(goals.map(g => g.id));
    setSelectedHabits(habits.map(h => h.id));
    setOpen(true);
  };

  const handleConfirm = () => {
    const newGoals = goals
      .filter(g => selectedGoals.includes(g.id))
      .map(g => ({
        ...g,
        id: generateId(),
        year: nextYear,
        actualProgress: 0,
        startDate: new Date(`${nextYear}-01-01`),
        endDate: new Date(`${nextYear}-12-31`),
        createdAt: new Date(),
        monthlyData: {},
        monthlyTargets: {}
      }));

    const goalIdMap = {};
    goals.forEach((oldGoal, idx) => {
      if (selectedGoals.includes(oldGoal.id)) {
        goalIdMap[oldGoal.id] = newGoals.find(ng => ng.title === oldGoal.title)?.id;
      }
    });

    const newHabits = habits
      .filter(h => selectedHabits.includes(h.id))
      .map(h => ({
        ...h,
        id: generateId(),
        startYear: nextYear,
        goalIds: h.goalIds.map(gid => goalIdMap[gid] || gid).filter(Boolean),
        createdAt: new Date()
      }));

    onPlan({ goals: newGoals, habits: newHabits });
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<ContentCopy />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Plan Next Year ({nextYear})
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Plan {nextYear}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Select goals and habits to copy to {nextYear}. Progress will be reset.
          </Alert>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Goals ({goals.length})
          </Typography>
          <FormGroup>
            {goals.map(goal => (
              <FormControlLabel
                key={goal.id}
                control={
                  <Checkbox
                    checked={selectedGoals.includes(goal.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGoals([...selectedGoals, goal.id]);
                      } else {
                        setSelectedGoals(selectedGoals.filter(id => id !== goal.id));
                      }
                    }}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{goal.title}</span>
                    <Chip label={`${goal.yearlyTarget} ${goal.unit}`} size="small" />
                  </Stack>
                }
              />
            ))}
          </FormGroup>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Habits ({habits.length})
          </Typography>
          <FormGroup>
            {habits.map(habit => (
              <FormControlLabel
                key={habit.id}
                control={
                  <Checkbox
                    checked={selectedHabits.includes(habit.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedHabits([...selectedHabits, habit.id]);
                      } else {
                        setSelectedHabits(selectedHabits.filter(id => id !== habit.id));
                      }
                    }}
                  />
                }
                label={habit.name}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained"
            disabled={selectedGoals.length === 0 && selectedHabits.length === 0}
          >
            Create Plan for {nextYear}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
