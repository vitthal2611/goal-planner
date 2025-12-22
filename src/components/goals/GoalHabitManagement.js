import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Stack,
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material';
import {
  Link,
  LinkOff,
  Add,
  TrendingUp,
  Schedule,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import { format } from 'date-fns';

export const GoalHabitManagement = ({ goals, habits, logs, onUpdateHabit }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const getLinkedHabits = (goalId) => {
    return habits.filter(habit => habit.goalIds?.includes(goalId));
  };

  const getUnlinkedHabits = () => {
    return habits.filter(habit => !habit.goalIds?.includes(selectedGoal?.id));
  };

  const getHabitStatus = (habitId) => {
    const todayLog = logs.find(log => 
      log.habitId === habitId && 
      log.date === today
    );
    return todayLog?.status === 'done';
  };

  const getHabitConsistency = (habitId) => {
    const habitLogs = logs.filter(log => log.habitId === habitId);
    const last30Days = habitLogs.slice(-30);
    const completed = last30Days.filter(log => log.status === 'done').length;
    return last30Days.length > 0 ? (completed / last30Days.length) * 100 : 0;
  };

  const handleLinkHabits = () => {
    selectedHabits.forEach(habitId => {
      const habit = habits.find(h => h.id === habitId);
      const updatedGoalIds = [...(habit.goalIds || []), selectedGoal.id];
      onUpdateHabit(habitId, { goalIds: updatedGoalIds });
    });
    setLinkDialogOpen(false);
    setSelectedHabits([]);
  };

  const handleUnlinkHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    const updatedGoalIds = habit.goalIds?.filter(id => id !== selectedGoal.id) || [];
    onUpdateHabit(habitId, { goalIds: updatedGoalIds });
  };

  const getGoalProgress = (goal) => {
    return goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Goal-Habit Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Goals List */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Goals ({goals.length})
              </Typography>
              
              <Stack spacing={2}>
                {goals.map(goal => {
                  const linkedHabits = getLinkedHabits(goal.id);
                  const progress = getGoalProgress(goal);
                  const isSelected = selectedGoal?.id === goal.id;
                  
                  return (
                    <Card
                      key={goal.id}
                      elevation={0}
                      sx={{
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.50' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => setSelectedGoal(goal)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                            <TrendingUp sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                            {goal.title}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {goal.actualProgress} / {goal.yearlyTarget} {goal.unit}
                        </Typography>
                        
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress, 100)}
                          sx={{ height: 4, borderRadius: 2, mb: 1 }}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {linkedHabits.length} habits linked
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Habit Details */}
        <Grid item xs={12} md={8}>
          {selectedGoal ? (
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Habits for "{selectedGoal.title}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getLinkedHabits(selectedGoal.id).length} habits linked to this goal
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setLinkDialogOpen(true)}
                    disabled={getUnlinkedHabits().length === 0}
                  >
                    Link Habits
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {getLinkedHabits(selectedGoal.id).map(habit => {
                    const isCompleted = getHabitStatus(habit.id);
                    const consistency = getHabitConsistency(habit.id);
                    
                    return (
                      <Card
                        key={habit.id}
                        elevation={0}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                              sx={{ 
                                color: isCompleted ? 'success.main' : 'text.disabled',
                                p: 0.5
                              }}
                            >
                              {isCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
                            </IconButton>
                            
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {habit.name}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Chip
                                  icon={<Schedule />}
                                  label={habit.time}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {habit.trigger} • {habit.location}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    30-day consistency: {Math.round(consistency)}%
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={consistency}
                                    sx={{
                                      height: 4,
                                      borderRadius: 2,
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: consistency >= 80 ? 'success.main' : 
                                               consistency >= 60 ? 'warning.main' : 'error.main'
                                      }
                                    }}
                                  />
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleUnlinkHabit(habit.id)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <LinkOff />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {getLinkedHabits(selectedGoal.id).length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No habits linked to this goal yet
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setLinkDialogOpen(true)}
                        disabled={getUnlinkedHabits().length === 0}
                      >
                        Link Your First Habit
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Select a Goal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a goal from the left to view and manage its linked habits
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Link Habits Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Link Habits to "{selectedGoal?.title}"</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Habits</InputLabel>
            <Select
              multiple
              value={selectedHabits}
              onChange={(e) => setSelectedHabits(e.target.value)}
              input={<OutlinedInput label="Select Habits" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const habit = habits.find(h => h.id === value);
                    return <Chip key={value} label={habit?.name} size="small" />;
                  })}
                </Box>
              )}
            >
              {getUnlinkedHabits().map(habit => (
                <MenuItem key={habit.id} value={habit.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {habit.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {habit.time} • {habit.trigger}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {getUnlinkedHabits().length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              All habits are already linked to goals
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleLinkHabits} 
            variant="contained"
            disabled={selectedHabits.length === 0}
          >
            Link {selectedHabits.length} Habit{selectedHabits.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};