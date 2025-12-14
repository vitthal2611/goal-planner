export const archiveYear = (yearData, year) => {
  return {
    ...yearData,
    isArchived: true,
    archivedAt: new Date().toISOString()
  };
};

export const getAvailableYears = (allYearData, showArchived = false) => {
  const years = Object.keys(allYearData).map(Number).sort((a, b) => b - a);
  
  if (showArchived) {
    return years;
  }
  
  return years.filter(year => !allYearData[year]?.isArchived);
};

export const isYearArchived = (yearData, year) => {
  return yearData[year]?.isArchived || false;
};