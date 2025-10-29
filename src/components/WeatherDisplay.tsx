
import React from 'react';
import { MapPin, Thermometer, Cloud, Sun, CloudRain, Wind, Droplets, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeatherData } from '@/hooks/useWeatherData';

const WeatherDisplay = () => {
  const { weather, isLoading, error, refreshWeather } = useWeatherData();

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <Sun className="h-6 w-6 text-yellow-500" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    } else if (conditionLower.includes('cloud')) {
      return <Cloud className="h-6 w-6 text-gray-500" />;
    }
    return <Sun className="h-6 w-6 text-yellow-500" />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 80) return 'text-red-600';
    if (temp >= 75) return 'text-red-500';
    if (temp >= 65) return 'text-orange-500';
    if (temp >= 55) return 'text-blue-500';
    return 'text-blue-700';
  };

  if (isLoading) {
    return (
      <div className="card-elegant p-6 mb-6 animate-fade-in">
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <RefreshCw className="animate-spin h-6 w-6 text-primary mr-3" />
            <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">Getting weather data...</span>
        </div>
      </div>
    );
  }

  if (!weather || error) {
    return (
      <div className="card-elegant p-6 mb-6 text-center animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-full">
            <MapPin className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Weather Unavailable</h3>
            <p className="text-muted-foreground text-sm">
              {error || 'Unable to get weather information'}
            </p>
          </div>
          <Button 
            onClick={refreshWeather} 
            variant="outline" 
            size="sm"
            className="border-primary/20 text-primary hover:bg-primary/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-warm p-3 mb-6 animate-fade-in interactive-scale">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center">
              Live Weather
              <MapPin className="h-3 w-3 ml-1 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground font-medium">{weather.location}</p>
          </div>
        </div>
        <Button 
          onClick={refreshWeather} 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:bg-primary/10 hover:text-primary font-medium"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Weather Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <div className="p-1 bg-accent/10 rounded-lg">
                <Thermometer className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className={`text-xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                  {Math.round((weather.temperature - 32) * 5 / 9)}°C
                </span>
                <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-white/40 backdrop-blur-sm rounded-lg p-1.5">
            Feels like {Math.round((weather.feelsLike - 32) * 5 / 9)}°C
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-white/40 backdrop-blur-sm rounded-lg p-1.5">
              <Droplets className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">{weather.humidity}%</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/40 backdrop-blur-sm rounded-lg p-1.5">
              <Wind className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>

        {/* AI-Powered Clothing Recommendations */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-xs flex items-center">
            <span className="mr-1.5">🤖</span>
            AI Style Recommendations
          </h4>
          <div className="text-xs bg-white/60 backdrop-blur-sm text-foreground px-3 py-2 rounded-lg border border-white/40 leading-relaxed">
            We recommend {weather.clothingRecommendations.join(', ').toLowerCase()}. These pieces will keep you comfortable and stylish in today's weather.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
