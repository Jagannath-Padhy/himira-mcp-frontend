import { useState, useCallback } from 'react';
import {
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { signInWithGoogleEnhanced } from '../utils/firebaseAuth';

interface UseFirebaseAuthReturn {
  // Google Sign In
  signInWithGoogle: () => Promise<User>;
  googleLoading: boolean;
  
  // Phone Sign In
  sendOTP: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<User>;
  phoneLoading: boolean;
  
  // ReCAPTCHA
  setupRecaptcha: (phoneNumber: string) => void;
  resetRecaptcha: () => void;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const signInWithGoogle = useCallback(async (): Promise<User> => {
    setGoogleLoading(true);
    clearError();
    
    try {
      const user = await signInWithGoogleEnhanced();
      return user;
    } catch (err: any) {
      const errorMessage = err.message || 'Google sign-in failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  }, [clearError]);

  const setupRecaptcha = useCallback((phoneNumber: string) => {
    if (!window.recaptchaVerifier) {
      // Enable test mode for specific phone number
      auth.settings.appVerificationDisabledForTesting = 
        import.meta.env.VITE_FIREBASE_AUTH_DISABLE === 'true' && phoneNumber === '+917351477479';

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha', {
        size: 'invisible',
        callback: () => {},
      });
    }
  }, []);

  const resetRecaptcha = useCallback(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
  }, []);

  const sendOTP = useCallback(async (phoneNumber: string): Promise<ConfirmationResult> => {
    setPhoneLoading(true);
    clearError();

    try {
      resetRecaptcha();
      setupRecaptcha(phoneNumber);

      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error('ReCAPTCHA not initialized');
      }

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return confirmationResult;
    } catch (err: any) {
      const errorMessage = err.code === 'auth/invalid-phone-number'
        ? 'Invalid phone number format'
        : err.code === 'auth/too-many-requests'
        ? 'Too many requests. Please try again later.'
        : 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPhoneLoading(false);
    }
  }, [clearError, resetRecaptcha, setupRecaptcha]);

  const verifyOTP = useCallback(async (
    confirmationResult: ConfirmationResult, 
    otp: string
  ): Promise<User> => {
    setPhoneLoading(true);
    clearError();

    try {
      const result = await confirmationResult.confirm(otp);
      return result.user;
    } catch (err: any) {
      const errorMessage = err.code === 'auth/invalid-verification-code'
        ? 'Invalid OTP. Please try again.'
        : err.code === 'auth/code-expired'
        ? 'OTP has expired. Please request a new one.'
        : 'OTP verification failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPhoneLoading(false);
    }
  }, [clearError]);

  return {
    signInWithGoogle,
    googleLoading,
    sendOTP,
    verifyOTP,
    phoneLoading,
    setupRecaptcha,
    resetRecaptcha,
    error,
    clearError,
  };
};
