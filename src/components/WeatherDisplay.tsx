
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
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 mb-8 border border-sky-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <span className="ml-3 text-sky-700">Getting your local weather...</span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to get weather information</p>
          <Button onClick={getLocation} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-sky-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-100 rounded-lg">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              Today's Weather
              <MapPin className="h-4 w-4 ml-2 text-sky-600" />
            </h3>
            <p className="text-sm text-gray-600">{weather.location}</p>
            {error && <p className="text-xs text-amber-600">{error}</p>}
          </div>
        </div>
        <Button onClick={getLocation} variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-sky-600" />
              <span className={`text-2xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                {weather.temperature}°F
              </span>
            </div>
            <span className="text-gray-600">{weather.condition}</span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Droplets className="h-4 w-4" />
              <span>{weather.humidity}% humidity</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="h-4 w-4" />
              <span>{weather.windSpeed} mph wind</span>
            </div>
          </div>
        </div>

        {/* Clothing Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            Perfect Weather For:
          </h4>
          <div className="flex flex-wrap gap-2">
            {weather.clothingRecommendations.map((item, index) => (
              <span 
                key={index}
                className="text-xs bg-sky-100 text-sky-700 px-3 py-1 rounded-full border border-sky-200"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Browse our collection to find the perfect outfit for today's weather
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
