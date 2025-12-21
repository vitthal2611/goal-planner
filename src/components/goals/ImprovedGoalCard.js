import React, { useState } from 'react';
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
  TextField
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
  Close
} from '@mui/icons-material';

export const ImprovedGoalCard = ({ goal, onUpdate, onDelete }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [editingMonth, setEditingMonth] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = {};
    months.forEach((month, index) => {
      const monthKey = `${new Date().getFullYear()}-${String(index + 1).padStart(2, '0')}`;
      const target = goal.monthlyTargets?.[monthKey] || 2;
      const actual = goal.monthlyData?.[monthKey] || 0;
      console.log(`${month} (${monthKey}):`, { target, actual, monthlyData: goal.monthlyData });
      data[month] = { target, actual };
    });
    return data;
  };
  
  const monthlyData = getMonthlyData();
  
  const handleEdit = (month) => {
    setEditingMonth(month);
    setEditValue(monthlyData[month].actual);
  };
  
  const handleSave = () => {
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(editingMonth);
    const monthKey = `${new Date().getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}`;
    onUpdate?.(monthKey, parseFloat(editValue) || 0);
    setEditingMonth(null);
    setEditValue('');
  };
  
  const handleCancel = () => {
    setEditingMonth(null);
    setEditValue('');
  };
  
  const completionRate = goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
  const isOnTrack = completionRate >= 70; // Simplified for demo
  
  const statusConfig = {
    color: isOnTrack ? 'success' : completionRate >= 40 ? 'warning' : 'error',
    icon: isOnTrack ? <TrendingUp /> : <TrendingDown />,
    label: isOnTrack ? 'On Track' : 'Behind'
  };

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
            <Grid container spacing={1.5}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                const data = monthlyData[month];
                const progress = data.target > 0 ? (data.actual / data.target) * 100 : 0;
                return (
                <Grid item xs={4} sm={3} md={2} key={month}>
                  <Box sx={{
                    p: 1.5,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: index === 0 ? 'primary.main' : 'divider',
                    bgcolor: index === 0 ? 'primary.50' : 'background.paper'
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {month}
                    </Typography>
                    
                    {editingMonth === month ? (
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
                        <IconButton size="small" onClick={() => handleEdit(month)} sx={{ mt: 0.5 }}>
                          <Edit sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Grid>
                );
              })}
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { onDelete?.(goal.id); setMenuAnchor(null); }}>
          <Delete sx={{ mr: 1 }} />
          Delete Goal
        </MenuItem>
      </Menu>
    </Card>
  );
};