import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Chip, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';

export const HabitDialog = ({ open, onClose, onSave, habit = null, goals = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily',
    goalIds: [],
    time: '',
    selectedDays: []
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        frequency: habit.frequency || 'daily',
        goalIds: habit.goalIds || [],
        time: habit.time || '',
        selectedDays: habit.selectedDays || []
      });
    } else {
      setFormData({
        name: '',
        frequency: 'daily',
        goalIds: [],
        time: '',
        selectedDays: []
      });
    }
  }, [habit, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    const habitData = {
      ...formData,
      id: habit?.id || `habit_${Date.now()}`,
      isActive: true,
      createdAt: habit?.createdAt || new Date()
    };
    
    onSave(habitData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{habit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Habit Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={formData.frequency}
                label="Frequency"
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="custom">Custom Days</MenuItem>
                <MenuItem value="weekends">Weekends Only</MenuItem>
                <MenuItem value="weekdays">Weekdays Only</MenuItem>
                <MenuItem value="monthly">Monthly (1st of month)</MenuItem>
              </Select>
            </FormControl>
            
            {formData.frequency === 'custom' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>Select Days:</Typography>
                <FormGroup row>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={formData.selectedDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, selectedDays: [...prev.selectedDays, day] }));
                            } else {
                              setFormData(prev => ({ ...prev, selectedDays: prev.selectedDays.filter(d => d !== day) }));
                            }
                          }}
                        />
                      }
                      label={day.charAt(0).toUpperCase() + day.slice(1)}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
            
            <FormControl fullWidth>
              <InputLabel>Link to Goals</InputLabel>
              <Select
                multiple
                value={formData.goalIds}
                label="Link to Goals"
                onChange={(e) => setFormData(prev => ({ ...prev, goalIds: e.target.value }))}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((goalId) => {
                      const goal = goals.find(g => g.id === goalId);
                      return <Chip key={goalId} label={goal?.title || goalId} size="small" />;
                    })}
                  </Box>
                )}
              >
                {goals.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {habit ? 'Update' : 'Add'} Habit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};