
import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Cloud, Sun, CloudRain, Wind, Droplets, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const WeatherDisplay = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('weather-recommendations', {
        body: { lat, lon }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch weather data');
      }

      return data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weatherData = await fetchWeatherData(latitude, longitude);
          setWeather(weatherData);
        } catch (error) {
          console.error('Error getting weather data:', error);
          setError('Failed to fetch weather data. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enable location services.');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (conditionLower.includes('cloud')) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    }
    return <Sun className="h-8 w-8 text-yellow-500" />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 80) return 'text-red-600';
    if (temp >= 75) return 'text-red-500';
    if (temp >= 65) return 'text-orange-500';
    if (temp >= 55) return 'text-blue-500';
    return 'text-blue-700';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 mb-6 border border-sky-100">
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="animate-spin h-6 w-6 text-sky-600 mr-2" />
          <span className="text-sm text-sky-700">Getting weather data...</span>
        </div>
      </div>
    );
  }

  if (!weather || error) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">
            {error || 'Unable to get weather information'}
          </p>
          <Button onClick={getLocation} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-sky-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-sky-100 rounded-md">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              Live Weather
              <MapPin className="h-3 w-3 ml-1 text-sky-600" />
            </h3>
            <p className="text-xs text-gray-600">{weather.location}</p>
          </div>
        </div>
        <Button onClick={getLocation} variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Thermometer className="h-4 w-4 text-sky-600" />
              <span className={`text-xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                {weather.temperature}°F
              </span>
            </div>
            <span className="text-gray-600 text-sm capitalize">{weather.description}</span>
          </div>

          <div className="text-xs text-gray-600 mb-2">
            Feels like {weather.feelsLike}°F
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Droplets className="h-3 w-3" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="h-3 w-3" />
              <span>{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>

        {/* AI-Powered Clothing Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
            🤖 AI Recommendations
          </h4>
          <div className="flex flex-wrap gap-1">
            {weather.clothingRecommendations.slice(0, 4).map((item, index) => (
              <span 
                key={index}
                className="text-xs bg-gradient-to-r from-sky-100 to-indigo-100 text-sky-700 px-2 py-1 rounded-full border border-sky-200"
              >
                {item}
              </span>
            ))}
          </div>
          {weather.clothingRecommendations.length > 4 && (
            <p className="text-xs text-gray-500 mt-1">
              +{weather.clothingRecommendations.length - 4} more suggestions
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
