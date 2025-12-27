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
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          mb: 1, 
          color: 'text.primary',
          letterSpacing: '-0.02em'
        }}>
          Dashboard
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'text.secondary', 
          fontWeight: 400,
          mb: 0
        }}>
          Track your goals and build consistent habits
        </Typography>
      </Box>
      
      {/* Goals Section */}
      <Box sx={{ mb: 8 }}>
        <GoalConfig />
      </Box>
      
      {/* Week Navigator */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CalendarToday sx={{ mr: 2, color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Week Navigator
          </Typography>
        </Box>
        <Card sx={{ 
          borderRadius: 3, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <CardContent sx={{ py: 2.5, px: 3 }}>
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
      </Box>

      {habits.length === 0 ? (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp sx={{ mr: 2, color: 'primary.main', fontSize: 24 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Habit Tracker
            </Typography>
          </Box>
        <Card sx={{ 
          textAlign: 'center', 
          py: 10, 
          border: '2px dashed', 
          borderColor: 'primary.main', 
          borderRadius: 3, 
          bgcolor: 'primary.50',
          boxShadow: 'none'
        }}>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <TrackChanges sx={{ fontSize: 72, color: 'primary.main', opacity: 0.8 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
              No habits to track yet
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
              Create your first habit to start building consistent, positive routines
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleAddHabit} 
              size="large"
              sx={{ 
                borderRadius: 3,
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(91, 124, 153, 0.3)'
              }}
            >
              Create Your First Habit
            </Button>
          </CardContent>
        </Card>
        </Box>
      ) : (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'divider'
        }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  Habit Tracker
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddHabit}
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: '0 2px 8px rgba(91, 124, 153, 0.2)'
              }}
            >
              Add Habit
            </Button>
          }
          sx={{ pb: 2, px: 4, pt: 4 }}
        />
        <CardContent sx={{ pt: 0, overflow: 'auto', px: { xs: 2, md: 4 }, pb: 4 }}>
          <Table size="medium" sx={{ minWidth: { xs: 800, md: 900 } }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { bgcolor: 'grey.50', py: 2 } }}>
                <TableCell sx={{ fontWeight: 700, minWidth: 200, fontSize: '0.95rem', color: 'text.primary' }}>Habit</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 90, fontSize: '0.95rem', color: 'text.primary' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 160, fontSize: '0.95rem', color: 'text.primary' }}>Goal</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 220, fontSize: '0.95rem', color: 'text.primary' }}>Progress</TableCell>
                {getDayHeaders().map((dayHeader, index) => {
                  const isToday = format(daysInWeek[index], 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                  return (
                    <TableCell key={index} align="center" sx={{ 
                      fontWeight: 700, 
                      minWidth: 80,
                      fontSize: '0.9rem',
                      bgcolor: isToday ? 'primary.main' : 'grey.50',
                      color: isToday ? 'white' : 'text.primary',
                      borderRadius: isToday ? 2 : 0,
                      position: 'relative',
                      '&::after': isToday ? {
                        content: '"Today"',
                        position: 'absolute',
                        bottom: 2,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        opacity: 0.9
                      } : {}
                    }}>
                      {dayHeader}
                    </TableCell>
                  );
                })}
                <TableCell align="center" sx={{ fontWeight: 700, minWidth: 90, fontSize: '0.95rem', color: 'text.primary' }}>
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
                  <TableRow key={habit.id} sx={{ '&:hover': { bgcolor: 'grey.25' } }}>
                    <TableCell sx={{ py: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2, 
                          bgcolor: 'primary.main', 
                          fontSize: '1rem',
                          fontWeight: 600
                        }}>
                          {habit.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                            {habit.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
                            {habit.trigger || 'No trigger set'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip 
                        label={habit.time || 'Anytime'} 
                        size="medium" 
                        variant={habit.time ? 'filled' : 'outlined'}
                        color={habit.time ? 'primary' : 'default'}
                        sx={{ 
                          fontWeight: 500,
                          minWidth: 70,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip 
                        label={getGoalName(habit.goalIds)} 
                        size="medium" 
                        variant="filled"
                        color={habit.goalIds?.length > 0 ? 'success' : 'default'}
                        sx={{ 
                          fontWeight: 500,
                          borderRadius: 2,
                          maxWidth: 140,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
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
                          py: 2.5,
                          bgcolor: isToday ? 'primary.main' : 'transparent',
                          color: isToday ? 'white' : 'inherit',
                          borderRadius: isToday ? 2 : 0,
                          position: 'relative',
                          border: isToday ? '2px solid' : 'none',
                          borderColor: 'primary.dark',
                          boxShadow: isToday ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
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
                    <TableCell align="center" sx={{ py: 2.5 }}>
                      <Tooltip title="Delete Habit">
                        <IconButton
                          size="medium"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this habit?')) {
                              deleteHabit(habit.id);
                            }
                          }}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { 
                              bgcolor: 'error.50', 
                              color: 'error.dark',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Delete />
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