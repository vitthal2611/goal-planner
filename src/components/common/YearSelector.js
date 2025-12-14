import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';

export const YearSelector = ({ selectedYear, onYearChange, availableYears = [] }) => {
  const currentYear = new Date().getFullYear();
  
  // Generate year range: 2 years back, current, 2 years forward
  const years = availableYears.length > 0 
    ? availableYears 
    : [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const getYearLabel = (year) => {
    if (year === currentYear) return 'Current';
    if (year < currentYear) return 'Past';
    return 'Planned';
  };

  const getYearColor = (year) => {
    if (year === currentYear) return 'primary';
    if (year < currentYear) return 'default';
    return 'secondary';
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Year:
        </Typography>
        {years.map((year) => (
          <Chip
            key={year}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <span>{year}</span>
                {year === currentYear && (
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    (Active)
                  </Typography>
                )}
              </Stack>
            }
            onClick={() => onYearChange(year)}
            color={selectedYear === year ? getYearColor(year) : 'default'}
            variant={selectedYear === year ? 'filled' : 'outlined'}
            sx={{
              fontWeight: selectedYear === year ? 600 : 400,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
          />
        ))}
      </Stack>
      
      {selectedYear < currentYear && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          📖 Viewing past year (read-only)
        </Typography>
      )}
      {selectedYear > currentYear && (
        <Typography variant="caption" color="secondary.main" sx={{ mt: 1, display: 'block' }}>
          📅 Planning future year
        </Typography>
      )}
    </Box>
  );
};
