import React, { useState } from 'react';
import { Card, CardHeader, CardContent, TextField, Button, Box, Grid, MenuItem, Chip, Typography, Tooltip } from '@mui/material';
import { generateId } from '../../utils/calculations';
import { FREQUENCY_TYPES, DAY_NAMES, MONTH_DATES } from '../../utils/frequencyConstants';

export const HabitForm = ({ goals, onAddHabit }) => {
  const [formData, setFormData] = useState({
    name: '',
    goalId: '',
    trigger: '',
    time: '',
    location: '',
    frequency: FREQUENCY_TYPES.DAILY,
    daysPerWeek: 3,
    selectedDays: [0, 2, 4],
    timesPerMonth: 12,
    selectedDates: [1, 15]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.goalId || !formData.trigger || !formData.time || !formData.location) return;

    let frequencyConfig = {};
    if (formData.frequency === FREQUENCY_TYPES.WEEKLY) {
      frequencyConfig = { daysPerWeek: formData.daysPerWeek };
    } else if (formData.frequency === FREQUENCY_TYPES.SPECIFIC_DAYS) {
      frequencyConfig = { days: formData.selectedDays };
    } else if (formData.frequency === FREQUENCY_TYPES.MONTHLY) {
      frequencyConfig = { timesPerMonth: formData.timesPerMonth };
    } else if (formData.frequency === FREQUENCY_TYPES.MONTHLY_DATES) {
      frequencyConfig = { dates: formData.selectedDates };
    }

    const newHabit = {
      id: generateId(),
      name: formData.name,
      goalIds: [formData.goalId],
      trigger: formData.trigger,
      time: formData.time,
      location: formData.location,
      frequency: formData.frequency,
      frequencyConfig,
      isActive: true,
      createdAt: new Date()
    };

    onAddHabit(newHabit);
    setFormData({ 
      name: '', 
      goalId: '', 
      trigger: '', 
      time: '', 
      location: '', 
      frequency: FREQUENCY_TYPES.DAILY,
      daysPerWeek: 3,
      selectedDays: [0, 2, 4],
      timesPerMonth: 12,
      selectedDates: [1, 15]
    });
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
              <Tooltip title="Choose how often this habit should be tracked" placement="top">
                <TextField
                  fullWidth
                  select
                  label="Frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  sx={{ 
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: 'success.main' },
                      '&.Mui-focused fieldset': { borderWidth: 2 }
                    }
                  }}
                >
                  <MenuItem value={FREQUENCY_TYPES.DAILY}>Daily</MenuItem>
                  <MenuItem value={FREQUENCY_TYPES.WEEKLY}>Weekly (X times per week)</MenuItem>
                  <MenuItem value={FREQUENCY_TYPES.SPECIFIC_DAYS}>Specific Days (Mon-Sun)</MenuItem>
                  <MenuItem value={FREQUENCY_TYPES.MONTHLY}>Monthly (X times per month)</MenuItem>
                  <MenuItem value={FREQUENCY_TYPES.MONTHLY_DATES}>Specific Dates (1st-31st)</MenuItem>
                </TextField>
              </Tooltip>
            </Grid>
            {formData.frequency === FREQUENCY_TYPES.WEEKLY && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Days per week"
                  value={formData.daysPerWeek}
                  onChange={(e) => setFormData({ ...formData, daysPerWeek: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1, max: 7 }}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
            )}
            {formData.frequency === FREQUENCY_TYPES.SPECIFIC_DAYS && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>Select days</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {DAY_NAMES.map((day, idx) => (
                    <Chip
                      key={idx}
                      label={day}
                      onClick={() => {
                        const days = formData.selectedDays.includes(idx)
                          ? formData.selectedDays.filter(d => d !== idx)
                          : [...formData.selectedDays, idx].sort();
                        setFormData({ ...formData, selectedDays: days });
                      }}
                      color={formData.selectedDays.includes(idx) ? 'primary' : 'default'}
                      variant={formData.selectedDays.includes(idx) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            {formData.frequency === FREQUENCY_TYPES.MONTHLY && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Times per month"
                  value={formData.timesPerMonth}
                  onChange={(e) => setFormData({ ...formData, timesPerMonth: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1, max: 31 }}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
            )}
            {formData.frequency === FREQUENCY_TYPES.MONTHLY_DATES && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>Select dates of month</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {MONTH_DATES.map((date) => (
                    <Chip
                      key={date}
                      label={date}
                      onClick={() => {
                        const dates = formData.selectedDates.includes(date)
                          ? formData.selectedDates.filter(d => d !== date)
                          : [...formData.selectedDates, date].sort((a, b) => a - b);
                        setFormData({ ...formData, selectedDates: dates });
                      }}
                      color={formData.selectedDates.includes(date) ? 'primary' : 'default'}
                      variant={formData.selectedDates.includes(date) ? 'filled' : 'outlined'}
                      sx={{ minWidth: 40 }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
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
