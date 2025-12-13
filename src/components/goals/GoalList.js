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
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            No goals yet. Create your first goal above!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {goals.map(goal => {
        const progress = calculateGoalProgress(goal);
        const targets = breakdownGoalTargets(goal);
        const isEditing = editingId === goal.id;

        return (
          <Grid item xs={12} key={goal.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {goal.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: {goal.yearlyTarget} {goal.unit} per year
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {progress.onTrack ? (
                      <Chip icon={<TrendingUp />} label="On Track" size="small" color="success" />
                    ) : (
                      <Chip icon={<TrendingDown />} label="Behind" size="small" color="warning" />
                    )}
                    <IconButton size="small" onClick={() => onDeleteGoal(goal.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {/* Progress Update */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 120 }}>
                      Actual Progress:
                    </Typography>
                    {isEditing ? (
                      <>
                        <TextField
                          size="small"
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          sx={{ width: 120 }}
                        />
                        <Typography variant="body2">/ {goal.yearlyTarget} {goal.unit}</Typography>
                        <IconButton size="small" color="primary" onClick={() => handleSave(goal)}>
                          <Check />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancel}>
                          <Close />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {goal.actualProgress} / {goal.yearlyTarget} {goal.unit}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({Math.round(progress.yearlyProgress)}%)
                        </Typography>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(goal)}>
                          <Edit />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Auto-calculated Targets */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Quarterly Target
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {targets.quarterly.toFixed(1)} {goal.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per quarter
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Monthly Target
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {targets.monthly.toFixed(1)} {goal.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per month
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Weekly Target
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {targets.weekly.toFixed(2)} {goal.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per week
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Yearly Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {progress.actual} / {progress.expected} expected
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progress.yearlyProgress, 100)}
                    sx={{
                      height: 10,
                      borderRadius: 1,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: progress.onTrack ? 'success.main' : 'warning.main'
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {progress.remaining} {goal.unit} remaining
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {progress.daysRemaining} days left
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};
