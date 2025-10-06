import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationData, LocationError } from '@/lib/location';

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  onSuccess?: (location: LocationData) => void;
  onError?: (error: LocationError) => void;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  getCurrentLocation: () => Promise<void>;
  watchLocation: () => string | null;
  stopWatching: (watchId: string) => void;
  clearError: () => void;
  supported: boolean;
  permissionStatus: PermissionState | null;
}

export const useLocation = (options: UseLocationOptions = {}): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [locationFetched, setLocationFetched] = useState(false);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    watchPosition = false,
    onSuccess,
    onError
  } = options;

  // Check if geolocation is supported
  const supported = locationService.isSupported();

  // Get permission status
  useEffect(() => {
    if (supported) {
      locationService.getPermissionStatus().then(setPermissionStatus);
    }
  }, [supported]);

  const getCurrentLocation = useCallback(async () => {
    if (!supported) {
      setError({ code: 0, message: 'Geolocation is not supported' });
      return;
    }

    setLoading(true);
    setError(null);
    setLocationFetched(false); // Reset flag for manual requests

    try {
      const locationData = await locationService.getCurrentLocation();
      setLocation(locationData);
      setLocationFetched(true);
      setPermissionStatus('granted');
      onSuccess?.(locationData);
    } catch (err) {
      const locationError = err as LocationError;
      setError(locationError);
      setPermissionStatus('denied');
      onError?.(locationError);
    } finally {
      setLoading(false);
    }
  }, [supported, onSuccess, onError]);

  const watchLocation = useCallback((): string | null => {
    if (!supported) {
      setError({ code: 0, message: 'Geolocation is not supported' });
      return null;
    }

    const id = locationService.watchLocation(
      (locationData) => {
        setLocation(locationData);
        setLocationFetched(true);
        setError(null);
        onSuccess?.(locationData);
      },
      (locationError) => {
        setError(locationError);
        onError?.(locationError);
      }
    );

    setWatchId(id);
    return id;
  }, [supported, onSuccess, onError]);

  const stopWatching = useCallback((id: string) => {
    locationService.stopWatching(id);
    if (watchId === id) {
      setWatchId(null);
    }
  }, [watchId]);

  const clearError = useCallback(() => {
    setError(null);
    setLocationFetched(false); // Allow retry after error
  }, []);

  // Auto-get location on mount if not watching and not already fetched
  useEffect(() => {
    if (supported && !watchPosition && permissionStatus === 'granted' && !locationFetched && !location) {
      getCurrentLocation();
    }
  }, [supported, watchPosition, permissionStatus, locationFetched, location, getCurrentLocation]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    clearError,
    supported,
    permissionStatus
  };
};
