import { ref, set, get } from 'firebase/database';
import { database } from '../../config/firebase';

export class FirebaseRepository {
  async save(path, data) {
    try {
      const dbRef = ref(database, path);
      await set(dbRef, data);
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  }

  async load(path) {
    try {
      const dbRef = ref(database, path);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      const snapshot = await Promise.race([get(dbRef), timeoutPromise]);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Firebase load error:', error);
      return null;
    }
  }
}
