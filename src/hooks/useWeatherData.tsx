
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  clothingRecommendations: string[];
  description: string;
  feelsLike: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const useWeatherData = (autoFetch = true) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        options
      );
    });
  };

  const fetchWeatherData = async (coords?: LocationCoords) => {
    setIsLoading(true);
    setError(null);

    try {
      let targetCoords = coords;
      
      if (!targetCoords) {
        const position = await getCurrentPosition();
        targetCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(targetCoords);
      }

      console.log('Fetching weather for:', targetCoords);
      
      const { data, error: weatherError } = await supabase.functions.invoke('weather-recommendations', {
        body: { 
          lat: targetCoords.latitude, 
          lon: targetCoords.longitude 
        }
      });

      if (weatherError) {
        throw new Error(weatherError.message || 'Failed to fetch weather data');
      }

      console.log('Weather data received:', data);
      setWeather(data);
      return data;
    } catch (err) {
      console.error('Error fetching weather data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWeather = () => {
    if (location) {
      return fetchWeatherData(location);
    } else {
      return fetchWeatherData();
    }
  };

  const getWeatherForLocation = (coords: LocationCoords) => {
    return fetchWeatherData(coords);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchWeatherData();
    }
  }, [autoFetch]);

  return {
    weather,
    isLoading,
    error,
    location,
    fetchWeatherData,
    refreshWeather,
    getWeatherForLocation,
    getCurrentPosition
  };
};
