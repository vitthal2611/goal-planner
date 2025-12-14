import React, { useState } from 'react';
import { Card, CardHeader, CardContent, TextField, Button, Box, Grid, Collapse } from '@mui/material';
import { generateId } from '../../utils/calculations';
import { format, addMonths } from 'date-fns';
import { useYear } from '../../context/YearContext';

export const GoalForm = ({ onAddGoal }) => {
  const { selectedYear } = useYear();
  const [formData, setFormData] = useState({
    title: '',
    unit: '',
    year: selectedYear
  });
  const [monthlyTargets, setMonthlyTargets] = useState({});
  const [showMonthly, setShowMonthly] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMonthlyTargetChange = (monthKey, value) => {
    setMonthlyTargets(prev => ({ ...prev, [monthKey]: value }));
  };

  const getMonths = () => {
    const months = [];
    const start = new Date(formData.year, 0, 1);
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(start, i);
      months.push({
        key: format(monthDate, 'yyyy-MM'),
        label: format(monthDate, 'MMM')
      });
    }
    return months;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.unit) return;

    const yearlyTarget = Object.values(monthlyTargets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    const newGoal = {
      id: generateId(),
      title: formData.title,
      yearlyTarget,
      actualProgress: 0,
      unit: formData.unit,
      year: formData.year,
      startDate: new Date(formData.year, 0, 1),
      endDate: new Date(formData.year, 11, 31),
      createdAt: new Date(),
      monthlyTargets
    };

    onAddGoal(newGoal);
    setFormData({ title: '', unit: '', year: selectedYear });
    setMonthlyTargets({});
    setShowMonthly(false);
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
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
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
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowMonthly(!showMonthly)}
                sx={{ mb: 2 }}
              >
                {showMonthly ? 'Hide' : 'Set'} Monthly Targets
              </Button>
              <Collapse in={showMonthly}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {getMonths().map(({ key, label }) => (
                    <Grid item xs={6} sm={3} md={2} key={key}>
                      <TextField
                        fullWidth
                        size="small"
                        label={label}
                        type="number"
                        value={monthlyTargets[key] || ''}
                        onChange={(e) => handleMonthlyTargetChange(key, e.target.value)}
                        InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={!formData.title || !formData.unit}
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
