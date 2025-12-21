import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useAppContext } from '../../context/AppContext';

export const QuickAddGoalHabit = () => {
  const { addGoal, addHabit } = useAppContext();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      // Add goal
      if (data.goal) {
        addGoal(data.goal);
      }
      
      // Add habits
      if (data.habits && Array.isArray(data.habits)) {
        data.habits.forEach(habit => addHabit(habit));
      }
      
      setJsonInput('');
      setError('');
      alert('Goal and habits added successfully!');
    } catch (e) {
      setError('Invalid JSON format: ' + e.message);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quick Add Goal & Habits
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Paste JSON in format: {`{ "goal": {...}, "habits": [...] }`}
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={12}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='{"goal": {...}, "habits": [...]}'
        sx={{ mb: 2, fontFamily: 'monospace' }}
      />
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Button 
        variant="contained" 
        onClick={handleAdd}
        fullWidth
      >
        Add Goal & Habits
      </Button>
    </Paper>
  );
};