import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Fab, Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Dashboard } from './components/dashboard/Dashboard';
import { Goal, Habit, HabitLog } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateId, formatDate } from './utils/calculations';
import TestRunner from './tests/TestRunner';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
  },
  typography: {
    h3: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

// Sample data for demonstration
const sampleGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Read 24 books',
    yearlyTarget: 24,
    actualProgress: 8,
    unit: 'books',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'goal-2',
    title: 'Exercise 200 hours',
    yearlyTarget: 200,
    actualProgress: 45,
    unit: 'hours',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
  },
];

const sampleHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Read for 30 minutes',
    goalIds: ['goal-1'],
    trigger: 'After morning tea',
    time: '07:15',
    location: 'Living room',
    frequency: 'daily',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'habit-2',
    name: 'Morning workout',
    goalIds: ['goal-2'],
    trigger: 'After waking up',
    time: '06:00',
    location: 'Home gym',
    frequency: 'daily',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

function App() {
  const [showTests, setShowTests] = useState(false);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', sampleGoals);
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', sampleHabits);
  const [habitLogs, setHabitLogs] = useLocalStorage<HabitLog[]>('habitLogs', []);

  const handleLogHabit = (habitId: string, status: 'done' | 'skipped') => {
    const today = formatDate(new Date());
    const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === today);
    
    if (existingLog) {
      // Update existing log
      setHabitLogs(logs => 
        logs.map(log => 
          log.id === existingLog.id 
            ? { ...log, status, loggedAt: new Date() }
            : log
        )
      );
    } else {
      // Create new log
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        date: today,
        status,
        loggedAt: new Date(),
      };
      setHabitLogs(logs => [...logs, newLog]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Goal Planner & Daily Action Tracker
            </Typography>
            <Button color="inherit" onClick={() => setShowTests(!showTests)}>
              {showTests ? 'Hide Tests' : 'Run Tests'}
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {showTests ? (
            <TestRunner />
          ) : (
            <Dashboard 
              goals={goals} 
              habits={habits} 
              habitLogs={habitLogs}
            />
          )}
        </Container>

        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => console.log('Add new goal/habit')}
        >
          <AddIcon />
        </Fab>
      </Box>
    </ThemeProvider>
  );
}

export default App;