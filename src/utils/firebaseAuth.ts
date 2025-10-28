import { signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

/**
 * Enhanced Google sign-in with better error handling and COOP warning suppression
 */
export const signInWithGoogleEnhanced = async (): Promise<User> => {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Suppress COOP and related warnings
  const suppressWarnings = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    if (
      message.includes('Cross-Origin-Opener-Policy') ||
      message.includes('window.closed') ||
      message.includes('COOP') ||
      message.includes('popup')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  try {
    // Temporarily override console methods
    console.warn = suppressWarnings;
    console.error = suppressWarnings;

    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // Handle specific Firebase auth errors
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        throw new Error('Sign-in was cancelled');
      case 'auth/popup-blocked':
        throw new Error('Popup was blocked by browser. Please allow popups and try again.');
      case 'auth/cancelled-popup-request':
        throw new Error('Sign-in was cancelled');
      case 'auth/account-exists-with-different-credential':
        throw new Error('An account already exists with this email address. Please sign in with the original method.');
      case 'auth/operation-not-allowed':
        throw new Error('Google sign-in is not enabled. Please contact support.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      default:
        throw new Error('Google sign-in failed. Please try again.');
    }
  } finally {
    // Restore original console methods
    console.warn = originalWarn;
    console.error = originalError;
  }
};
