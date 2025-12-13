import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Box, Typography, Grid } from '@mui/material';
import { generateId } from '../../utils/calculations';

export const GoalForm = ({ onAddGoal }) => {
  const [formData, setFormData] = useState({
    title: '',
    yearlyTarget: '',
    unit: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.yearlyTarget || !formData.unit) return;

    const newGoal = {
      id: generateId(),
      title: formData.title,
      yearlyTarget: parseFloat(formData.yearlyTarget),
      actualProgress: 0,
      unit: formData.unit,
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(new Date().getFullYear(), 11, 31),
      createdAt: new Date()
    };

    onAddGoal(newGoal);
    setFormData({ title: '', yearlyTarget: '', unit: '' });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Create New Goal</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Goal Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Read 24 books"
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Yearly Target"
                name="yearlyTarget"
                type="number"
                value={formData.yearlyTarget}
                onChange={handleChange}
                placeholder="24"
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="books"
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ height: 56 }}
              >
                Add Goal
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
