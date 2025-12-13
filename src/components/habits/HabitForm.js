import React, { useState } from 'react';
import { Card, CardHeader, CardContent, TextField, Button, Box, Grid, MenuItem } from '@mui/material';
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
    <Card 
      elevation={0}
      sx={{ 
        border: '2px solid',
        borderColor: 'success.main',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 4 }
      }}
    >
      <CardHeader 
        title="Create New Habit"
        subheader="Link a daily action to your goal with context (trigger, time, location)"
        titleTypographyProps={{ fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Habit Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Read for 30 minutes"
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'success.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Linked Goal"
                name="goalId"
                value={formData.goalId}
                onChange={handleChange}
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'success.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              >
                {goals.map(goal => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trigger"
                name="trigger"
                value={formData.trigger}
                onChange={handleChange}
                placeholder="After morning tea"
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'success.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'success.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Living room"
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'success.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={!formData.name || !formData.goalId || !formData.trigger || !formData.time || !formData.location}
                sx={{ 
                  fontWeight: 600,
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: 3 },
                  transition: 'all 0.2s'
                }}
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
