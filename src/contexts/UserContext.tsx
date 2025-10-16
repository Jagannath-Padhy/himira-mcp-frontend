import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { isAuthenticated } from '../lib/auth';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId?: string;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updateUserFromFirebase: (firebaseUser: User) => void;
  clearUser: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('firebase_user');
        if (storedUser && isAuthenticated()) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const updateUserFromFirebase = (firebaseUser: User) => {
    const userData: UserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      providerId: firebaseUser.providerData[0]?.providerId,
    };

    setUser(userData);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('firebase_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('firebase_user');
  };

  const value: UserContextType = {
    user,
    setUser,
    updateUserFromFirebase,
    clearUser,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
