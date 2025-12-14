import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Divider, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack
} from '@mui/material';
import { Archive, Lightbulb } from '@mui/icons-material';
import { SummaryCard } from '../common/SummaryCard';
import { GoalProgressSection } from '../goals/GoalProgressSection';
import { HabitStreakSection } from '../habits/HabitStreakSection';
import { YearComparisonSection } from './YearComparisonSection';
import { NextYearSuggestionCard } from '../goals/NextYearSuggestionCard';
import { ArchiveYearDialog } from '../common/ArchiveYearDialog';
import { calculateGoalProgress, calculateHabitConsistency } from '../../utils/calculations';
import { generateNextYearSuggestions } from '../../utils/suggestionUtils';
import { useAppContext } from '../../context/AppContext';
import { useYear } from '../../context/YearContext';

export const EnhancedDashboard = () => {
  const { goals, habits, habitLogs } = useAppContext();
  const { selectedYear, currentYear, isPastYear, archiveYear, yearData } = useYear();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentYearData = { goals, habits, habitLogs };
  const previousYearData = yearData[selectedYear - 1];
  const suggestions = generateNextYearSuggestions(currentYearData);

  const calculateOverallProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => {
      const progress = calculateGoalProgress(goal);
      return sum + progress.yearlyProgress;
    }, 0);
    return totalProgress / goals.length;
  };

  const calculateOverallHabitConsistency = () => {
    if (habits.length === 0) return 0;
    const consistencies = habits.map(habit => {
      const goal = goals.find(g => habit.goalIds.includes(g.id));
      const habitConsistency = calculateHabitConsistency(habit, habitLogs, goal);
      return habitConsistency.consistency;
    });
    return consistencies.reduce((sum, consistency) => sum + consistency, 0) / consistencies.length;
  };

  const handleArchiveYear = () => {
    archiveYear(selectedYear);
    setShowArchiveDialog(false);
  };

  const handleApplySuggestion = (suggestion) => {
    console.log('Applying suggestion:', suggestion);
  };

  const overallProgress = calculateOverallProgress();
  const habitConsistency = calculateOverallHabitConsistency();
  const completedGoals = goals.filter(g => g.isCompleted()).length;

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
            Dashboard {selectedYear}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your progress overview
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          {isPastYear && selectedYear < currentYear && (
            <Button
              variant="outlined"
              startIcon={<Archive />}
              onClick={() => setShowArchiveDialog(true)}
            >
              Archive Year
            </Button>
          )}
          {selectedYear === currentYear && (
            <Button
              variant="outlined"
              startIcon={<Lightbulb />}
              onClick={() => setShowSuggestions(true)}
            >
              Next Year Ideas
            </Button>
          )}
        </Stack>
      </Box>

      <YearComparisonSection 
        currentYearData={currentYearData}
        previousYearData={previousYearData}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Yearly Progress"
            value={`${Math.round(overallProgress)}%`}
            subtitle="Average across all goals"
            color={overallProgress >= 70 ? 'success' : overallProgress >= 50 ? 'primary' : 'warning'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Goals Completed"
            value={`${completedGoals}/${goals.length}`}
            subtitle="This year"
            color={completedGoals >= goals.length * 0.8 ? 'success' : 'primary'}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Habit Consistency"
            value={`${Math.round(habitConsistency)}%`}
            subtitle="Average consistency"
            color={habitConsistency >= 80 ? 'success' : habitConsistency >= 60 ? 'primary' : 'warning'}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <GoalProgressSection goals={goals} />
        </Grid>
        <Grid item xs={12}>
          <HabitStreakSection habits={habits} habitLogs={habitLogs} />
        </Grid>
      </Grid>

      <ArchiveYearDialog
        open={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={handleArchiveYear}
        year={selectedYear}
      />

      <Dialog 
        open={showSuggestions} 
        onClose={() => setShowSuggestions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ideas for Next Year</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {suggestions.map(suggestion => (
              <NextYearSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={handleApplySuggestion}
              />
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
