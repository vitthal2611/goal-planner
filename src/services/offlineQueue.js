export class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue();
    this.processing = false;
    
    window.addEventListener('online', () => this.processQueue());
  }

  loadQueue() {
    return JSON.parse(localStorage.getItem('offline_queue') || '[]');
  }

  saveQueue() {
    localStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }

  add(operation) {
    this.queue.push({
      ...operation,
      timestamp: Date.now(),
      id: `${Date.now()}_${Math.random()}`
    });
    this.saveQueue();
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const failed = [];

    for (const operation of this.queue) {
      try {
        await this.executeOperation(operation);
        console.log(`✓ Synced: ${operation.type}`);
      } catch (error) {
        console.error(`Failed to sync: ${operation.type}`, error);
        failed.push(operation);
      }
    }

    this.queue = failed;
    this.saveQueue();
    this.processing = false;
  }

  async executeOperation(operation) {
    const { type, path, data, method } = operation;
    
    // Execute the queued operation
    if (method && window[method]) {
      await window[method](path, data);
    }
  }

  getQueueSize() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();
