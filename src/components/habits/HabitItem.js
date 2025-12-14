import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardActions, Typography, Box, Chip, IconButton, LinearProgress, Grid, Avatar, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LocalFireDepartment, CheckCircle, Cancel, Delete, Edit, Check, Close } from '@mui/icons-material';
import { formatDate } from '../../utils/calculations';
import { getHabitCardMetrics } from '../../utils/goalAwareHabitUtils';
import { getFrequencyLabel } from '../../utils/frequencyRules';
import { analyzeHabitEditImpact } from '../../utils/updateUtils';
import { ConfirmDialog } from '../common/ConfirmDialog.js';

export const HabitItem = ({ habit, goal, goals = [], habitLogs, onLogHabit, onUpdateHabit, onDeleteHabit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, data: null });
  
  const metrics = getHabitCardMetrics(habit, habitLogs, goals);
  const today = formatDate(new Date());
  const todaysLog = habitLogs.find(log => log.habitId === habit.id && log.date === today);

  const handleLog = (status) => {
    onLogHabit(habit.id, status);
  };

  const getConsistencyColor = (value) => {
    if (value >= 80) return 'success.main';
    if (value >= 60) return 'primary.main';
    if (value >= 40) return 'warning.main';
    return 'error.main';
  };
  
  const startEdit = () => {
    setIsEditing(true);
    setEditDraft({
      name: habit.name,
      trigger: habit.trigger,
      time: habit.time,
      location: habit.location,
      frequency: habit.frequency,
      goalIds: habit.goalIds
    });
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditDraft(null);
  };
  
  const saveEdit = () => {
    const impact = analyzeHabitEditImpact(habit, editDraft, habitLogs);
    
    if (impact.warnings.length > 0) {
      setConfirmDialog({
        open: true,
        data: { updates: editDraft, impact }
      });
    } else {
      applyEdit(editDraft);
    }
  };
  
  const applyEdit = (updates) => {
    onUpdateHabit(habit.id, updates);
    cancelEdit();
    setConfirmDialog({ open: false, data: null });
  };

  return (
    <>
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, data: null })}
        onConfirm={() => applyEdit(confirmDialog.data.updates)}
        title="Confirm Habit Changes"
        message="This change may affect your tracking."
        warnings={confirmDialog.data?.impact?.warnings || []}
      />
      
      <Card 
      elevation={0}
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': { 
          elevation: 4,
          boxShadow: 3,
          borderColor: 'primary.main'
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: metrics.currentStreak > 0 ? 'warning.main' : 'grey.300', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
            <LocalFireDepartment sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Avatar>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditing ? (
              <>
                <IconButton onClick={saveEdit} color="primary" sx={{ minWidth: 44, minHeight: 44 }}>
                  <Check />
                </IconButton>
                <IconButton onClick={cancelEdit} sx={{ minWidth: 44, minHeight: 44 }}>
                  <Close />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton onClick={startEdit} sx={{ minWidth: 44, minHeight: 44 }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDeleteHabit(habit.id)} color="error" sx={{ minWidth: 44, minHeight: 44 }}>
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>
        }
        title={
          isEditing ? (
            <TextField
              value={editDraft.name}
              onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
              size="small"
              fullWidth
            />
          ) : habit.name
        }
        subheader={
          isEditing ? (
            <FormControl size="small" fullWidth sx={{ mt: 1 }}>
              <InputLabel>Goal</InputLabel>
              <Select
                value={editDraft.goalIds[0] || ''}
                onChange={(e) => setEditDraft({ ...editDraft, goalIds: [e.target.value] })}
                label="Goal"
              >
                {goals.map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : `Goal: ${goal?.title || 'Unknown'}`
        }
        titleTypographyProps={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.125rem' } }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={`${metrics.currentStreak} day streak`} icon={<LocalFireDepartment />} color={metrics.currentStreak > 0 ? 'warning' : 'default'} />
          <Chip label={`${metrics.thirtyDayConsistency}%`} color="primary" />
          {habit.frequency !== 'daily' && (
            <Chip label={getFrequencyLabel(habit)} variant="outlined" size="small" />
          )}
        </Box>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          {isEditing ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Trigger"
                  value={editDraft.trigger}
                  onChange={(e) => setEditDraft({ ...editDraft, trigger: e.target.value })}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Time"
                  type="time"
                  value={editDraft.time}
                  onChange={(e) => setEditDraft({ ...editDraft, time: e.target.value })}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Location"
                  value={editDraft.location}
                  onChange={(e) => setEditDraft({ ...editDraft, location: e.target.value })}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Trigger</Typography>
                <Typography variant="body2">{habit.trigger}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Time</Typography>
                <Typography variant="body2">{habit.time}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Location</Typography>
                <Typography variant="body2">{habit.location}</Typography>
              </Grid>
            </Grid>
          )}
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2">30-Day Consistency</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {metrics.thirtyDayConsistency}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={metrics.thirtyDayConsistency}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: getConsistencyColor(metrics.thirtyDayConsistency),
                transition: 'transform 0.4s ease'
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {metrics.completed}/{metrics.expected} completed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best streak: {metrics.bestStreak} days
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
        {todaysLog ? (
          <Chip
            icon={todaysLog.status === 'done' ? <CheckCircle /> : <Cancel />}
            label={todaysLog.status === 'done' ? 'Completed' : 'Skipped'}
            color={todaysLog.status === 'done' ? 'success' : 'default'}
          />
        ) : (
          <>
            <Chip
              icon={<CheckCircle />}
              label="Done"
              clickable
              color="success"
              variant="outlined"
              onClick={() => handleLog('done')}
              sx={{ '&:hover': { bgcolor: 'success.50' } }}
            />
            <Chip
              label="Skip"
              clickable
              variant="outlined"
              onClick={() => handleLog('skipped')}
              sx={{ '&:hover': { bgcolor: 'grey.100' } }}
            />
          </>
        )}
      </CardActions>
    </Card>
    </>
  );
};
