import { useState, useEffect, useCallback } from 'react';
import { getOrCreateDeviceId, generateUniqueBrowserId } from '../utils/deviceFingerprint';

interface UseDeviceFingerprintReturn {
  deviceId: string | null;
  isLoading: boolean;
  error: string | null;
  regenerateDeviceId: () => Promise<void>;
}

export const useDeviceFingerprint = (): UseDeviceFingerprintReturn => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeviceId = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate device ID';
      setError(errorMessage);
      console.error('❌ Error loading device ID:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateDeviceId = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const id = await generateUniqueBrowserId();
      setDeviceId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate device ID';
      setError(errorMessage);
      console.error('❌ Error regenerating device ID:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeviceId();
  }, [loadDeviceId]);

  return {
    deviceId,
    isLoading,
    error,
    regenerateDeviceId,
  };
};
