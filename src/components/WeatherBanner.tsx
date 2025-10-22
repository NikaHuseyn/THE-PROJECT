import React from 'react';
import { CloudRain, Sun, Cloud, CloudDrizzle, CloudSnow } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';

const WeatherBanner = () => {
  const { weather, isLoading, error } = useWeatherData(true);

  const getWeatherIcon = (condition?: string) => {
    if (!condition) return <Sun className="h-5 w-5 text-blue-600" />;
    
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return <CloudRain className="h-5 w-5 text-blue-600" />;
    if (lower.includes('cloud')) return <Cloud className="h-5 w-5 text-blue-600" />;
    if (lower.includes('drizzle')) return <CloudDrizzle className="h-5 w-5 text-blue-600" />;
    if (lower.includes('snow')) return <CloudSnow className="h-5 w-5 text-blue-600" />;
    return <Sun className="h-5 w-5 text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 mb-6 border border-blue-100 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="h-5 w-5 bg-blue-200 rounded" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Loading weather...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 mb-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <p className="font-medium text-gray-800">Today's Weather</p>
            <p className="text-sm text-gray-600">{weather.temperature}°F, {weather.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-blue-600">Perfect for</p>
          <p className="text-xs text-gray-600">{weather.clothingRecommendations[0]}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherBanner;
