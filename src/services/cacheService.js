// Simple in-memory cache with TTL
class CacheService {
  constructor() {
    this.cache = new Map();
    this.TTL = 30000; // 30 seconds default
  }

  set(key, value, ttl = this.TTL) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const isExpired = Date.now() - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  invalidate(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new CacheService();

// Wrapper for cached API calls
export const withCache = async (key, fetchFn, ttl) => {
  const cached = cache.get(key);
  
  if (cached !== null) {
    return cached;
  }
  
  const data = await fetchFn();
  cache.set(key, data, ttl);
  
  return data;
};
