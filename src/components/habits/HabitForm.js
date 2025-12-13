import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Box, Typography, Grid, MenuItem } from '@mui/material';
import { generateId } from '../../utils/calculations';

export const HabitForm = ({ goals, onAddHabit }) => {
  const [formData, setFormData] = useState({
    name: '',
    goalId: '',
    trigger: '',
    time: '',
    location: '',
    frequency: 'daily'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.goalId || !formData.trigger || !formData.time || !formData.location) return;

    const newHabit = {
      id: generateId(),
      name: formData.name,
      goalIds: [formData.goalId],
      trigger: formData.trigger,
      time: formData.time,
      location: formData.location,
      frequency: formData.frequency,
      isActive: true,
      createdAt: new Date()
    };

    onAddHabit(newHabit);
    setFormData({ name: '', goalId: '', trigger: '', time: '', location: '', frequency: 'daily' });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Create New Habit</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Habit Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Read for 30 minutes"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Linked Goal"
                name="goalId"
                value={formData.goalId}
                onChange={handleChange}
                required
              >
                {goals.map(goal => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trigger"
                name="trigger"
                value={formData.trigger}
                onChange={handleChange}
                placeholder="After morning tea"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Living room"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
              >
                Add Habit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
