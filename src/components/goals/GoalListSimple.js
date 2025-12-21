import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, LinearProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Menu, MenuItem, Collapse } from '@mui/material';
import { TrendingUp, TrendingDown, Edit, Check, MoreVert, Delete, EditNote, ExpandMore } from '@mui/icons-material';
import { calculateGoalProgress } from '../../utils/goalUtils';
import { format, isSameMonth } from 'date-fns';

const MonthlyTargetCard = ({ monthKey, monthDate, target, actual, unit, isCurrentMonth, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(actual);
  
  const handleSave = () => {
    const newValue = parseFloat(value) || 0;
    onUpdate(newValue);
    setEditing(false);
  };
  
  React.useEffect(() => {
    setValue(actual);
  }, [actual]);
  
  const progress = target > 0 ? (actual / target) * 100 : 0;
  
  return (
    <Box sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: isCurrentMonth ? 'primary.50' : 'grey.50',
      border: '2px solid',
      borderColor: isCurrentMonth ? 'primary.main' : 'transparent',
      textAlign: 'center',
      transition: 'all 0.2s',
      '&:hover': {
        bgcolor: isCurrentMonth ? 'primary.100' : 'grey.100',
        transform: 'translateY(-2px)'
      }
    }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
        {format(monthDate, 'MMM')}
      </Typography>
      
      <Box sx={{ my: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          Target: {target} {unit}
        </Typography>
        
        {editing ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              size="small"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              onBlur={handleSave}
              autoFocus
              sx={{ width: '100%', mb: 1 }}
              inputProps={{ min: 0, step: 0.1 }}
            />
            <IconButton size="small" onClick={handleSave} color="primary">
              <Check sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: isCurrentMonth ? 'primary.main' : 'text.primary' }}>
              {actual}
            </Typography>
            <IconButton size="small" onClick={() => { setEditing(true); setValue(actual); }}>
              <Edit sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        )}
        
        <Typography variant="caption" sx={{ color: progress >= 100 ? 'success.main' : progress >= 50 ? 'warning.main' : 'error.main', fontWeight: 600 }}>
          {Math.round(progress)}%
        </Typography>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={Math.min(progress, 100)}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            bgcolor: progress >= 100 ? 'success.main' : progress >= 50 ? 'warning.main' : 'error.main'
          }
        }}
      />
      
      {isCurrentMonth && (
        <Chip size="small" label="Current" color="primary" sx={{ mt: 1, fontSize: '0.65rem' }} />
      )}
    </Box>
  );
};

const MonthlyProgressRow = ({ monthKey, monthLabel, target, actual, onUpdate, isCurrentMonth }) => {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(actual || 0);
  
  React.useEffect(() => {
    setValue(actual || 0);
  }, [actual]);
  
  const handleSave = () => {
    onUpdate(monthKey, parseFloat(value) || 0);
    setEditing(false);
  };
  
  const progress = target > 0 ? (actual / target) * 100 : 0;
  const status = progress >= 100 ? 'complete' : progress >= 50 ? 'good' : 'behind';
  
  return (
    <TableRow sx={{ 
      bgcolor: isCurrentMonth ? 'primary.50' : 'inherit',
      '&:hover': { bgcolor: isCurrentMonth ? 'primary.100' : 'grey.50' }
    }}>
      <TableCell sx={{ fontWeight: isCurrentMonth ? 600 : 400 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {monthLabel}
          {isCurrentMonth && <Chip size="small" label="Current" color="primary" />}
        </Box>
      </TableCell>
      <TableCell align="center">{target}</TableCell>
    </TableRow>
  );
};

export const GoalList = ({ goals = [], onUpdateGoal, onDeleteGoal }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [expanded, setExpanded] = useState({});

  const handleMenuOpen = (event, goalId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedGoalId(goalId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedGoalId(null);
  };

  const handleDelete = () => {
    if (selectedGoalId && onDeleteGoal) {
      onDeleteGoal(selectedGoalId);
    }
    handleMenuClose();
  };
  const handleProgressUpdate = (goalId, monthKey, actualValue) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updatedMonthlyData = {
      ...goal.monthlyData,
      [monthKey]: actualValue
    };
    
    // Calculate total progress from all monthly data
    const totalProgress = Object.values(updatedMonthlyData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    onUpdateGoal(goalId, {
      monthlyData: updatedMonthlyData,
      actualProgress: totalProgress
    });
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
      <Grid container spacing={3}>
        {goals.map(goal => {
          const safeGoal = {
            id: goal?.id || Math.random(),
            title: String(goal?.title || 'Untitled Goal'),
            yearlyTarget: Number(goal?.yearlyTarget || 0),
            actualProgress: Number(goal?.actualProgress || 0),
            unit: String(goal?.unit || 'units'),
            monthlyTargets: goal?.monthlyTargets || {},
            monthlyData: goal?.monthlyData || {}
          };
          
          const progress = calculateGoalProgress(safeGoal);
          const completionRate = safeGoal.yearlyTarget > 0 ? (safeGoal.actualProgress / safeGoal.yearlyTarget) * 100 : 0;
          const isOnTrack = progress?.onTrack !== undefined ? progress.onTrack : completionRate >= 50;
          
          // Get months with targets
          const monthsWithTargets = Object.keys(safeGoal.monthlyTargets).filter(key => 
            parseFloat(safeGoal.monthlyTargets[key]) > 0
          );
          
          return (
            <Grid item xs={12} key={safeGoal.id}>
              <Card 
                elevation={0}
                sx={{ 
                  border: '1px solid',
                  borderColor: isOnTrack ? 'success.main' : 'warning.main',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  background: isOnTrack 
                    ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                    : 'linear-gradient(135deg, #FF9800 0%, #f57c00 100%)',
                  p: 3,
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {safeGoal.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {isNaN(completionRate) ? '0' : Math.round(completionRate)}%
                        </Typography>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {isNaN(safeGoal.actualProgress) ? 0 : safeGoal.actualProgress} / {safeGoal.yearlyTarget} {safeGoal.unit}
                          </Typography>
                          <Chip 
                            icon={isOnTrack ? <TrendingUp /> : <TrendingDown />}
                            label={isOnTrack ? 'On Track' : 'Behind'}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <IconButton 
                      onClick={(e) => handleMenuOpen(e, safeGoal.id)}
                      sx={{ color: 'white' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor) && selectedGoalId === safeGoal.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleDelete}>
                    <Delete sx={{ mr: 1 }} />
                    Delete Goal
                  </MenuItem>
                </Menu>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={Math.min(completionRate, 100)}
                  sx={{
                    height: 8,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: isOnTrack ? 'success.main' : 'warning.main'
                    }
                  }}
                />

                {/* Monthly Targets - Compact Grid */}
                {monthsWithTargets.length > 0 && (
                  <CardContent sx={{ p: 0 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 3, 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.50' }
                      }}
                      onClick={() => setExpanded(prev => ({ ...prev, [safeGoal.id]: !prev[safeGoal.id] }))}
                    >
                      <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📅 Monthly Targets
                      </Typography>
                      <IconButton 
                        sx={{ 
                          transform: expanded[safeGoal.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <ExpandMore />
                      </IconButton>
                    </Box>
                    
                    <Collapse in={expanded[safeGoal.id]}>
                      <Box sx={{ px: 3, pb: 3 }}>
                        <Grid container spacing={2}>
                      {monthsWithTargets.map(monthKey => {
                        const target = parseFloat(safeGoal.monthlyTargets[monthKey]) || 0;
                        const monthDate = new Date(monthKey + '-01');
                        const isCurrentMonth = isSameMonth(monthDate, new Date());
                        
                        return (
                          <Grid item xs={6} sm={4} md={3} key={monthKey}>
                            <MonthlyTargetCard 
                              monthKey={monthKey}
                              monthDate={monthDate}
                              target={target}
                              actual={parseFloat(safeGoal.monthlyData[monthKey]) || 0}
                              unit={safeGoal.unit}
                              isCurrentMonth={isCurrentMonth}
                              onUpdate={(value) => handleProgressUpdate(safeGoal.id, monthKey, value)}
                            />
                          </Grid>
                        );
                      })}
                        </Grid>
                      </Box>
                    </Collapse>
                  </CardContent>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};