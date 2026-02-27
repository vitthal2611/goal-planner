export class BudgetService {
  constructor(repository) {
    this.repo = repository;
  }

  async save(userId, data) {
    await this.repo.save(userId, data);
  }

  async load(userId) {
    return await this.repo.load(userId);
  }

  allocateBudget(envelopes, category, name, amount, totalIncome) {
    const budgetAmount = parseFloat(amount) || 0;

    if (budgetAmount > 0 && totalIncome <= 0) {
      throw new Error('Add income first before allocating budget');
    }

    const totalAllocated = Object.values(envelopes).reduce((sum, cat) =>
      sum + Object.values(cat).reduce((catSum, env) => catSum + env.budgeted, 0), 0);

    const currentBudget = envelopes[category][name].budgeted;
    const newTotal = totalAllocated - currentBudget + budgetAmount;

    if (newTotal > totalIncome) {
      throw new Error(`Cannot allocate ₹${budgetAmount.toLocaleString()}. Only ₹${(totalIncome - totalAllocated + currentBudget).toLocaleString()} available`);
    }

    return {
      ...envelopes,
      [category]: {
        ...envelopes[category],
        [name]: { ...envelopes[category][name], budgeted: budgetAmount }
      }
    };
  }

  incrementBudget(envelopes, category, name, increment, totalIncome) {
    const incrementAmount = parseFloat(increment) || 0;
    
    if (incrementAmount <= 0) {
      throw new Error('Enter valid increment amount');
    }

    if (totalIncome <= 0) {
      throw new Error('Add income first');
    }

    const totalAllocated = Object.values(envelopes).reduce((sum, cat) =>
      sum + Object.values(cat).reduce((catSum, env) => catSum + env.budgeted, 0), 0);

    if (totalAllocated + incrementAmount > totalIncome) {
      throw new Error(`Cannot increment by ₹${incrementAmount.toLocaleString()}. Only ₹${(totalIncome - totalAllocated).toLocaleString()} available`);
    }

    const currentBudget = envelopes[category][name].budgeted;
    return {
      ...envelopes,
      [category]: {
        ...envelopes[category],
        [name]: { ...envelopes[category][name], budgeted: currentBudget + incrementAmount }
      }
    };
  }

  copyFromPreviousPeriod(currentEnvelopes, previousEnvelopes) {
    const copied = {};
    Object.keys(currentEnvelopes).forEach(category => {
      copied[category] = {};
      Object.keys(currentEnvelopes[category]).forEach(name => {
        const prevBudget = previousEnvelopes?.[category]?.[name]?.budgeted || 0;
        copied[category][name] = { budgeted: prevBudget };
      });
    });
    return copied;
  }
}
