import { useCallback } from 'react';
import { changePeriod, getYearFromPeriod } from '../utils/dateUtils';

export const usePeriodNavigation = (currentPeriod, dispatch) => {
  const handleChangePeriod = useCallback((direction) => {
    const newPeriod = changePeriod(currentPeriod, direction);
    if (newPeriod !== currentPeriod) {
      dispatch({ type: 'SET_CURRENT_PERIOD', payload: newPeriod });
    }
  }, [currentPeriod, dispatch]);

  const handleChangeYear = useCallback((year) => {
    const [, month] = currentPeriod.split('-');
    dispatch({ type: 'SET_CURRENT_PERIOD', payload: `${year}-${month}` });
  }, [currentPeriod, dispatch]);

  const handleChangeMonth = useCallback((direction) => {
    handleChangePeriod(direction);
  }, [handleChangePeriod]);

  return {
    handleChangePeriod,
    handleChangeYear,
    handleChangeMonth,
    currentYear: getYearFromPeriod(currentPeriod)
  };
};
