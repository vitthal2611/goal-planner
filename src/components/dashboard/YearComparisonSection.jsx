import React from 'react';
import { Box, Typography, Grid, Button, Chip } from '@mui/material';
import { YearComparisonCard } from './YearComparisonCard';
import { calculateYearOverYearMetrics } from '../../utils/yearComparisonUtils';
import { useYear } from '../../context/YearContext';

export const YearComparisonSection = ({ currentYearData, previousYearData }) => {
  const { selectedYear, currentYear } = useYear();
  
  if (!previousYearData || selectedYear === currentYear - 1) {
    return null;
  }

  const metrics = calculateYearOverYearMetrics(currentYearData, previousYearData);
  const comparisonYear = selectedYear - 1;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Year-over-Year Comparison
        </Typography>
        <Chip 
          label={`${selectedYear} vs ${comparisonYear}`} 
          color="primary" 
          variant="outlined" 
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <YearComparisonCard
            title="Goal Completion Rate"
            currentValue={metrics.goalCompletion.current}
            previousValue={metrics.goalCompletion.previous}
            unit="%"
            format="percentage"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <YearComparisonCard
            title="Goals Completed"
            currentValue={metrics.goalsCompleted.current}
            previousValue={metrics.goalsCompleted.previous}
            unit=" goals"
            format="number"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <YearComparisonCard
            title="Habit Consistency"
            currentValue={metrics.habitConsistency.current}
            previousValue={metrics.habitConsistency.previous}
            unit="%"
            format="percentage"
          />
        </Grid>
      </Grid>
    </Box>
  );
};