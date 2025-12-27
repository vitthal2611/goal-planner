import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { formatDateForInput } from '../../utils/dateUtils';

export const MilestoneDialog = ({ open, onClose, onSave, milestone = null }) => {
  const [formData, setFormData] = useState({
    date: '',
    description: ''
  });

  useEffect(() => {
    if (milestone) {
      setFormData({
        date: formatDateForInput(milestone.date),
        description: milestone.description || ''
      });
    } else {
      setFormData({
        date: '',
        description: ''
      });
    }
  }, [milestone, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.description.trim()) return;
    
    const milestoneData = {
      ...formData,
      date: new Date(formData.date),
      id: milestone?.id || `milestone_${Date.now()}`,
      completed: milestone?.completed || false,
      createdAt: milestone?.createdAt || new Date()
    };
    
    onSave(milestoneData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{milestone ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Target Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              fullWidth
              multiline
              rows={2}
              placeholder="e.g., Read Atomic Habits"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {milestone ? 'Update' : 'Add'} Milestone
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};