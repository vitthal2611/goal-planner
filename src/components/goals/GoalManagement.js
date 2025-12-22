import React, { useState } from 'react';
import { Box, Container, Typography, Divider, Stack, Grid, Tabs, Tab, Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import { GoalFormSimple as GoalForm } from './GoalFormSimple';
import { ImprovedGoalCard } from './ImprovedGoalCard';
import { GoalHabitManagement } from './GoalHabitManagement';
import { exportGoalsAndHabitsToPDF } from '../../utils/pdfExport';
import { useAppContext } from '../../context/AppContext';

export const GoalManagement = () => {
  const { goals, habits, logs, addGoal, updateGoal, deleteGoal, updateHabit } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  
  const handleExportPDF = () => {
    exportGoalsAndHabitsToPDF(goals, habits, logs);
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>Goals</Typography>
          <Typography variant="body1" color="text.secondary">Set and track your yearly objectives</Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExportPDF}
          disabled={goals.length === 0}
        >
          Export PDF
        </Button>
      </Stack>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 4 }}>
        <Tab label="Goal Overview" />
        <Tab label="Goal-Habit Management" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 7 }}>
            <GoalForm onAddGoal={addGoal} />
          </Box>

          <Divider sx={{ mb: 6 }}>
            <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
              Your Goals ({goals.length})
            </Typography>
          </Divider>

          {/* Goal List */}
          <Box>
            <Grid container spacing={3}>
              {goals.map(goal => (
                <Grid item xs={12} key={goal.id}>
                  <ImprovedGoalCard 
                    goal={goal}
                    onUpdate={(monthKey, value) => {
                      const updatedMonthlyData = { ...goal.monthlyData, [monthKey]: value };
                      const totalProgress = Object.values(updatedMonthlyData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                      updateGoal(goal.id, { monthlyData: updatedMonthlyData, actualProgress: totalProgress });
                    }}
                    onEditGoal={(updatedGoal) => {
                      updateGoal(goal.id, updatedGoal);
                    }}
                    onDelete={deleteGoal}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {activeTab === 1 && (
        <GoalHabitManagement 
          goals={goals}
          habits={habits}
          logs={logs}
          onUpdateHabit={updateHabit}
        />
      )}
    </Container>
  );
};
