import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Flag,
  CheckCircle,
  Schedule,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { format, differenceInDays, isAfter, isBefore, isWithinInterval } from 'date-fns';

export const TimelineDashboard = ({ goals, habits, logs }) => {
  const today = new Date();
  
  const timelineData = useMemo(() => {
    return goals.map(goal => {
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      const totalDays = differenceInDays(endDate, startDate) + 1;
      const daysPassed = Math.max(0, Math.min(differenceInDays(today, startDate), totalDays));
      const daysRemaining = Math.max(0, differenceInDays(endDate, today));
      
      const status = isBefore(today, startDate) ? 'upcoming' : 
                   isAfter(today, endDate) ? 'ended' : 'active';
      
      const progress = goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
      const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
      const onTrack = progress >= expectedProgress;
      
      // Calculate milestones (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100].map(percent => ({
        percent,
        target: (goal.yearlyTarget * percent) / 100,
        achieved: goal.actualProgress >= (goal.yearlyTarget * percent) / 100,
        expectedDate: new Date(startDate.getTime() + (totalDays * percent / 100) * 24 * 60 * 60 * 1000)
      }));
      
      // Get linked habits
      const linkedHabits = habits.filter(habit => habit.goalIds?.includes(goal.id));
      
      return {
        ...goal,
        startDate,
        endDate,
        totalDays,
        daysPassed,
        daysRemaining,
        status,
        progress,
        expectedProgress,
        onTrack,
        milestones,
        linkedHabits
      };
    }).sort((a, b) => a.startDate - b.startDate);
  }, [goals, habits, today]);

  const getStatusColor = (status, onTrack) => {
    if (status === 'upcoming') return 'info';
    if (status === 'ended') return 'secondary';
    return onTrack ? 'success' : 'warning';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <Schedule />;
      case 'ended': return <Stop />;
      default: return <PlayArrow />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Goal Timeline & Milestones
      </Typography>
      
      {/* Timeline Overview */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Timeline Overview
          </Typography>
          
          <Box sx={{ position: 'relative', mb: 4 }}>
            {/* Timeline Line */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: 2,
                bgcolor: 'divider',
                zIndex: 1
              }}
            />
            
            {/* Current Date Marker */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
                bgcolor: 'primary.main',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              TODAY
            </Box>
            
            {/* Goals on Timeline */}
            <Grid container spacing={2} sx={{ position: 'relative', zIndex: 2, pt: 4, pb: 2 }}>
              {timelineData.map((goal, index) => (
                <Grid item xs={12} sm={6} md={4} key={goal.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '2px solid',
                      borderColor: `${getStatusColor(goal.status, goal.onTrack)}.main`,
                      bgcolor: `${getStatusColor(goal.status, goal.onTrack)}.50`
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: `${getStatusColor(goal.status, goal.onTrack)}.main`
                          }}
                        >
                          {getStatusIcon(goal.status)}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {goal.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {format(goal.startDate, 'MMM d')} - {format(goal.endDate, 'MMM d, yyyy')}
                      </Typography>
                      
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(goal.progress, 100)}
                        sx={{ height: 4, borderRadius: 2, mb: 1 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {Math.round(goal.progress)}%
                        </Typography>
                        <Chip
                          label={goal.status}
                          size="small"
                          color={getStatusColor(goal.status, goal.onTrack)}
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Goal Cards */}
      <Grid container spacing={3}>
        {timelineData.map(goal => (
          <Grid item xs={12} key={goal.id}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Goal Info */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${getStatusColor(goal.status, goal.onTrack)}.main`,
                          width: 40,
                          height: 40
                        }}
                      >
                        <TrendingUp />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {goal.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {goal.actualProgress} / {goal.yearlyTarget} {goal.unit}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {goal.totalDays} days
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Days Passed</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {goal.daysPassed} / {goal.totalDays}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Days Remaining</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {goal.daysRemaining}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Expected Progress</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {Math.round(goal.expectedProgress)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* Milestones */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Milestones
                    </Typography>
                    
                    <Stack spacing={1}>
                      {goal.milestones.map(milestone => (
                        <Box
                          key={milestone.percent}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: milestone.achieved ? 'success.50' : 'grey.50'
                          }}
                        >
                          <CheckCircle
                            sx={{
                              fontSize: 16,
                              color: milestone.achieved ? 'success.main' : 'text.disabled'
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {milestone.percent}% ({milestone.target} {goal.unit})
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Target: {format(milestone.expectedDate, 'MMM d')}
                            </Typography>
                          </Box>
                          {milestone.achieved && (
                            <Flag sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Grid>

                  {/* Linked Habits */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Linked Habits ({goal.linkedHabits.length})
                    </Typography>
                    
                    {goal.linkedHabits.length > 0 ? (
                      <Stack spacing={1}>
                        {goal.linkedHabits.slice(0, 3).map(habit => (
                          <Box
                            key={habit.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'grey.50'
                            }}
                          >
                            <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {habit.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {habit.time} • {habit.trigger}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                        {goal.linkedHabits.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{goal.linkedHabits.length - 3} more habits
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No habits linked to this goal
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Progress vs Expected
                    </Typography>
                    <Typography variant="body2" color={goal.onTrack ? 'success.main' : 'warning.main'}>
                      {goal.onTrack ? 'On Track' : 'Behind Schedule'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(goal.expectedProgress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': { bgcolor: 'grey.400' }
                      }}
                    />
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(goal.progress, 100)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'transparent',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: goal.onTrack ? 'success.main' : 'warning.main'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Expected: {Math.round(goal.expectedProgress)}%
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Actual: {Math.round(goal.progress)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};