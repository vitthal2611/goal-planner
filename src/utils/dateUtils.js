export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const getMonthName = (monthNumber) => {
  const month = parseInt(monthNumber);
  return MONTH_NAMES[month - 1] || 'Unknown';
};

export const formatPeriodDisplay = (period) => {
  const [year, month] = period.split('-');
  return `${getMonthName(month)} ${year}`;
};

export const getCurrentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const changePeriod = (currentPeriod, direction) => {
  const [year, month] = currentPeriod.split('-').map(Number);
  const newMonth = direction === 'next' ? (month === 12 ? 1 : month + 1) : (month === 1 ? 12 : month - 1);
  const newYear = direction === 'next' ? (month === 12 ? year + 1 : year) : (month === 1 ? year - 1 : year);
  
  if (newYear < 2026) return currentPeriod;
  
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
};

export const getYearFromPeriod = (period) => {
  return parseInt(period.split('-')[0]);
};

export const getMonthFromPeriod = (period) => {
  return parseInt(period.split('-')[1]);
};

export const generatePeriodOptions = (startYear = new Date().getFullYear(), months = 36) => {
  const periods = [];
  
  for (let i = 0; i <= months; i++) {
    const date = new Date(startYear, i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    periods.push({
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: `${MONTH_NAMES[month]} ${year}`
    });
  }
  return periods;
};
