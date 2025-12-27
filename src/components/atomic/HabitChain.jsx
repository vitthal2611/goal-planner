import React from 'react';
import { Box, Typography } from '@mui/material';
import AtomicMetrics from '../../utils/atomicMetrics';

export default function HabitChain({ habit, completions, days = 7 }) {
  const chain = AtomicMetrics.generateHabitChain(habit, completions, days);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
        Last {days} days:
      </Typography>
      {chain.map((day, index) => (
        <Box
          key={index}
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            bgcolor: day.status === 'completed' ? 'success.main' : 
                     day.status === 'missed' ? 'grey.300' : 'transparent',
            color: day.status === 'completed' ? 'white' : 'text.secondary'
          }}
        >
          {day.symbol}
        </Box>
      ))}
    </Box>
  );
}