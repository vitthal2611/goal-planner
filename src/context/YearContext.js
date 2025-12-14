import React, { createContext, useContext, useState } from 'react';
import { getAvailableYears, isYearArchived } from '../utils/archiveUtils';

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showArchivedYears, setShowArchivedYears] = useState(false);
  const [yearData, setYearData] = useState({});

  const isCurrentYear = selectedYear === currentYear;
  const isPastYear = selectedYear < currentYear;
  const isFutureYear = selectedYear > currentYear;
  const isArchived = isYearArchived(yearData, selectedYear);
  const isReadOnly = isPastYear || isArchived;

  const availableYears = getAvailableYears(yearData, showArchivedYears);

  const archiveYear = (year) => {
    setYearData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        isArchived: true,
        archivedAt: new Date().toISOString()
      }
    }));
  };

  return (
    <YearContext.Provider value={{
      selectedYear,
      setSelectedYear,
      currentYear,
      isCurrentYear,
      isPastYear,
      isFutureYear,
      isReadOnly,
      isArchived,
      showArchivedYears,
      setShowArchivedYears,
      availableYears,
      archiveYear,
      yearData,
      setYearData
    }}>
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error('useYear must be used within YearProvider');
  }
  return context;
};
