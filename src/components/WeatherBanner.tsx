
import React from 'react';
import { CloudRain, Sun, Cloud } from 'lucide-react';

const WeatherBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 mb-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sun className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Today's Weather</p>
            <p className="text-sm text-gray-600">72°F, Partly Cloudy</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-blue-600">Perfect for</p>
          <p className="text-xs text-gray-600">Light layers & breathable fabrics</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherBanner;
