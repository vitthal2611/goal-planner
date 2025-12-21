import React from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { MonthlyProgressCard } from '../goals/MonthlyProgressCard';
import { lightTheme } from '../../theme/theme';

export const TestPage = () => {
  const mockGoal = {
    id: '1',
    title: 'read a 2 book each month',
    yearlyTarget: 24,
    actualProgress: 0,
    unit: 'books'
  };

  const handleUpdateProgress = (monthKey, value) => {
    console.log('Update progress:', monthKey, value);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <MonthlyProgressCard 
            goal={mockGoal}
            onUpdateProgress={handleUpdateProgress}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
};