import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { formatDateForInput } from '../../utils/dateUtils';

export const GoalDialog = ({ open, onClose, onSave, goal = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    yearlyTarget: '',
    unit: '',
    actualProgress: 0,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        yearlyTarget: goal.yearlyTarget || '',
        unit: goal.unit || '',
        actualProgress: goal.actualProgress || 0,
        startDate: formatDateForInput(goal.startDate),
        endDate: formatDateForInput(goal.endDate)
      });
    } else {
      setFormData({
        title: '',
        yearlyTarget: '',
        unit: '',
        actualProgress: 0,
        startDate: '',
        endDate: ''
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
      createdAt: goal?.createdAt || new Date()
    };
    
    onSave(goalData);
    onClose();
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {goal ? 'Update' : 'Add'} Goal
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};