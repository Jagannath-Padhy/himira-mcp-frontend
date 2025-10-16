import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD0ocw6nsIaBUIT9AR52tyb70ElayXvWes',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'marblex-hp-preprod.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'marblex-hp-preprod',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'marblex-hp-preprod.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '536454405515',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:536454405515:web:2bd290ee7adf449511a38e',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Add additional scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Declare global interface for recaptcha
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export { RecaptchaVerifier };
export default app;
