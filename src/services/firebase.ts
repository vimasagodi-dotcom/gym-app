import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Configurações do Firebase APPGYM
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDPDypydyVLrW1k4P6tl4OwXNJSf9Wevwg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'appgym-4559a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'appgym-4559a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'appgym-4559a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '441939391591',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:441939391591:web:96ae876cdda1eed3e150c2',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let dbFirestore: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    dbFirestore = getFirestore(app);
    console.log('✅ Firebase APPGYM conectado com sucesso!');
  } catch (err) {
    console.warn('⚠️ Erro ao inicializar Firebase real, a usar modo local-first:', err);
  }
} else {
  console.log('ℹ️ Firebase não configurado. Modo Local/Offline ativo.');
}

export {
  app,
  auth,
  dbFirestore,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
};
