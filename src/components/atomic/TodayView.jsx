import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { AccessTime, LocationOn, Link, MoreVert, Edit, Delete } from '@mui/icons-material';
import HabitChain from './HabitChain';

const TimeSection = ({ title, habits, onToggleHabit, completions, onEditHabit, onDeleteHabit }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const handleMenuOpen = (event, habit) => {
    setAnchorEl(event.currentTarget);
    setSelectedHabit(habit);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedHabit(null);
  };

  const handleEdit = () => {
    onEditHabit(selectedHabit);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteHabit(selectedHabit.id);
    handleMenuClose();
  };

  if (habits.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
        {title}
      </Typography>
      
      {habits.map((habit) => (
        <Card 
          key={habit.id} 
          sx={{ 
            mb: 2, 
            boxShadow: 0,
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { 
              boxShadow: 1,
              borderColor: 'primary.light'
            },
            transition: 'all 0.2s ease',
            bgcolor: habit.completed ? 'success.50' : 'background.paper'
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Checkbox
                checked={habit.completed}
                onChange={() => onToggleHabit(habit.id)}
                sx={{ 
                  mt: -0.5,
                  '& .MuiSvgIcon-root': { fontSize: 28 }
                }}
              />
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500,
                    textDecoration: habit.completed ? 'line-through' : 'none',
                    opacity: habit.completed ? 0.7 : 1,
                    mb: 1
                  }}
                >
                  {habit.name}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Link sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {habit.trigger}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {habit.time}
                    </Typography>
                  </Box>
                  
                  {habit.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {habit.location}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {habit.streak > 0 && (
                  <Chip 
                    label={`${habit.streak} day streak`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
                
                <HabitChain 
                  habit={habit} 
                  completions={completions} 
                  days={7} 
                />
              </Box>

              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, habit)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default function TodayView({ groupedHabits, onToggleHabit, completions, onEditHabit, onDeleteHabit }) {
  const hasAnyHabits = Object.values(groupedHabits).some(habits => habits.length > 0);

  if (!hasAnyHabits) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No habits scheduled for today
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first habit to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Today's Habits
      </Typography>
      
      <TimeSection 
        title="Morning" 
        habits={groupedHabits.Morning} 
        onToggleHabit={onToggleHabit}
        completions={completions}
        onEditHabit={onEditHabit}
        onDeleteHabit={onDeleteHabit}
      />
      
      <TimeSection 
        title="Afternoon" 
        habits={groupedHabits.Afternoon} 
        onToggleHabit={onToggleHabit}
        completions={completions}
        onEditHabit={onEditHabit}
        onDeleteHabit={onDeleteHabit}
      />
      
      <TimeSection 
        title="Evening" 
        habits={groupedHabits.Evening} 
        onToggleHabit={onToggleHabit}
        completions={completions}
        onEditHabit={onEditHabit}
        onDeleteHabit={onDeleteHabit}
      />
    </Box>
  );
}