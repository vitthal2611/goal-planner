import React, { useState } from 'react';
import { Card, CardHeader, CardContent, TextField, Button, Box, Grid, Collapse, Typography, Alert } from '@mui/material';
import { generateId } from '../../utils/calculations';
import { format, addMonths } from 'date-fns';
import { useYear } from '../../context/YearContext';

export const GoalForm = ({ onAddGoal }) => {
  const { selectedYear } = useYear();
  const today = new Date();
  const [formData, setFormData] = useState({
    title: '',
    unit: '',
    year: selectedYear,
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(new Date(selectedYear, 11, 31), 'yyyy-MM-dd')
  });
  const [monthlyTargets, setMonthlyTargets] = useState({});
  const [showMonthly, setShowMonthly] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [dateWarning, setDateWarning] = useState(null);

  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
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

    const today = new Date();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    const newGoal = {
      id: generateId(),
      title: formData.title,
      yearlyTarget,
      actualProgress: 0,
      unit: formData.unit,
      year: formData.year,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      monthlyTargets
    };

    onAddGoal(newGoal);
    const resetDate = new Date();
    setFormData({ 
      title: '', 
      unit: '', 
      year: selectedYear,
      startDate: format(resetDate, 'yyyy-MM-dd'),
      endDate: format(new Date(selectedYear, 11, 31), 'yyyy-MM-dd')
    });
    setMonthlyTargets({});
    setShowMonthly(false);
    setShowDates(false);
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
                onClick={() => setShowDates(!showDates)}
                sx={{ mb: 1 }}
              >
                {showDates ? 'Hide' : 'Set'} Custom Dates (Optional)
              </Button>
              <Collapse in={showDates}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    By default, goals start today and end on Dec 31
                  </Typography>
                  {dateWarning && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {dateWarning}
                    </Alert>
                  )}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ bgcolor: 'white' }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ bgcolor: 'white' }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowMonthly(!showMonthly)}
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
