import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Menu, MenuItem, LinearProgress, Chip } from '@mui/material';
import { MoreVert, Edit, Delete, TrendingUp } from '@mui/icons-material';
import { format } from 'date-fns';
import { GoalMetrics } from '../common/MetricsDisplay';
import { calculateGoalMetrics } from '../../utils/progressMetrics';

export const GoalCard = ({ goal, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const progress = goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
  const isCompleted = progress >= 100;
  const metrics = calculateGoalMetrics(goal);
  
  const getProgressColor = () => {
    if (isCompleted) return 'success';
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ 
      minWidth: 280, 
      height: 160,
      border: isCompleted ? '2px solid' : '1px solid',
      borderColor: isCompleted ? 'success.main' : 'divider',
      position: 'relative',
      '&:hover': { boxShadow: 3 }
    }}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
            {goal.title}
          </Typography>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                {goal.actualProgress} / {goal.yearlyTarget} {goal.unit}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {goal.startDate && goal.endDate ? 
                `${format(new Date(goal.startDate), 'dd/MM/yyyy')} - ${format(new Date(goal.endDate), 'dd/MM/yyyy')}` : 
                goal.createdAt && goal.year ? 
                `${format(new Date(goal.createdAt), 'dd/MM/yyyy')} - 31/12/${goal.year}` :
                'No dates set'
              }
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)} 
              color={getProgressColor()}
              sx={{ height: 6, borderRadius: 3, mb: 1 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: `${getProgressColor()}.main` }}>
              {Math.round(progress)}%
            </Typography>
            {isCompleted && (
              <Chip label="Completed" size="small" color="success" />
            )}
          </Box>
          
          <Box sx={{ mt: 1 }}>
            <GoalMetrics goal={goal} metrics={metrics} />
          </Box>
        </Box>
      </CardContent>
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { onEdit(goal); setAnchorEl(null); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { onDelete(goal.id); setAnchorEl(null); }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};