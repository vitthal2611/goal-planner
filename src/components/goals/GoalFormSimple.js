import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, TextField, Button, Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ContentCopy, TrendingUp, CalendarMonth, AutoAwesome, Edit } from '@mui/icons-material';
import { generateId } from '../../utils/calculations';
import { format, addMonths, startOfYear, endOfYear } from 'date-fns';
import { useYear } from '../../context/YearContext';

const MonthRow = React.memo(({ month, value, onChange, onKeyDown, isCurrentMonth, isAutoFilled }) => {
  return (
    <TableRow sx={{ 
      bgcolor: isCurrentMonth ? 'primary.50' : isAutoFilled ? 'success.50' : 'inherit',
      '&:hover': { bgcolor: isCurrentMonth ? 'primary.100' : 'grey.50' }
    }}>
      <TableCell sx={{ fontWeight: isCurrentMonth ? 600 : 500 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {format(month, 'MMM yyyy')}
          {isCurrentMonth && (
            <Chip size="small" label="Current" color="primary" sx={{ fontSize: '0.7rem' }} />
          )}
          {isAutoFilled && (
            <Chip size="small" label="Auto" color="success" sx={{ fontSize: '0.7rem' }} />
          )}
        </Box>
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="0"
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ width: 80 }}
        />
      </TableCell>
    </TableRow>
  );
});

export const GoalFormSimple = ({ onAddGoal }) => {
  const { selectedYear } = useYear();
  const [formData, setFormData] = useState({
    title: '',
    yearlyTarget: '',
    unit: '',
    targetYear: selectedYear
  });
  
  const [monthlyTargets, setMonthlyTargets] = useState({});
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  // Generate 12 months for the selected year
  const yearMonths = useMemo(() => {
    const months = [];
    const startYear = parseInt(formData.targetYear);
    for (let i = 0; i < 12; i++) {
      months.push(addMonths(new Date(startYear, 0, 1), i));
    }
    return months;
  }, [formData.targetYear]);
  
  // Auto-calculate monthly targets when yearly target changes
  useEffect(() => {
    if (formData.yearlyTarget && parseFloat(formData.yearlyTarget) > 0) {
      const yearlyValue = parseFloat(formData.yearlyTarget);
      const monthlyValue = (yearlyValue / 12).toFixed(1);
      
      const autoTargets = {};
      yearMonths.forEach(month => {
        autoTargets[format(month, 'yyyy-MM')] = monthlyValue;
      });
      
      setMonthlyTargets(autoTargets);
      setIsAutoFilled(true);
    } else {
      // Clear targets if no yearly target
      const emptyTargets = {};
      yearMonths.forEach(month => {
        emptyTargets[format(month, 'yyyy-MM')] = '';
      });
      setMonthlyTargets(emptyTargets);
      setIsAutoFilled(false);
    }
  }, [formData.yearlyTarget, yearMonths]);

  const { totalTarget, avgPerMonth, filledMonths } = useMemo(() => {
    const values = Object.values(monthlyTargets).map(v => parseFloat(v) || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const filled = values.filter(v => v > 0).length;
    
    return {
      totalTarget: total,
      avgPerMonth: filled > 0 ? total / filled : 0,
      filledMonths: filled
    };
  }, [monthlyTargets]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMonthlyChange = useCallback((monthKey) => (e) => {
    setMonthlyTargets(prev => ({ ...prev, [monthKey]: e.target.value }));
    setIsAutoFilled(false); // User is manually editing
  }, []);

  const handleKeyDown = useCallback((monthKey, index) => (e) => {
    if (e.key === 'Enter' && index < yearMonths.length - 1) {
      const nextMonthKey = format(yearMonths[index + 1], 'yyyy-MM');
      const nextInput = document.querySelector(`input[data-month="${nextMonthKey}"]`);
      if (nextInput) nextInput.focus();
    }
  }, [yearMonths]);

  const redistributeEvenly = () => {
    if (formData.yearlyTarget && parseFloat(formData.yearlyTarget) > 0) {
      const yearlyValue = parseFloat(formData.yearlyTarget);
      const monthlyValue = (yearlyValue / 12).toFixed(1);
      
      const evenTargets = {};
      yearMonths.forEach(month => {
        evenTargets[format(month, 'yyyy-MM')] = monthlyValue;
      });
      
      setMonthlyTargets(evenTargets);
      setIsAutoFilled(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.unit || totalTarget === 0) return;

    const newGoal = {
      id: generateId(),
      title: formData.title,
      yearlyTarget: totalTarget,
      actualProgress: 0,
      unit: formData.unit,
      year: parseInt(formData.targetYear),
      startDate: startOfYear(new Date(formData.targetYear, 0, 1)),
      endDate: endOfYear(new Date(formData.targetYear, 0, 1)),
      monthlyTargets,
      monthlyData: {},
      status: 'active',
      createdAt: new Date()
    };

    onAddGoal(newGoal);
    setFormData({ title: '', yearlyTarget: '', unit: '', targetYear: selectedYear });
    setMonthlyTargets({});
    setIsAutoFilled(false);
  };

  return (
    <Card elevation={0} sx={{ border: '2px solid', borderColor: 'primary.main' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <AutoAwesome color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Smart Goal Planning
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Just say "Read 24 books in 2025" - we'll break it down automatically!
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Goal Input */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="What's your goal?"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Read books"
                required
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Yearly Target"
                name="yearlyTarget"
                type="number"
                value={formData.yearlyTarget}
                onChange={handleChange}
                placeholder="24"
                required
                inputProps={{ min: 1, step: 0.1 }}
                helperText="Total for the year"
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="books"
                required
                helperText="How to measure"
              />
            </Grid>
            
            {/* Year Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Year</InputLabel>
                <Select
                  name="targetYear"
                  value={formData.targetYear}
                  onChange={handleChange}
                  label="Target Year"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Auto-calculation info */}
            {formData.yearlyTarget && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                    🤖 Auto-Calculated
                  </Typography>
                  <Typography variant="body2">
                    {(parseFloat(formData.yearlyTarget) / 12).toFixed(1)} {formData.unit} per month
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Evenly distributed across 12 months
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {/* Monthly Breakdown */}
            {formData.yearlyTarget && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth color="primary" />
                    Monthly Breakdown for {formData.targetYear}
                  </Typography>
                  <Tooltip title="Redistribute evenly across all months">
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<AutoAwesome />}
                      onClick={redistributeEvenly}
                    >
                      Auto-Fill
                    </Button>
                  </Tooltip>
                </Box>
                
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Month</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>Target {formData.unit}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yearMonths.map((month, index) => {
                        const monthKey = format(month, 'yyyy-MM');
                        const currentDate = new Date();
                        const isCurrentMonth = month.getFullYear() === currentDate.getFullYear() && 
                                             month.getMonth() === currentDate.getMonth();
                        
                        return (
                          <MonthRow
                            key={monthKey}
                            month={month}
                            value={monthlyTargets[monthKey] || ''}
                            onChange={handleMonthlyChange(monthKey)}
                            onKeyDown={handleKeyDown(monthKey, index)}
                            isCurrentMonth={isCurrentMonth}
                            isAutoFilled={isAutoFilled && monthlyTargets[monthKey]}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {totalTarget > 0 && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                      📊 Goal Summary for {formData.targetYear}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {totalTarget}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total {formData.unit}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {avgPerMonth.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Avg per month
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {filledMonths}/12
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Months planned
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {formData.targetYear}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target year
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={!formData.title || !formData.unit || totalTarget === 0}
                sx={{ height: 56, fontWeight: 600 }}
              >
                🎯 Create Goal: {totalTarget} {formData.unit} in {formData.targetYear}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};