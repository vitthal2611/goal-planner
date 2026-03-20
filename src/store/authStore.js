import { create } from 'zustand';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  signIn: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  signUp: async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  },

  logout: async () => {
    await signOut(auth);
  }
}));
