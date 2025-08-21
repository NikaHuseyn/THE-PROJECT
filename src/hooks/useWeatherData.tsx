
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, type LocationCoords } from './useLocation';

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

export const useWeatherData = (autoFetch = true) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const locationHook = useLocation({ showToasts: false });

  const fetchWeatherData = async (coords?: LocationCoords) => {
    setIsLoading(true);
    setError(null);

    try {
      let targetCoords = coords;
      
      if (!targetCoords) {
        targetCoords = await locationHook.getLocation();
        if (!targetCoords) {
          throw new Error('Unable to get location');
        }
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
    if (locationHook.coordinates) {
      return fetchWeatherData(locationHook.coordinates);
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
    isLoading: isLoading || locationHook.isLoading,
    error: error || locationHook.error,
    location: locationHook.coordinates,
    fetchWeatherData,
    refreshWeather,
    getWeatherForLocation,
    locationHook
  };
};
