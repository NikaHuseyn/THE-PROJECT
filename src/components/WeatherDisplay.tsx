import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  clothingRecommendations: string[];
}

const WeatherDisplay = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock weather data function (in a real app, you'd use a weather API)
  const getMockWeatherData = (lat: number, lon: number): WeatherData => {
    const temp = Math.floor(Math.random() * 30) + 50; // 50-80°F
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    let clothingRecommendations: string[] = [];
    
    if (temp >= 75) {
      clothingRecommendations = ['Light fabrics', 'Sundresses', 'Breathable cotton', 'Sandals', 'Light colors'];
    } else if (temp >= 65) {
      clothingRecommendations = ['Light layers', 'Cardigans', 'Jeans', 'Comfortable flats', 'Light jacket'];
    } else if (temp >= 55) {
      clothingRecommendations = ['Sweaters', 'Jackets', 'Closed-toe shoes', 'Long pants', 'Layered outfits'];
    } else {
      clothingRecommendations = ['Warm coats', 'Boots', 'Scarves', 'Heavy fabrics', 'Dark colors'];
    }

    if (condition.includes('Rain')) {
      clothingRecommendations.push('Waterproof jacket', 'Umbrella');
    }

    return {
      temperature: temp,
      condition,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 15) + 5,
      location: 'Your Location',
      clothingRecommendations
    };
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
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, you'd fetch weather data from an API here
        const weatherData = getMockWeatherData(latitude, longitude);
        setWeather(weatherData);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback to mock data
        const weatherData = getMockWeatherData(40.7128, -74.0060); // NYC coordinates
        setWeather(weatherData);
        setError('Using default location');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Sun') || condition.includes('Clear')) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    } else if (condition.includes('Rain')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (condition.includes('Cloud')) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    }
    return <Sun className="h-8 w-8 text-yellow-500" />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 75) return 'text-red-500';
    if (temp >= 65) return 'text-orange-500';
    if (temp >= 55) return 'text-blue-500';
    return 'text-blue-700';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 mb-6 border border-sky-100">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
          <span className="ml-2 text-sm text-sky-700">Getting weather...</span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">Unable to get weather information</p>
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
              Today's Weather
              <MapPin className="h-3 w-3 ml-1 text-sky-600" />
            </h3>
            <p className="text-xs text-gray-600">{weather.location}</p>
            {error && <p className="text-xs text-amber-600">{error}</p>}
          </div>
        </div>
        <Button onClick={getLocation} variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700 text-xs">
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
            <span className="text-gray-600 text-sm">{weather.condition}</span>
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

        {/* Clothing Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">
            Perfect Weather For:
          </h4>
          <div className="flex flex-wrap gap-1">
            {weather.clothingRecommendations.slice(0, 4).map((item, index) => (
              <span 
                key={index}
                className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full border border-sky-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
