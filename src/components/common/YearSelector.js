import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Chip, IconButton } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';

export const YearSelector = ({ selectedYear, onYearChange, availableYears = [] }) => {
  const currentYear = new Date().getFullYear();
  
  // Generate year range: current year + next 4 years
  const years = availableYears.length > 0 
    ? availableYears 
    : Array.from({ length: 5 }, (_, i) => currentYear + i);

  const handlePrevious = () => {
    const currentIndex = years.indexOf(selectedYear);
    if (currentIndex > 0) {
      onYearChange(years[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = years.indexOf(selectedYear);
    if (currentIndex < years.length - 1) {
      onYearChange(years[currentIndex + 1]);
    }
  };

  const getYearStatus = (year) => {
    if (year === currentYear) return 'Active';
    if (year > currentYear) return 'Planned';
    return 'Past';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
      <IconButton 
        onClick={handlePrevious}
        disabled={years.indexOf(selectedYear) === 0}
        sx={{ 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { borderColor: 'primary.main' }
        }}
      >
        <NavigateBefore />
      </IconButton>
      
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Year</InputLabel>
        <Select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          label="Year"
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {year}
                <Chip 
                  label={getYearStatus(year)}
                  size="small"
                  color={year === currentYear ? 'primary' : year > currentYear ? 'secondary' : 'default'}
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <IconButton 
        onClick={handleNext}
        disabled={years.indexOf(selectedYear) === years.length - 1}
        sx={{ 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { borderColor: 'primary.main' }
        }}
      >
        <NavigateNext />
      </IconButton>
    </Box>
  );
};
