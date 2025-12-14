import { isBefore, isAfter, differenceInDays } from 'date-fns';

/**
 * Validate goal timeline dates
 */
export const validateGoalDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const warnings = [];
  
  // Check if end date is before start date
  if (isBefore(end, start)) {
    warnings.push({
      type: 'error',
      message: 'End date cannot be before start date'
    });
  }
  
  // Check if goal spans multiple years
  if (start.getFullYear() !== end.getFullYear()) {
    warnings.push({
      type: 'info',
      message: 'This goal spans multiple years'
    });
  }
  
  // Check if goal is very short (< 7 days)
  const duration = differenceInDays(end, start);
  if (duration < 7) {
    warnings.push({
      type: 'warning',
      message: 'Goal duration is less than a week'
    });
  }
  
  // Check if start date is in the past
  const today = new Date();
  if (isBefore(start, today)) {
    warnings.push({
      type: 'info',
      message: 'Start date is in the past'
    });
  }
  
  return {
    isValid: warnings.filter(w => w.type === 'error').length === 0,
    warnings
  };
};

/**
 * Handle mid-progress date edits
 */
export const handleDateEdit = (goal, newStartDate, newEndDate) => {
  const warnings = [];
  
  // If goal has progress, warn about date changes
  if (goal.actualProgress > 0) {
    warnings.push({
      type: 'warning',
      message: 'Changing dates will affect progress calculations'
    });
  }
  
  // Validate new dates
  const validation = validateGoalDates(newStartDate, newEndDate);
  
  return {
    canEdit: validation.isValid,
    warnings: [...warnings, ...validation.warnings]
  };
};

/**
 * Get user-friendly date validation message
 */
export const getDateValidationMessage = (warnings) => {
  if (warnings.length === 0) return null;
  
  const errors = warnings.filter(w => w.type === 'error');
  if (errors.length > 0) return errors[0].message;
  
  const warningMessages = warnings.filter(w => w.type === 'warning');
  if (warningMessages.length > 0) return warningMessages[0].message;
  
  return null;
};
