import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  LinearProgress, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  Collapse,
  Avatar,
  Stack,
  TextField,
  Button,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  MoreVert, 
  Delete, 
  CalendarMonth,
  ExpandMore,
  Check,
  Close,
  Save,
  Cancel,
  AutoAwesome
} from '@mui/icons-material';
import { format, parseISO, startOfMonth, endOfMonth, differenceInMonths, addMonths } from 'date-fns';

export const ImprovedGoalCard = ({ goal, onUpdate, onDelete, onEditGoal }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [editingMonth, setEditingMonth] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: goal.title,
    yearlyTarget: goal.yearlyTarget,
    unit: goal.unit,
    startDate: goal.startDate ? format(new Date(goal.startDate), 'yyyy-MM-dd') : '',
    endDate: goal.endDate ? format(new Date(goal.endDate), 'yyyy-MM-dd') : '',
    monthlyTargets: goal.monthlyTargets || {}
  });
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  // Auto-calculate monthly targets when total target or dates change
  useEffect(() => {
    if (editFormData.yearlyTarget && parseFloat(editFormData.yearlyTarget) > 0 && getEditMonthlyData().length > 0) {
      const totalValue = parseFloat(editFormData.yearlyTarget);
      const monthCount = getEditMonthlyData().length;
      const monthlyValue = (totalValue / monthCount).toFixed(1);
      
      const autoTargets = {};
      getEditMonthlyData().forEach(({ key }) => {
        autoTargets[key] = monthlyValue;
      });
      
      setEditFormData(prev => ({ ...prev, monthlyTargets: autoTargets }));
      setIsAutoFilled(true);
    } else {
      const emptyTargets = {};
      getEditMonthlyData().forEach(({ key }) => {
        emptyTargets[key] = '';
      });
      setEditFormData(prev => ({ ...prev, monthlyTargets: emptyTargets }));
      setIsAutoFilled(false);
    }
  }, [editFormData.yearlyTarget, editFormData.startDate, editFormData.endDate]);
  
  const redistributeEvenly = () => {
    if (editFormData.yearlyTarget && parseFloat(editFormData.yearlyTarget) > 0 && getEditMonthlyData().length > 0) {
      const totalValue = parseFloat(editFormData.yearlyTarget);
      const monthCount = getEditMonthlyData().length;
      const monthlyValue = (totalValue / monthCount).toFixed(1);
      
      const evenTargets = {};
      getEditMonthlyData().forEach(({ key }) => {
        evenTargets[key] = monthlyValue;
      });
      
      setEditFormData(prev => ({ ...prev, monthlyTargets: evenTargets }));
      setIsAutoFilled(true);
    }
  };
  
  const getMonthlyData = () => {
    if (!goal.startDate || !goal.endDate) {
      return {};
    }
    
    const start = startOfMonth(new Date(goal.startDate));
    const end = startOfMonth(new Date(goal.endDate));
    const monthCount = differenceInMonths(end, start) + 1;
    
    const data = {};
    for (let i = 0; i < monthCount; i++) {
      const monthDate = addMonths(start, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM yyyy');
      const target = goal.monthlyTargets?.[monthKey] || 0;
      const actual = goal.monthlyData?.[monthKey] || 0;
      data[monthKey] = { label: monthLabel, target, actual };
    }
    return data;
  };
  
  const monthlyData = getMonthlyData();
  
  const handleEditGoal = () => {
    setIsEditingGoal(true);
    setEditFormData({
      title: goal.title,
      yearlyTarget: goal.yearlyTarget,
      unit: goal.unit,
      startDate: goal.startDate ? format(new Date(goal.startDate), 'yyyy-MM-dd') : '',
      endDate: goal.endDate ? format(new Date(goal.endDate), 'yyyy-MM-dd') : '',
      monthlyTargets: goal.monthlyTargets || {}
    });
    setIsAutoFilled(false);
    setMenuAnchor(null);
  };
  
  const handleSaveGoal = () => {
    const updatedGoal = {
      ...goal,
      title: editFormData.title,
      yearlyTarget: parseFloat(editFormData.yearlyTarget),
      unit: editFormData.unit,
      startDate: editFormData.startDate ? new Date(editFormData.startDate) : goal.startDate,
      endDate: editFormData.endDate ? new Date(editFormData.endDate) : goal.endDate,
      monthlyTargets: editFormData.monthlyTargets
    };
    onEditGoal?.(updatedGoal);
    setIsEditingGoal(false);
  };
  
  const handleCancelGoal = () => {
    setIsEditingGoal(false);
    setEditFormData({
      title: goal.title,
      yearlyTarget: goal.yearlyTarget,
      unit: goal.unit,
      startDate: goal.startDate ? format(new Date(goal.startDate), 'yyyy-MM-dd') : '',
      endDate: goal.endDate ? format(new Date(goal.endDate), 'yyyy-MM-dd') : '',
      monthlyTargets: goal.monthlyTargets || {}
    });
  };
  
  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const getEditMonthlyData = () => {
    if (!editFormData.startDate || !editFormData.endDate) return [];
    
    const start = startOfMonth(parseISO(editFormData.startDate));
    const end = startOfMonth(parseISO(editFormData.endDate));
    const monthCount = differenceInMonths(end, start) + 1;
    
    const months = [];
    for (let i = 0; i < monthCount; i++) {
      const monthDate = addMonths(start, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM yyyy');
      months.push({ key: monthKey, label: monthLabel });
    }
    return months;
  };
  
  const handleMonthlyTargetChange = (monthKey, value) => {
    setEditFormData(prev => ({
      ...prev,
      monthlyTargets: {
        ...prev.monthlyTargets,
        [monthKey]: value
      }
    }));
    setIsAutoFilled(false); // User is manually editing
  };
  
  const handleEdit = (monthKey) => {
    setEditingMonth(monthKey);
    setEditValue(monthlyData[monthKey].actual);
  };
  
  const handleSave = () => {
    onUpdate?.(editingMonth, parseFloat(editValue) || 0);
    setEditingMonth(null);
    setEditValue('');
  };
  
  const handleCancel = () => {
    setEditingMonth(null);
    setEditValue('');
  };
  
  const completionRate = goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
  const isOnTrack = completionRate >= 70;
  
  const statusConfig = {
    color: isOnTrack ? 'success' : completionRate >= 40 ? 'warning' : 'error',
    icon: isOnTrack ? <TrendingUp /> : <TrendingDown />,
    label: isOnTrack ? 'On Track' : 'Behind'
  };

  if (isEditingGoal) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <AutoAwesome color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Edit Goal
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update your goal with custom start and end dates - we'll recalculate automatically!
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                value={editFormData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Total Target"
                type="number"
                value={editFormData.yearlyTarget}
                onChange={(e) => handleFormChange('yearlyTarget', e.target.value)}
                required
                inputProps={{ min: 1, step: 0.1 }}
                helperText="Total amount"
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Unit"
                value={editFormData.unit}
                onChange={(e) => handleFormChange('unit', e.target.value)}
                required
                helperText="How to measure"
              />
            </Grid>
            
            <Grid item xs={4}>
              <Box sx={{ p: 1, bgcolor: 'info.50', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {getEditMonthlyData().length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  months
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={editFormData.startDate}
                onChange={(e) => handleFormChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Goal start date"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={editFormData.endDate}
                onChange={(e) => handleFormChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Goal end date"
              />
            </Grid>
            
            {/* Auto-calculation info */}
            {editFormData.yearlyTarget && getEditMonthlyData().length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                    🤖 Auto-Calculated
                  </Typography>
                  <Typography variant="body2">
                    {(parseFloat(editFormData.yearlyTarget) / getEditMonthlyData().length).toFixed(1)} {editFormData.unit} per month
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Evenly distributed across {getEditMonthlyData().length} months ({getEditMonthlyData()[0]?.label} - {getEditMonthlyData()[getEditMonthlyData().length - 1]?.label})
                  </Typography>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth color="primary" />
                  Monthly Breakdown ({getEditMonthlyData().length} months)
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
              
              {getEditMonthlyData().length > 0 ? (
                <Grid container spacing={1}>
                  {getEditMonthlyData().map(({ key, label }) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <TextField
                        fullWidth
                        size="small"
                        label={label}
                        type="number"
                        value={editFormData.monthlyTargets[key] || ''}
                        onChange={(e) => handleMonthlyTargetChange(key, e.target.value)}
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: isAutoFilled && editFormData.monthlyTargets[key] ? 'success.50' : 'background.paper'
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Set start and end dates to configure monthly targets
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancelGoal}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveGoal}
                  disabled={!editFormData.title || !editFormData.unit || !editFormData.yearlyTarget}
                >
                  Save Changes
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      elevation={0}
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': { 
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
          borderColor: `${statusConfig.color}.main`
        }
      }}
    >
      {/* Compact Header */}
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* Goal Icon */}
          <Avatar 
            sx={{ 
              bgcolor: `${statusConfig.color}.50`,
              color: `${statusConfig.color}.main`,
              width: 48,
              height: 48
            }}
          >
            <TrendingUp />
          </Avatar>
          
          {/* Goal Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
              {goal.title}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {goal.actualProgress} / {goal.yearlyTarget} {goal.unit}
              </Typography>
              <Chip 
                icon={statusConfig.icon}
                label={statusConfig.label}
                size="small"
                color={statusConfig.color}
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Stack>
            
            {/* Progress Section */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: `${statusConfig.color}.main` }}>
                  {Math.round(completionRate)}%
                </Typography>
              </Stack>
              
              <LinearProgress
                variant="determinate"
                value={Math.min(completionRate, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: `${statusConfig.color}.main`
                  }
                }}
              />
            </Box>
            
            {/* Quick Stats */}
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    6
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quarterly
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    2
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monthly
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    0.5
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Weekly
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Actions */}
          <IconButton 
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ alignSelf: 'flex-start' }}
          >
            <MoreVert />
          </IconButton>
        </Stack>
        
        {/* Expandable Monthly Details */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 2,
            p: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.100' }
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
            Monthly Breakdown
          </Typography>
          <IconButton 
            size="small"
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <ExpandMore />
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {Object.keys(monthlyData).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No date range set for this goal
              </Typography>
            ) : (
              <Grid container spacing={1.5}>
                {Object.entries(monthlyData).map(([monthKey, data], index) => {
                  const progress = data.target > 0 ? (data.actual / data.target) * 100 : 0;
                  const currentMonth = format(new Date(), 'yyyy-MM');
                  const isCurrentMonth = monthKey === currentMonth;
                  
                  return (
                    <Grid item xs={4} sm={3} md={2} key={monthKey}>
                      <Box sx={{
                        p: 1.5,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isCurrentMonth ? 'primary.main' : 'divider',
                        bgcolor: isCurrentMonth ? 'primary.50' : 'background.paper'
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {data.label}
                        </Typography>
                        
                        {editingMonth === monthKey ? (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              sx={{ width: '100%', mb: 1 }}
                              inputProps={{ min: 0, step: 0.1 }}
                            />
                            <Box>
                              <IconButton size="small" onClick={handleSave}>
                                <Check sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" onClick={handleCancel}>
                                <Close sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {data.actual}/{data.target}
                            </Typography>
                            <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(progress, 100)}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    bgcolor: progress >= 100 ? 'success.main' : progress >= 50 ? 'warning.main' : 'error.main'
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: progress >= 100 ? 'success.main' : progress >= 50 ? 'warning.main' : 'error.main' }}>
                              {Math.round(progress)}%
                            </Typography>
                            <IconButton size="small" onClick={() => handleEdit(monthKey)} sx={{ mt: 0.5 }}>
                              <Edit sx={{ fontSize: 12 }} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Collapse>
      </CardContent>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleEditGoal}>
          <Edit sx={{ mr: 1 }} />
          Edit Goal
        </MenuItem>
        <MenuItem onClick={() => { onDelete?.(goal.id); setMenuAnchor(null); }}>
          <Delete sx={{ mr: 1 }} />
          Delete Goal
        </MenuItem>
      </Menu>
    </Card>
  );
};