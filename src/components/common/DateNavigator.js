import React from 'react';
import { Box, IconButton, Typography, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { format, addDays, subDays, isToday, isFuture } from 'date-fns';

export const DateNavigator = ({ selectedDate, onDateChange, preventFuture = true }) => {
  const handlePrevious = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNext = () => {
    const nextDate = addDays(selectedDate, 1);
    if (preventFuture && isFuture(nextDate)) return;
    onDateChange(nextDate);
  };

  const isNextDisabled = preventFuture && isFuture(addDays(selectedDate, 1));
  const isTodaySelected = isToday(selectedDate);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mb: 4
      }}
    >
      <IconButton
        onClick={handlePrevious}
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'grey.100',
            borderColor: 'primary.main'
          }
        }}
      >
        <ChevronLeft />
      </IconButton>

      <Box sx={{ textAlign: 'center', minWidth: 200 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {format(selectedDate, 'EEEE, MMM d')}
        </Typography>
        {isTodaySelected && (
          <Chip
            label="Today"
            size="small"
            color="primary"
            sx={{ fontWeight: 600, height: 20 }}
          />
        )}
      </Box>

      <IconButton
        onClick={handleNext}
        disabled={isNextDisabled}
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'grey.100',
            borderColor: 'primary.main'
          },
          '&.Mui-disabled': {
            bgcolor: 'grey.50',
            borderColor: 'divider',
            opacity: 0.5
          }
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};
