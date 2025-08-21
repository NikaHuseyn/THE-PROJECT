import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationState {
  coordinates: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  isPermissionDenied: boolean;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  showToasts?: boolean;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes cache
    showToasts = true
  } = options;

  const [state, setState] = useState<LocationState>({
    coordinates: null,
    isLoading: false,
    error: null,
    isPermissionDenied: false
  });

  const { toast } = useToast();
  const requestIdRef = useRef<number>(0);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const geolocationOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge
      };

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        geolocationOptions
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  const getLocation = useCallback(async (): Promise<LocationCoords | null> => {
    const currentRequestId = ++requestIdRef.current;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isPermissionDenied: false
    }));

    try {
      const position = await getCurrentPosition();
      
      // Check if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return null; // Ignore outdated request
      }

      const coordinates: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setState(prev => ({
        ...prev,
        coordinates,
        isLoading: false,
        error: null
      }));

      return coordinates;
    } catch (error) {
      // Check if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return null;
      }

      console.error('Error getting location:', error);
      
      let errorMessage = 'Unable to get your location. ';
      let isPermissionDenied = false;
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            isPermissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please enable location services and try again.';
            break;
        }
      } else {
        errorMessage += error instanceof Error ? error.message : 'Unknown error occurred.';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isPermissionDenied
      }));

      if (showToasts && !isPermissionDenied) {
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return null;
    }
  }, [getCurrentPosition, showToasts, toast]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      isPermissionDenied: false
    }));
  }, []);

  const retry = useCallback(() => {
    clearError();
    return getLocation();
  }, [getLocation, clearError]);

  return {
    coordinates: state.coordinates,
    isLoading: state.isLoading,
    error: state.error,
    isPermissionDenied: state.isPermissionDenied,
    getLocation,
    retry,
    clearError,
    getCurrentPosition
  };
};