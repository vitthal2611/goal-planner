const DEV_MODE = import.meta.env.DEV || process.env.NODE_ENV === 'development';
const TEST_USER_PREFIX = 'test_';

export class DevGuard {
  static isTestUser(userId) {
    return userId?.startsWith(TEST_USER_PREFIX);
  }

  static async confirmWrite(userId, operation) {
    if (!DEV_MODE) return true;
    
    if (!this.isTestUser(userId)) {
      const confirmed = window.confirm(
        `⚠️ DEV MODE WARNING\n\n` +
        `You're about to ${operation} for a REAL user: ${userId}\n\n` +
        `Use test users (test_xxx) for development.\n\n` +
        `Continue anyway?`
      );
      
      if (!confirmed) {
        throw new Error('Operation cancelled by dev guard');
      }
    }
    
    return true;
  }

  static wrapRepository(repository, userId) {
    return new Proxy(repository, {
      get(target, prop) {
        const original = target[prop];
        
        if (typeof original !== 'function') return original;
        
        // Intercept write operations
        if (['save', 'saveIncome', 'saveEnvelopes', 'addTransaction', 'savePaymentMethods'].includes(prop)) {
          return async function(...args) {
            await DevGuard.confirmWrite(userId, prop);
            return original.apply(target, args);
          };
        }
        
        return original.bind(target);
      }
    });
  }
}
