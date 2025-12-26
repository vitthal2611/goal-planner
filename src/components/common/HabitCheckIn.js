import React, { useState } from 'react';
import { Button, IconButton, Tooltip, Box, Typography, Chip } from '@mui/material';
import { CheckCircle, Close, Undo } from '@mui/icons-material';
import { format } from 'date-fns';

export const HabitCheckIn = ({ habit, logs, logHabit, date = new Date() }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dateStr = format(date, 'yyyy-MM-dd');
  const todayLog = logs.find(l => l.habitId === habit.id && l.date === dateStr);
  const status = todayLog?.status;

  const handleCheckIn = async (newStatus) => {
    setIsLoading(true);
    try {
      await logHabit(habit.id, newStatus, habit, dateStr);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => handleCheckIn('remove');

  if (status === 'done') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          icon={<CheckCircle />} 
          label="Done" 
          color="success" 
          size="small"
          variant="outlined"
        />
        <Tooltip title="Undo">
          <IconButton size="small" onClick={handleUndo} disabled={isLoading}>
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  if (status === 'skipped') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          icon={<Close />} 
          label="Skipped" 
          color="warning" 
          size="small"
          variant="outlined"
        />
        <Tooltip title="Undo">
          <IconButton size="small" onClick={handleUndo} disabled={isLoading}>
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Button
        variant="contained"
        size="small"
        onClick={() => handleCheckIn('done')}
        disabled={isLoading}
        sx={{ minWidth: 60 }}
      >
        Done
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleCheckIn('skipped')}
        disabled={isLoading}
        sx={{ minWidth: 60 }}
      >
        Skip
      </Button>
    </Box>
  );
};