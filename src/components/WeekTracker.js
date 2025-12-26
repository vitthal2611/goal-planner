import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, Table, TableHead, TableBody, TableRow, TableCell, Typography, Chip, Box, Container, IconButton, Menu, MenuItem, Button, Divider, Tooltip, Avatar } from '@mui/material';
import { CheckCircle, Close, Remove, MoreVert, Add, Delete, Dashboard, TrendingUp, CalendarToday, TrackChanges } from '@mui/icons-material';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks } from 'date-fns';
import { DateNavigator } from './common/DateNavigator';
import { GoalConfig } from './goals/GoalConfig';
import { HabitDialog } from './habits/HabitDialog';
import { HabitCheckIn } from './common/HabitCheckIn';
import { TodayCheckIn } from './common/TodayCheckIn';
import { DateWiseCheckIn } from './common/DateWiseCheckIn';
import { GoalMetrics, HabitMetrics } from './common/MetricsDisplay';
import { isHabitScheduledForDate } from '../utils/frequencyRules';
import { calculateGoalMetrics, calculateHabitMetrics } from '../utils/progressMetrics';
import { useAppContext } from '../context/AppContext';

export const WeekTracker = () => {
  const { habits, logs, goals, logHabit, addHabit, updateHabit, deleteHabit } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const now = new Date();

  const getStatusForDay = (habitId, day) => {
    if (day > now) return 'future';
    
    const habit = habits.find(h => h.id === habitId);
    if (!shouldShowHabitOnDay(habit, day)) return 'not-applicable';
    
    const dayStr = format(day, 'yyyy-MM-dd');
    const log = logs.find(l => l.habitId === habitId && l.date === dayStr);
    
    if (log?.status === 'done') return 'done';
    if (log?.status === 'skipped') return 'skipped';
    return 'missed';
  };

  const shouldShowHabitOnDay = (habit, day) => {
    return isHabitScheduledForDate(habit, day, goals);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />;
      case 'skipped': return <Close sx={{ color: 'warning.main', fontSize: 18 }} />;
      case 'missed': return <Remove sx={{ color: 'error.main', fontSize: 18 }} />;
      default: return <Box sx={{ width: 18, height: 18, bgcolor: 'grey.200', borderRadius: '50%' }} />;
    }
  };

  const getHabitTotal = (habitId) => {
    const daysUpToToday = daysInWeek.filter(day => day <= now);
    return daysUpToToday.filter(day => getStatusForDay(habitId, day) === 'done').length;
  };

  const getGoalName = (habitGoalIds) => {
    if (!habitGoalIds || habitGoalIds.length === 0) return 'No Goal';
    const goal = goals.find(g => habitGoalIds.includes(g.id));
    return goal ? goal.title : 'Unknown Goal';
  };

  const getDayHeaders = () => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return daysInWeek.map(day => {
      const dayName = dayNames[day.getDay() === 0 ? 6 : day.getDay() - 1]; // Adjust for Monday start
      return `${format(day, 'dd')}-${dayName}`;
    });
  };

  const handleCellClick = (event, habitId, day) => {
    if (day > now) return;
    setSelectedCell({ habitId, day });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCell(null);
  };

  const handleStatusChange = (status) => {
    if (selectedCell) {
      const habit = habits.find(h => h.id === selectedCell.habitId);
      const dateStr = format(selectedCell.day, 'yyyy-MM-dd');
      logHabit(selectedCell.habitId, status, habit, dateStr);
    }
    handleMenuClose();
  };

  const handlePreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const handleAddHabit = () => {
    setEditingHabit(null);
    setHabitDialogOpen(true);
  };

  const handleSaveHabit = (habitData) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Dashboard sx={{ mr: 2, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                📊 Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Track your goals and daily habits
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Goals Configuration */}
      <GoalConfig />
      
      {/* Week Navigator */}
      <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Week Navigator</Typography>
          </Box>
          <DateNavigator
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onPrevious={handlePreviousWeek}
            onNext={handleNextWeek}
            preventFuture={false}
            showWeekRange={true}
          />
        </CardContent>
      </Card>

      {habits.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8, border: '2px dashed', borderColor: 'primary.main', borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TrackChanges sx={{ fontSize: 64, opacity: 0.7 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              🎯 No habits to track yet
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
              Create your first habit to start building better routines
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleAddHabit} 
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                borderRadius: 2,
                px: 4,
                py: 1.5
              }}
            >
              Create Your First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                📅 Week of {format(weekStart, 'dd/MM/yyyy')} to {format(weekEnd, 'dd/MM/yyyy')}
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddHabit}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add Habit
            </Button>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0, overflow: 'auto', px: { xs: 1, md: 3 } }}>
          <Table size="small" sx={{ minWidth: { xs: 800, md: 900 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>Habit Name</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Goal</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Metrics</TableCell>
                {getDayHeaders().map((dayHeader, index) => (
                  <TableCell key={index} align="center" sx={{ 
                    fontWeight: 600, 
                    minWidth: 70,
                    bgcolor: format(daysInWeek[index], 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') ? 'primary.main' : 'transparent',
                    color: format(daysInWeek[index], 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') ? 'white' : 'inherit',
                    boxShadow: format(daysInWeek[index], 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') ? '0 0 10px rgba(25, 118, 210, 0.5)' : 'none',
                    border: format(daysInWeek[index], 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') ? '3px solid' : 'none',
                    borderColor: 'primary.dark'
                  }}>
                    {dayHeader}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 600, minWidth: 80 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {habits.filter(habit => {
                // Filter habits by their linked goals' start/end dates
                if (!habit.goalIds || habit.goalIds.length === 0) return true;
                return habit.goalIds.some(goalId => {
                  const goal = goals.find(g => g.id === goalId);
                  if (!goal) return true;
                  const goalStart = goal.startDate ? new Date(goal.startDate) : new Date(0);
                  const goalEnd = goal.endDate ? new Date(goal.endDate) : new Date(2099, 11, 31);
                  return goalStart <= weekEnd && goalEnd >= weekStart;
                });
              }).sort((a, b) => {
                // Sort by time, putting habits without time at the end
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
              }).map(habit => {
                const weekTotal = getHabitTotal(habit.id);
                const daysUpToToday = daysInWeek.filter(day => day <= now);
                const attempted = daysUpToToday.length;
                
                // Calculate total till date (from habit creation or month start)
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const allDaysThisMonth = eachDayOfInterval({ start: monthStart, end: now });
                const totalTillDate = allDaysThisMonth.filter(day => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const log = logs.find(l => l.habitId === habit.id && l.date === dayStr);
                  return log?.status === 'done';
                }).length;
                const totalPossibleDays = allDaysThisMonth.length;
                
                return (
                  <TableRow key={habit.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                          {habit.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {habit.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {habit.trigger || 'No trigger set'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={habit.time || 'Anytime'} 
                        size="small" 
                        variant="outlined"
                        color={habit.time ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getGoalName(habit.goalIds)} 
                        size="small" 
                        variant="filled"
                        color={habit.goalIds?.length > 0 ? 'success' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          const metrics = calculateHabitMetrics(habit, logs, goals);
                          return (
                            <HabitMetrics 
                              habit={habit}
                              metrics={metrics}
                            />
                          );
                        } catch (error) {
                          console.error('Metrics calculation error:', error);
                          return <Typography variant="caption" color="error">Error</Typography>;
                        }
                      })()} 
                    </TableCell>
                    {daysInWeek.map((day, index) => {
                      const status = getStatusForDay(habit.id, day);
                      const isToday = format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                      const isScheduled = isHabitScheduledForDate(habit, day, goals);
                      const isDailyHabit = habit.frequency === 'daily';
                      
                      return (
                        <TableCell key={index} align="center" sx={{
                          bgcolor: isToday ? 'primary.main' : 'transparent',
                          color: isToday ? 'white' : 'inherit',
                          border: isToday ? '3px solid' : 'none',
                          borderColor: 'primary.dark',
                          boxShadow: isToday ? '0 0 10px rgba(25, 118, 210, 0.5)' : 'none',
                          position: 'relative',
                          '&::before': isToday ? {
                            content: '""',
                            position: 'absolute',
                            top: -2,
                            left: -2,
                            right: -2,
                            bottom: -2,
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            borderRadius: 1,
                            zIndex: -1
                          } : {}
                        }}>
                          {day > now ? '-' : (
                            !isScheduled ? (
                              <Typography variant="caption" color="text.disabled">-</Typography>
                            ) : isDailyHabit ? (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const dateStr = format(day, 'yyyy-MM-dd');
                                  const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
                                  const newStatus = log?.status === 'done' ? 'remove' : 'done';
                                  logHabit(habit.id, newStatus, habit, dateStr);
                                }}
                                sx={{ p: 0.5 }}
                              >
                                {getStatusIcon(status)}
                              </IconButton>
                            ) : (
                              <HabitCheckIn
                                habit={habit}
                                logs={logs}
                                logHabit={logHabit}
                                date={day}
                              />
                            )
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      <Tooltip title="Delete Habit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this habit?')) {
                              deleteHabit(habit.id);
                            }
                          }}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.light', color: 'error.dark' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('done')}>
          <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
          Mark as Done
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('skipped')}>
          <Close sx={{ color: 'warning.main', mr: 1, fontSize: 16 }} />
          Mark as Skipped
        </MenuItem>
      </Menu>
      
      <HabitDialog
        open={habitDialogOpen}
        onClose={() => setHabitDialogOpen(false)}
        onSave={handleSaveHabit}
        habit={editingHabit}
        goals={goals}
      />
    </Container>
  );
};