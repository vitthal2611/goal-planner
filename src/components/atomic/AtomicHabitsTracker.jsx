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
import { collection, doc, onSnapshot, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

import AtomicHabit from '../../models/AtomicHabit';
import HabitCompletion from '../../models/HabitCompletion';
import AtomicMetrics from '../../utils/atomicMetrics';

import HabitCreationDialog from './HabitCreationDialog';
import TodayView from './TodayView';
import Dashboard from './Dashboard';

export default function AtomicHabitsTracker() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [currentView, setCurrentView] = useState('today');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Sync habits from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'atomicHabits'),
      (snapshot) => {
        const habitsData = snapshot.docs.map(doc => new AtomicHabit(doc.data()));
        setHabits(habitsData);
      },
      (error) => console.error('Habits sync error:', error)
    );
    return unsubscribe;
  }, [user]);

  // Sync completions from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'habitCompletions'),
      (snapshot) => {
        const completionsData = snapshot.docs.map(doc => new HabitCompletion(doc.data()));
        setCompletions(completionsData);
      },
      (error) => console.error('Completions sync error:', error)
    );
    return unsubscribe;
  }, [user]);

  const handleCreateHabit = async (newHabit) => {
    if (!user) return;
    try {
      const habitData = {
        id: newHabit.id,
        name: newHabit.name,
        trigger: newHabit.trigger,
        time: newHabit.time,
        location: newHabit.location,
        frequency: newHabit.frequency,
        weeklyDays: Array.isArray(newHabit.weeklyDays) ? newHabit.weeklyDays : [],
        isActive: newHabit.isActive,
        createdAt: newHabit.createdAt
      };
      await setDoc(doc(db, 'users', user.uid, 'atomicHabits', newHabit.id), habitData);
      setEditingHabit(null);
    } catch (error) {
      console.error('Create habit error:', error);
    }
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowCreateDialog(true);
  };

  const handleDeleteHabit = async (habitId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'atomicHabits', habitId));
      // Delete associated completions
      const completionsToDelete = completions.filter(c => c.habitId === habitId);
      await Promise.all(
        completionsToDelete.map(c => 
          deleteDoc(doc(db, 'users', user.uid, 'habitCompletions', c.id))
        )
      );
    } catch (error) {
      console.error('Delete habit error:', error);
    }
  };

  const handleToggleHabit = async (habitId) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const existingCompletion = completions.find(c => 
        c.habitId === habitId && c.date === today
      );

      if (existingCompletion) {
        const newCompleted = !existingCompletion.completed;
        await setDoc(doc(db, 'users', user.uid, 'habitCompletions', existingCompletion.id), {
          ...existingCompletion,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : null
        });
      } else {
        const newCompletion = {
          id: `${habitId}_${today}`,
          habitId,
          date: today,
          completed: true,
          completedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid, 'habitCompletions', newCompletion.id), newCompletion);
      }
    } catch (error) {
      console.error('Toggle habit error:', error);
    }
  };

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
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        );
    }
  };

  return (
    <Box sx={{ pb: 7 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Atomic Habits
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {renderCurrentView()}
      </Container>

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

      <HabitCreationDialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingHabit(null);
        }}
        onSave={handleCreateHabit}
        existingHabitsCount={activeHabitsCount}
        editingHabit={editingHabit}
      />
    </Box>
  );
}