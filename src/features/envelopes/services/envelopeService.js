export class EnvelopeService {
  getRolloverAmount(monthlyData, category, name, currentPeriod) {
    const previousPeriod = this.getPreviousPeriod(currentPeriod);
    const previousData = monthlyData[previousPeriod];
    
    if (!previousData?.envelopes?.[category]?.[name]) return 0;
    
    const prevEnv = previousData.envelopes[category][name];
    const prevRollover = this.getRolloverAmount(monthlyData, category, name, previousPeriod);
    const prevSpent = this.getSpentAmount(monthlyData, category, name, previousPeriod);
    const lastMonthBalance = prevEnv.budgeted + prevRollover - prevSpent;
    
    return Math.max(0, lastMonthBalance);
  }

  getSpentAmount(monthlyData, category, name, period) {
    const periodData = monthlyData[period];
    if (!periodData?.transactions) return 0;
    
    return periodData.transactions
      .filter(t => t.envelope === `${category}.${name}` && !t.type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getAvailableBalance(monthlyData, category, name, currentPeriod) {
    const currentData = monthlyData[currentPeriod];
    const env = currentData?.envelopes?.[category]?.[name];
    if (!env) return 0;
    
    const rollover = this.getRolloverAmount(monthlyData, category, name, currentPeriod);
    const spent = this.getSpentAmount(monthlyData, category, name, currentPeriod);
    return env.budgeted + rollover - spent;
  }

  getStatusColor(monthlyData, category, name, currentPeriod) {
    const balance = this.getAvailableBalance(monthlyData, category, name, currentPeriod);
    const currentData = monthlyData[currentPeriod];
    const env = currentData?.envelopes?.[category]?.[name];
    
    if (!env || balance <= 0) return '#dc2626';
    
    const spent = this.getSpentAmount(monthlyData, category, name, currentPeriod);
    const percentage = env.budgeted > 0 ? (spent / env.budgeted) * 100 : 0;
    
    if (percentage > 80) return '#f59e0b';
    return '#10b981';
  }

  getPreviousPeriod(currentPeriod) {
    const [year, month] = currentPeriod.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  }
}
