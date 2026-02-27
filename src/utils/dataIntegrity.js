export class DataIntegrityChecker {
  validateBudgetData(data) {
    const errors = [];

    if (data.income !== undefined && (typeof data.income !== 'number' || data.income < 0)) {
      errors.push('Invalid income value');
    }

    if (data.envelopes) {
      Object.entries(data.envelopes).forEach(([category, envelopes]) => {
        Object.entries(envelopes).forEach(([name, envelope]) => {
          if (typeof envelope.budgeted !== 'number' || envelope.budgeted < 0) {
            errors.push(`Invalid budget for ${category}/${name}`);
          }
        });
      });
    }

    if (data.transactions && Array.isArray(data.transactions)) {
      data.transactions.forEach((tx, idx) => {
        if (!tx.amount || typeof tx.amount !== 'number') {
          errors.push(`Invalid transaction amount at index ${idx}`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  async checkDataIntegrity(userId, repository) {
    const issues = [];

    try {
      const data = await repository.load(userId);
      const validation = this.validateBudgetData(data);

      if (!validation.valid) {
        issues.push(...validation.errors);
      }

      // Check for data corruption
      const serialized = JSON.stringify(data);
      const deserialized = JSON.parse(serialized);
      
      if (JSON.stringify(deserialized) !== serialized) {
        issues.push('Data serialization mismatch detected');
      }

    } catch (error) {
      issues.push(`Integrity check failed: ${error.message}`);
    }

    return { healthy: issues.length === 0, issues };
  }
}

export const integrityChecker = new DataIntegrityChecker();
