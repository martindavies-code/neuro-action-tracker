import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User, Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// Default production client credentials (public identifiers for client-side connection)
const DEFAULT_CLIENT_CONFIG = {
  apiKey: "AIzaSyCCRVASy5E_bgA8bYNGUFC5nWLfeELAAoI",
  authDomain: "rhythm-quest-cf3d8.firebaseapp.com",
  projectId: "rhythm-quest-cf3d8",
  storageBucket: "rhythm-quest-cf3d8.firebasestorage.app",
  messagingSenderId: "847875940872",
  appId: "1:847875940872:web:5dceb4363b9743330227bd",
};

// Default config can be read from custom local storage, environment variables, or default fallback
export const getFirebaseConfig = () => {
  // 1. Check if user entered custom credentials in app
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customConfig = window.localStorage.getItem('rhythmquest_firebase_config');
      if (customConfig) {
        const parsed = JSON.parse(customConfig);
        if (parsed && parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {
      // Fall through
    }
  }

  // 2. Check environment variables
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envKey && envKey !== 'YOUR_API_KEY') {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_CLIENT_CONFIG.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_CLIENT_CONFIG.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_CLIENT_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CLIENT_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_CLIENT_CONFIG.appId,
    };
  }

  // 3. Fallback to client config for GitHub Pages deployment
  return DEFAULT_CLIENT_CONFIG;
};

export const saveCustomFirebaseConfig = (config: Record<string, string>): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem('rhythmquest_firebase_config', JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
};

export const clearCustomFirebaseConfig = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem('rhythmquest_firebase_config');
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = (): boolean => {
  return getFirebaseConfig() !== null;
};

export const initFirebase = () => {
  const config = getFirebaseConfig();
  if (config && !getApps().length) {
    try {
      app = initializeApp(config);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (e) {
      console.warn('Firebase initialization error:', e);
    }
  }
  return { app, auth, db };
};

// Initial run
initFirebase();

export {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  firebaseSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
};

export type { User };
