import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Generate a unique browser fingerprint using FingerprintJS
 * This creates a consistent device ID based on browser characteristics
 */
export const generateUniqueBrowserId = async (): Promise<string> => {
  try {
    // Load FingerprintJS
    const fp = await FingerprintJS.load();
    
    // Get the fingerprint result
    const result = await fp.get();
    
    // Store the visitorId in local storage as deviceId
    localStorage.setItem('deviceId', result.visitorId);
    
    return result.visitorId;
  } catch (error) {
    console.error('❌ Error generating browser fingerprint:', error);
    
    // Fallback to a generated ID if fingerprinting fails
    const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', fallbackId);
    return fallbackId;
  }
};

/**
 * Get the stored device ID or generate a new one
 */
export const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    // Check if we already have a device ID stored
    const storedDeviceId = localStorage.getItem('deviceId');
    
    if (storedDeviceId) {
      return storedDeviceId;
    }
    
    // Generate a new device ID
    return await generateUniqueBrowserId();
  } catch (error) {
    console.error('❌ Error getting/creating device ID:', error);
    
    // Ultimate fallback
    const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', fallbackId);
    return fallbackId;
  }
};

/**
 * Initialize device fingerprinting on page load
 * This should be called when the app starts
 */
export const initializeDeviceFingerprint = async (): Promise<void> => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      await generateUniqueBrowserId();
    } catch (error) {
      console.error('❌ Error initializing device fingerprint:', error);
    }
  }
};
