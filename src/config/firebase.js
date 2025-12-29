import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDkVbVhmFA301ZERkgNuxzfkjxzmlpe7Uk",
  authDomain: "goal-planner-b604e.firebaseapp.com",
  databaseURL: "https://goal-planner-b604e-default-rtdb.firebaseio.com",
  projectId: "goal-planner-b604e",
  storageBucket: "goal-planner-b604e.firebasestorage.app",
  messagingSenderId: "82233624728",
  appId: "1:82233624728:web:49b5d083a39237d987e8ed"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);