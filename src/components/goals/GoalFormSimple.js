import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, TextField, Button, Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ContentCopy, TrendingUp, CalendarMonth, AutoAwesome, Edit } from '@mui/icons-material';
import { generateId } from '../../utils/calculations';
import { format, addMonths, startOfMonth, endOfMonth, differenceInMonths, parseISO } from 'date-fns';

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
  const [formData, setFormData] = useState({
    title: '',
    yearlyTarget: '',
    unit: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(addMonths(new Date(), 11)), 'yyyy-MM-dd')
  });
  
  const [monthlyTargets, setMonthlyTargets] = useState({});
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  // Generate months based on start/end date range
  const goalMonths = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return [];
    
    const start = startOfMonth(parseISO(formData.startDate));
    const end = startOfMonth(parseISO(formData.endDate));
    const monthCount = differenceInMonths(end, start) + 1;
    
    const months = [];
    for (let i = 0; i < monthCount; i++) {
      months.push(addMonths(start, i));
    }
    return months;
  }, [formData.startDate, formData.endDate]);
  
  // Auto-calculate monthly targets when total target or dates change
  useEffect(() => {
    if (formData.yearlyTarget && parseFloat(formData.yearlyTarget) > 0 && goalMonths.length > 0) {
      const totalValue = parseFloat(formData.yearlyTarget);
      const monthlyValue = (totalValue / goalMonths.length).toFixed(1);
      
      const autoTargets = {};
      goalMonths.forEach(month => {
        autoTargets[format(month, 'yyyy-MM')] = monthlyValue;
      });
      
      setMonthlyTargets(autoTargets);
      setIsAutoFilled(true);
    } else {
      // Clear targets if no total target
      const emptyTargets = {};
      goalMonths.forEach(month => {
        emptyTargets[format(month, 'yyyy-MM')] = '';
      });
      setMonthlyTargets(emptyTargets);
      setIsAutoFilled(false);
    }
  }, [formData.yearlyTarget, goalMonths]);

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
    if (e.key === 'Enter' && index < goalMonths.length - 1) {
      const nextMonthKey = format(goalMonths[index + 1], 'yyyy-MM');
      const nextInput = document.querySelector(`input[data-month="${nextMonthKey}"]`);
      if (nextInput) nextInput.focus();
    }
  }, [goalMonths]);

  const redistributeEvenly = () => {
    if (formData.yearlyTarget && parseFloat(formData.yearlyTarget) > 0 && goalMonths.length > 0) {
      const totalValue = parseFloat(formData.yearlyTarget);
      const monthlyValue = (totalValue / goalMonths.length).toFixed(1);
      
      const evenTargets = {};
      goalMonths.forEach(month => {
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
      year: parseISO(formData.startDate).getFullYear(),
      startDate: parseISO(formData.startDate),
      endDate: endOfMonth(parseISO(formData.endDate)),
      monthlyTargets,
      monthlyData: {},
      status: 'active',
      createdAt: new Date()
    };

    onAddGoal(newGoal);
    setFormData({ 
      title: '', 
      yearlyTarget: '', 
      unit: '', 
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(addMonths(new Date(), 11)), 'yyyy-MM-dd')
    });
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
          Set your goal with custom start and end dates - we'll break it down automatically!
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Goal Input */}
            <Grid item xs={12}>
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
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Total Target"
                name="yearlyTarget"
                type="number"
                value={formData.yearlyTarget}
                onChange={handleChange}
                placeholder="24"
                required
                inputProps={{ min: 1, step: 0.1 }}
                helperText="Total amount"
              />
            </Grid>
            
            <Grid item xs={4}>
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
            
            <Grid item xs={4}>
              <Box sx={{ p: 1, bgcolor: 'info.50', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {goalMonths.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  months
                </Typography>
              </Box>
            </Grid>
            
            {/* Date Selection */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Goal start date"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Goal end date"
              />
            </Grid>
            
            {/* Auto-calculation info */}
            {formData.yearlyTarget && goalMonths.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                    🤖 Auto-Calculated
                  </Typography>
                  <Typography variant="body2">
                    {(parseFloat(formData.yearlyTarget) / goalMonths.length).toFixed(1)} {formData.unit} per month
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Evenly distributed across {goalMonths.length} months ({format(parseISO(formData.startDate), 'MMM yyyy')} - {format(parseISO(formData.endDate), 'MMM yyyy')})
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {/* Monthly Breakdown */}
            {formData.yearlyTarget && goalMonths.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth color="primary" />
                    Monthly Breakdown ({goalMonths.length} months)
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
                      {goalMonths.map((month, index) => {
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
                      📊 Goal Summary
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
                          {filledMonths}/{goalMonths.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Months planned
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {goalMonths.length}m
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Duration
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
                🎯 Create Goal: {totalTarget} {formData.unit} in {goalMonths.length} months
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};