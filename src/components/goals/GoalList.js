import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, TextField, Button, IconButton, LinearProgress, Chip, Collapse } from '@mui/material';
import { Edit, Check, Close, Delete, TrendingUp, TrendingDown, ExpandMore } from '@mui/icons-material';
import { calculateGoalProgress, breakdownGoalTargets } from '../../utils/goalUtils';
import { format, startOfYear, addMonths } from 'date-fns';

export const GoalList = ({ goals, onUpdateGoal, onDeleteGoal }) => {
  const [expandedMonthly, setExpandedMonthly] = useState({});
  const [monthlyValues, setMonthlyValues] = useState({});

  const toggleMonthly = (goalId) => {
    setExpandedMonthly(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleMonthlyChange = (goalId, monthKey, value) => {
    setMonthlyValues(prev => ({
      ...prev,
      [goalId]: { ...(prev[goalId] || {}), [monthKey]: value }
    }));
  };

  const saveMonthlyData = (goal) => {
    const updatedMonthlyData = { ...goal.monthlyData, ...monthlyValues[goal.id] };
    const totalProgress = Object.values(updatedMonthlyData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    onUpdateGoal(goal.id, totalProgress, updatedMonthlyData);
    setMonthlyValues(prev => ({ ...prev, [goal.id]: {} }));
  };

  const getMonths = (goal) => {
    if (!goal.monthlyTargets || Object.keys(goal.monthlyTargets).length === 0) {
      return [];
    }
    
    const currentMonth = format(new Date(), 'yyyy-MM');
    const months = Object.keys(goal.monthlyTargets)
      .sort()
      .map(key => ({
        key,
        label: format(new Date(key + '-01'), 'MMM yyyy'),
        isCurrent: key === currentMonth
      }));
    
    // Move current month to the beginning
    const currentIndex = months.findIndex(m => m.isCurrent);
    if (currentIndex > 0) {
      const currentMonthObj = months.splice(currentIndex, 1)[0];
      months.unshift(currentMonthObj);
    }
    
    return months;
  };

  if (goals.length === 0) {
    return (
      <Card elevation={0} sx={{ border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <CardContent sx={{ py: 10, textAlign: 'center' }}>
          <Box sx={{ fontSize: '2.5rem', mb: 3, opacity: 0.6 }}>🎯</Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            No goals yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first goal above to start tracking your progress
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Grid container spacing={4}>
        {goals.map(goal => {
          const progress = calculateGoalProgress(goal);
          const targets = breakdownGoalTargets(goal);

          return (
            <Grid item xs={12} key={goal.id}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    elevation: 8,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ 
                  background: progress.onTrack 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  p: 3,
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {goal.yearlyTarget} {goal.unit} • Year {new Date(goal.startDate).getFullYear()}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => onDeleteGoal(goal.id)} sx={{ color: 'white' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
                    <Typography variant="h2" sx={{ fontWeight: 800 }}>
                      {Math.round(progress.yearlyProgress)}%
                    </Typography>
                    <Typography variant="h5">
                      {goal.actualProgress} / {goal.yearlyTarget}
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progress.yearlyProgress, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                        borderRadius: 4
                      }
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      icon={progress.onTrack ? <TrendingUp /> : <TrendingDown />}
                      label={progress.onTrack ? 'On Track' : 'Behind'}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {progress.remaining} {goal.unit} remaining • {progress.daysRemaining} days left
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => toggleMonthly(goal.id)}
                    endIcon={<ExpandMore sx={{ transform: expandedMonthly[goal.id] ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />}
                    sx={{ mb: 2, borderRadius: 2, py: 1.5 }}
                  >
                    Update Monthly Progress
                  </Button>
                  
                  <Collapse in={expandedMonthly[goal.id]}>
                    <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, mb: 3, maxHeight: '500px', overflowY: 'auto' }}>
                      <Grid container spacing={2}>
                        {getMonths(goal).map(({ key, label, isCurrent }) => {
                          const target = goal.monthlyTargets?.[key];
                          const actual = goal.monthlyData?.[key] || 0;
                          const monthProgress = target > 0 ? (actual / target) * 100 : 0;
                          
                          return (
                            <Grid item xs={6} sm={4} md={3} key={key}>
                              <Box sx={{ 
                                p: 2, 
                                bgcolor: isCurrent ? 'primary.50' : 'white', 
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: isCurrent ? 'primary.main' : monthProgress >= 100 ? 'success.main' : monthProgress >= 50 ? 'warning.main' : 'grey.300'
                              }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  {label}
                                </Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  placeholder="0"
                                  value={monthlyValues[goal.id]?.[key] ?? goal.monthlyData?.[key] ?? ''}
                                  onChange={(e) => handleMonthlyChange(goal.id, key, e.target.value)}
                                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                                  sx={{ mt: 1, mb: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Target: <strong>{target || 0}</strong>
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => saveMonthlyData(goal)}
                        sx={{ mt: 3, borderRadius: 2 }}
                      >
                        Save Monthly Data
                      </Button>
                    </Box>
                  </Collapse>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {targets.quarterly.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Quarterly
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {targets.monthly.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Monthly
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                          {targets.weekly.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Weekly
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
