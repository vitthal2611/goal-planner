import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDkVbVhmFA301ZERkgNuxzfkjxzmlpe7Uk",
  authDomain: "goal-planner-b604e.firebaseapp.com",
  databaseURL: "https://goal-planner-b604e-default-rtdb.firebaseio.com",
  projectId: "goal-planner-b604e",
  storageBucket: "goal-planner-b604e.firebasestorage.app",
  messagingSenderId: "82233624728",
  appId: "1:82233624728:web:49b5d083a39237d987e8ed",
  measurementId: "G-ZJRQEGH25W"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
