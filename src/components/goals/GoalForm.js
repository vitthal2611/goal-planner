import React, { useState } from 'react';
import { Card, CardHeader, CardContent, TextField, Button, Box, Grid } from '@mui/material';
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
    <Card 
      elevation={0}
      sx={{ 
        border: '2px solid',
        borderColor: 'primary.main',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 4 }
      }}
    >
      <CardHeader 
        title="Create New Goal"
        subheader="Set a yearly target and track your progress automatically"
        titleTypographyProps={{ fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Read 24 books"
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="Yearly Target"
                name="yearlyTarget"
                type="number"
                value={formData.yearlyTarget}
                onChange={handleChange}
                placeholder="24"
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="books"
                required
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 2 }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={!formData.title || !formData.yearlyTarget || !formData.unit}
                sx={{ 
                  height: 56, 
                  fontWeight: 600,
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: 3 },
                  transition: 'all 0.2s'
                }}
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
