import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import { TrendingUp, Today, EmojiEvents } from '@mui/icons-material';

const MetricCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%', boxShadow: 1 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      
      <Typography variant="h3" sx={{ fontWeight: 600, color: `${color}.main`, mb: 1 }}>
        {value}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

const StreakChip = ({ name, streak }) => (
  <Chip
    label={`${name}: ${streak} days`}
    size="small"
    variant="outlined"
    sx={{ m: 0.5 }}
  />
);

export default function Dashboard({ summary }) {
  const {
    dailyCompletion,
    consistencyScore,
    consistencyLabel,
    habitStreaks,
    motivationalMessage,
    activeHabitsCount
  } = summary;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Today"
            value={`${dailyCompletion}%`}
            subtitle="Daily completion"
            icon={<Today color="primary" />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Consistency"
            value={`${consistencyScore}%`}
            subtitle={consistencyLabel}
            icon={<TrendingUp color="success" />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <MetricCard
            title="Active Habits"
            value={activeHabitsCount}
            subtitle="Building your identity"
            icon={<EmojiEvents color="warning" />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Consistency Progress Bar */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            14-Day Consistency
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={consistencyScore}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: consistencyScore >= 70 ? 'success.main' : 
                                   consistencyScore >= 40 ? 'warning.main' : 'info.main'
                }
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {consistencyLabel}
          </Typography>
        </CardContent>
      </Card>

      {/* Habit Streaks */}
      {habitStreaks.length > 0 && (
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              Current Streaks
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {habitStreaks.map((habit, index) => (
                <StreakChip
                  key={index}
                  name={habit.name.replace('I am a person who ', '')}
                  streak={habit.streak}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card sx={{ boxShadow: 1, bgcolor: 'grey.50' }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontStyle: 'italic', 
              color: 'text.secondary',
              fontWeight: 400
            }}
          >
            "{motivationalMessage}"
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}