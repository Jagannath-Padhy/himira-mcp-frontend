export const isAuthenticated = () => localStorage.getItem('auth') === 'true';

export const login = () => localStorage.setItem('auth', 'true');

export const logout = () => {
  localStorage.removeItem('auth');
  localStorage.removeItem('firebase_user');
};

export const getUserId = (): string | null => {
  try {
    const storedUser = localStorage.getItem('firebase_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return userData.uid || null;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return null;
};

export const getUserData = () => {
  try {
    const storedUser = localStorage.getItem('firebase_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error getting user data:', error);
  }
  return null;
};
