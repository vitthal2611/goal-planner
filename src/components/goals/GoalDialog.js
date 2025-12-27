import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { formatDateForInput } from '../../utils/dateUtils';
import { MilestoneDialog } from './MilestoneDialog';
import { format } from 'date-fns';

export const GoalDialog = ({ open, onClose, onSave, goal = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    yearlyTarget: '',
    unit: '',
    actualProgress: 0,
    startDate: '',
    endDate: '',
    milestones: []
  });
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        yearlyTarget: goal.yearlyTarget || '',
        unit: goal.unit || '',
        actualProgress: goal.actualProgress || 0,
        startDate: formatDateForInput(goal.startDate),
        endDate: formatDateForInput(goal.endDate),
        milestones: goal.milestones || []
      });
    } else {
      setFormData({
        title: '',
        yearlyTarget: '',
        unit: '',
        actualProgress: 0,
        startDate: '',
        endDate: '',
        milestones: []
      });
    }
  }, [goal, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.yearlyTarget || !formData.unit.trim() || !formData.startDate || !formData.endDate) return;
    
    const goalData = {
      ...formData,
      yearlyTarget: Number(formData.yearlyTarget),
      actualProgress: Number(formData.actualProgress),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      id: goal?.id || `goal_${Date.now()}`,
      year: new Date(formData.endDate).getFullYear(),
      createdAt: goal?.createdAt || new Date(),
      milestones: formData.milestones
    };
    
    onSave(goalData);
    onClose();
  };

  const handleMilestoneSave = (milestoneData) => {
    if (editingMilestone) {
      setFormData(prev => ({
        ...prev,
        milestones: prev.milestones.map(m => 
          m.id === editingMilestone.id ? milestoneData : m
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestoneData]
      }));
    }
    setEditingMilestone(null);
  };

  const handleMilestoneDelete = (milestoneId) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId)
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{goal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Yearly Target"
              type="number"
              value={formData.yearlyTarget}
              onChange={(e) => setFormData(prev => ({ ...prev, yearlyTarget: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Unit (e.g., books, hours, kg)"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Current Progress"
              type="number"
              value={formData.actualProgress}
              onChange={(e) => setFormData(prev => ({ ...prev, actualProgress: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Milestones</Typography>
              <Button
                startIcon={<Add />}
                onClick={() => setMilestoneDialogOpen(true)}
                size="small"
              >
                Add Milestone
              </Button>
            </Box>
            
            {formData.milestones.length > 0 ? (
              <List>
                {formData.milestones.map((milestone) => (
                  <ListItem key={milestone.id}>
                    <ListItemText
                      primary={milestone.description}
                      secondary={format(new Date(milestone.date), 'MMM dd, yyyy')}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEditingMilestone(milestone);
                          setMilestoneDialogOpen(true);
                        }}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleMilestoneDelete(milestone.id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No milestones added yet
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {goal ? 'Update' : 'Add'} Goal
          </Button>
        </DialogActions>
      </form>
      
      <MilestoneDialog
        open={milestoneDialogOpen}
        onClose={() => {
          setMilestoneDialogOpen(false);
          setEditingMilestone(null);
        }}
        onSave={handleMilestoneSave}
        milestone={editingMilestone}
      />
    </Dialog>
  );
};