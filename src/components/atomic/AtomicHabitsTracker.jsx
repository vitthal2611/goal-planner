import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import { Add, Today, Dashboard as DashboardIcon } from '@mui/icons-material';

import AtomicHabit from '../../models/AtomicHabit';
import HabitCompletion from '../../models/HabitCompletion';
import AtomicMetrics from '../../utils/atomicMetrics';

import HabitCreationDialog from './HabitCreationDialog';
import TodayView from './TodayView';
import Dashboard from './Dashboard';

const STORAGE_KEYS = {
  HABITS: 'atomic_habits',
  COMPLETIONS: 'habit_completions'
};

export default function AtomicHabitsTracker() {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [currentView, setCurrentView] = useState('today');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
    const savedCompletions = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);

    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits).map(h => new AtomicHabit(h));
      setHabits(parsedHabits);
    }

    if (savedCompletions) {
      const parsedCompletions = JSON.parse(savedCompletions).map(c => new HabitCompletion(c));
      setCompletions(parsedCompletions);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  }, [completions]);

  const handleCreateHabit = (newHabit) => {
    setHabits(prev => [...prev, newHabit]);
  };

  const handleToggleHabit = (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    
    setCompletions(prev => {
      const existingCompletion = prev.find(c => 
        c.habitId === habitId && c.date === today
      );

      if (existingCompletion) {
        // Toggle existing completion
        existingCompletion.toggle();
        return [...prev];
      } else {
        // Create new completion
        const newCompletion = new HabitCompletion({
          habitId,
          date: today,
          completed: true,
          completedAt: new Date().toISOString()
        });
        return [...prev, newCompletion];
      }
    });
  };

  // Calculate current metrics
  const today = new Date();
  const groupedHabits = AtomicMetrics.groupHabitsByTime(habits, completions, today);
  const dashboardSummary = AtomicMetrics.generateDashboardSummary(habits, completions, today);
  const activeHabitsCount = habits.filter(h => h.isActive).length;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard summary={dashboardSummary} />;
      case 'today':
      default:
        return (
          <TodayView 
            groupedHabits={groupedHabits}
            onToggleHabit={handleToggleHabit}
            completions={completions}
          />
        );
    }
  };

  return (
    <Box sx={{ pb: 7 }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Atomic Habits
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 3 }}>
        {renderCurrentView()}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add habit"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
        onClick={() => setShowCreateDialog(true)}
      >
        <Add />
      </Fab>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={currentView}
        onChange={(event, newValue) => setCurrentView(newValue)}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <BottomNavigationAction
          label="Today"
          value="today"
          icon={<Today />}
        />
        <BottomNavigationAction
          label="Dashboard"
          value="dashboard"
          icon={<DashboardIcon />}
        />
      </BottomNavigation>

      {/* Create Habit Dialog */}
      <HabitCreationDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateHabit}
        existingHabitsCount={activeHabitsCount}
      />
    </Box>
  );
}