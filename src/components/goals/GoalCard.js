import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Menu, MenuItem, LinearProgress, Chip, List, ListItem, ListItemText, ListItemIcon, Checkbox, Divider, Button } from '@mui/material';
import { MoreVert, Edit, Delete, TrendingUp, Add, Flag } from '@mui/icons-material';
import { format } from 'date-fns';
import { GoalMetrics } from '../common/MetricsDisplay';
import { calculateGoalMetrics } from '../../utils/progressMetrics';
import { MilestoneDialog } from './MilestoneDialog';

export const GoalCard = ({ goal, onEdit, onDelete, onUpdateGoal }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  
  const progress = goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
  const isCompleted = progress >= 100;
  const metrics = calculateGoalMetrics(goal);
  
  const getProgressColor = () => {
    if (isCompleted) return 'success';
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const handleMilestoneSave = (milestoneData) => {
    const updatedGoal = { ...goal };
    if (editingMilestone) {
      updatedGoal.updateMilestone(editingMilestone.id, milestoneData);
    } else {
      updatedGoal.addMilestone(milestoneData);
    }
    onUpdateGoal(updatedGoal);
    setEditingMilestone(null);
  };

  const handleMilestoneToggle = (milestoneId) => {
    const updatedGoal = { ...goal };
    const milestone = updatedGoal.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      updatedGoal.updateMilestone(milestoneId, { completed: !milestone.completed });
      onUpdateGoal(updatedGoal);
    }
  };

  return (
    <Card sx={{ 
      minWidth: 300, 
      minHeight: 300,
      border: isCompleted ? '2px solid' : '1px solid',
      borderColor: isCompleted ? 'success.main' : 'divider',
      borderRadius: 3,
      position: 'relative',
      transition: 'all 0.3s ease',
      '&:hover': { 
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        transform: 'translateY(-2px)'
      },
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
    }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            fontSize: '1.1rem', 
            lineHeight: 1.3,
            color: 'text.primary',
            maxWidth: '85%'
          }}>
            {goal.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <TrendingUp fontSize="medium" color="primary" />
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {goal.actualProgress} / {goal.yearlyTarget} {goal.unit}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: 2, 
              display: 'block',
              fontWeight: 500
            }}>
              {goal.startDate && goal.endDate ? 
                `${format(new Date(goal.startDate), 'MMM dd')} - ${format(new Date(goal.endDate), 'MMM dd, yyyy')}` : 
                goal.createdAt && goal.year ? 
                `${format(new Date(goal.createdAt), 'MMM dd')} - Dec 31, ${goal.year}` :
                'No dates set'
              }
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)} 
              color={getProgressColor()}
              sx={{ 
                height: 8, 
                borderRadius: 4, 
                mb: 2,
                bgcolor: 'grey.100'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: `${getProgressColor()}.main`,
              fontSize: '1.2rem'
            }}>
              {Math.round(progress)}%
            </Typography>
            {isCompleted && (
              <Chip 
                label="Completed" 
                size="small" 
                color="success" 
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 2
                }}
              />
            )}
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <GoalMetrics goal={goal} metrics={metrics} />
          </Box>
          
          {goal.milestones && goal.milestones.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Flag fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Milestones</Typography>
              </Box>
              <List dense sx={{ py: 0 }}>
                {goal.milestones.slice(0, 2).map((milestone) => (
                  <ListItem key={milestone.id} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Checkbox
                        size="small"
                        checked={milestone.completed}
                        onChange={() => handleMilestoneToggle(milestone.id)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={milestone.description}
                      secondary={format(new Date(milestone.date), 'MMM dd, yyyy')}
                      primaryTypographyProps={{ variant: 'body2', sx: { textDecoration: milestone.completed ? 'line-through' : 'none' } }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
              {goal.milestones.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{goal.milestones.length - 2} more
                </Typography>
              )}
            </Box>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => setMilestoneDialogOpen(true)}
              sx={{ fontSize: '0.75rem' }}
            >
              Add Milestone
            </Button>
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
      
      <MilestoneDialog
        open={milestoneDialogOpen}
        onClose={() => {
          setMilestoneDialogOpen(false);
          setEditingMilestone(null);
        }}
        onSave={handleMilestoneSave}
        milestone={editingMilestone}
      />
    </Card>
  );
};