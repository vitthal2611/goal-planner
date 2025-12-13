import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, TextField, Button, IconButton, LinearProgress, Chip } from '@mui/material';
import { Edit, Check, Close, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { calculateGoalProgress, breakdownGoalTargets } from '../../utils/goalUtils';

export const GoalList = ({ goals, onUpdateGoal, onDeleteGoal }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (goal) => {
    setEditingId(goal.id);
    setEditValue(goal.actualProgress.toString());
  };

  const handleSave = (goal) => {
    const newProgress = parseFloat(editValue);
    if (!isNaN(newProgress) && newProgress >= 0) {
      onUpdateGoal(goal.id, newProgress);
    }
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
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
          const isEditing = editingId === goal.id;

          return (
            <Grid item xs={12} key={goal.id}>
              <Card 
                elevation={0}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    boxShadow: 4,
                    borderColor: progress.onTrack ? 'success.main' : 'warning.main'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, gap: { xs: 2, sm: 0 } }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Target: {goal.yearlyTarget} {goal.unit} per year
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {progress.onTrack ? (
                        <Chip icon={<TrendingUp />} label="On Track" color="success" />
                      ) : (
                        <Chip icon={<TrendingDown />} label="Behind" color="warning" />
                      )}
                      <IconButton onClick={() => onDeleteGoal(goal.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 5, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ mb: 2.5, display: 'block' }}>
                      Current Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
                      {isEditing ? (
                        <>
                          <TextField
                            size="medium"
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            sx={{ width: 140 }}
                          />
                          <Typography variant="h6">/ {goal.yearlyTarget} {goal.unit}</Typography>
                          <Button size="small" variant="contained" onClick={() => handleSave(goal)} sx={{ minHeight: 44 }}>
                            Save
                          </Button>
                          <Button size="small" onClick={handleCancel} sx={{ minHeight: 44 }}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {goal.actualProgress}
                          </Typography>
                          <Typography variant="h6" color="text.secondary">
                            / {goal.yearlyTarget} {goal.unit}
                          </Typography>
                          <Chip label={`${Math.round(progress.yearlyProgress)}%`} color="primary" sx={{ fontWeight: 600 }} />
                          <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<Edit />} 
                            onClick={() => handleEdit(goal)}
                            sx={{ 
                              '&:hover': { bgcolor: 'primary.50' },
                              minHeight: 44
                            }}
                          >
                            Update
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="overline" color="text.secondary" sx={{ mb: 2.5, display: 'block' }}>
                    Auto-Calculated Targets
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 3, bgcolor: 'primary.50', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Quarterly
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {targets.quarterly.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {goal.unit} per quarter
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 3, bgcolor: 'success.50', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Monthly
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {targets.monthly.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {goal.unit} per month
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 3, bgcolor: 'warning.50', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Weekly
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {targets.weekly.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {goal.unit} per week
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="overline" color="text.secondary" sx={{ mb: 2.5, display: 'block' }}>
                    Yearly Progress
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {Math.round(progress.yearlyProgress)}% Complete
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {progress.actual} / {progress.expected} expected
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress.yearlyProgress, 100)}
                      sx={{
                        height: 12,
                        borderRadius: 2,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: progress.onTrack ? 'success.main' : 'warning.main',
                          borderRadius: 2,
                          transition: 'transform 0.4s ease'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {progress.remaining} {goal.unit} remaining
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progress.daysRemaining} days left in year
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
