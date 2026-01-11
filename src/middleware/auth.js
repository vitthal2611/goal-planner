import { auth } from '../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// Authentication middleware for protecting routes and operations
export class AuthMiddleware {
  static currentUser = null;
  static authListeners = [];

  static init() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authListeners.forEach(callback => callback(user));
    });
  }

  static onAuthChange(callback) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  static requireAuth() {
    if (!this.currentUser) {
      throw new Error('Authentication required');
    }
    return this.currentUser;
  }

  static getUserId() {
    const user = this.requireAuth();
    return user.uid;
  }

  static validateUserAccess(resourceUserId) {
    const currentUserId = this.getUserId();
    if (currentUserId !== resourceUserId) {
      throw new Error('Access denied: User can only access their own resources');
    }
  }

  static async withAuth(operation) {
    try {
      const user = this.requireAuth();
      return await operation(user);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
}

// Initialize auth middleware
AuthMiddleware.init();