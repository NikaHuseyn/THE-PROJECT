
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Gem, Calendar, Sparkles, TrendingUp, Globe, Users, Eye, Zap } from 'lucide-react';
import { useSeasonalForecasts } from '@/hooks/useSeasonalForecasts';
import { useTrendPredictions } from '@/hooks/useTrendPredictions';

const TrendForecast = () => {
  const [selectedSeason, setSelectedSeason] = useState('');
  const [forecastType, setForecastType] = useState('seasonal');
  
  const { forecasts, isLoading: forecastsLoading, error: forecastsError } = useSeasonalForecasts();
  const { predictions, isLoading: predictionsLoading, error: predictionsError } = useTrendPredictions();

  // Set the selected season to the first forecast if not set
  React.useEffect(() => {
    if (forecasts.length > 0 && !selectedSeason) {
      setSelectedSeason(`${forecasts[0].season} ${forecasts[0].year}`);
    }
  }, [forecasts, selectedSeason]);

  const selectedForecast = forecasts.find(f => `${f.season} ${f.year}` === selectedSeason) || forecasts[0];

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (forecastsError || predictionsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading data: {forecastsError || predictionsError}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Gem className="h-6 w-6 mr-2" />
            Trend Forecast
          </h2>
          <p className="text-gray-600">AI-powered predictions for upcoming fashion trends</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={forecastType}
            onChange={(e) => setForecastType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="seasonal">Seasonal Forecast</option>
            <option value="predictions">Trend Predictions</option>
          </select>
        </div>
      </div>

      {forecastType === 'seasonal' && (
        <>
          {forecastsLoading ? (
            <div className="text-center py-8">Loading seasonal forecasts...</div>
          ) : forecasts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No seasonal forecasts available.</p>
            </div>
          ) : (
            <>
              {/* Season Selector */}
              <div className="flex space-x-2 mb-6">
                {forecasts.map((forecast) => (
                  <Button
                    key={forecast.id}
                    variant={selectedSeason === `${forecast.season} ${forecast.year}` ? "default" : "outline"}
                    onClick={() => setSelectedSeason(`${forecast.season} ${forecast.year}`)}
                    className={selectedSeason === `${forecast.season} ${forecast.year}` ? "bg-gradient-to-r from-purple-500 to-pink-600" : ""}
                  >
                    {forecast.season} {forecast.year}
                  </Button>
                ))}
              </div>

              {/* Seasonal Forecast Detail */}
              {selectedForecast && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                        {selectedForecast.season} {selectedForecast.year} Forecast
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        {Math.round(selectedForecast.confidence_score)}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedForecast.description && (
                      <p className="text-gray-700 mb-6">{selectedForecast.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Key Trends */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-1" />
                          Key Trends
                        </h4>
                        <div className="space-y-2">
                          {selectedForecast.key_trends.map((trend, index) => (
                            <Badge key={index} variant="outline" className="block text-xs">
                              {trend}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Color Palette */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Color Palette</h4>
                        <div className="space-y-2">
                          {selectedForecast.color_palette?.map((color, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs text-gray-600">{color.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Must-Have Items */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Must-Have Items</h4>
                        <div className="space-y-2">
                          {selectedForecast.must_have_items.map((item, index) => (
                            <Badge key={index} variant="secondary" className="block text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Influencing Factors */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Key Drivers
                        </h4>
                        <div className="space-y-2">
                          {selectedForecast.influencing_factors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="block text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {forecastType === 'predictions' && (
        <>
          {predictionsLoading ? (
            <div className="text-center py-8">Loading trend predictions...</div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No trend predictions available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predictions.map((prediction) => (
                <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{prediction.trend_name}</CardTitle>
                      {prediction.risk_level && (
                        <Badge className={getRiskColor(prediction.risk_level)}>
                          {prediction.risk_level} risk
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{prediction.category}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Probability</span>
                        <span className={`text-sm font-bold ${getProbabilityColor(prediction.probability)}`}>
                          {Math.round(prediction.probability)}%
                        </span>
                      </div>
                      <Progress value={prediction.probability} className="h-2" />
                    </div>
                    
                    {prediction.description && (
                      <p className="text-sm text-gray-700 mb-4">{prediction.description}</p>
                    )}
                    
                    {prediction.timeframe && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expected: {prediction.timeframe}
                        </div>
                      </div>
                    )}
                    
                    {prediction.key_drivers.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Key Drivers:</h5>
                        <div className="space-y-1">
                          {prediction.key_drivers.map((driver, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {driver}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            AI Trend Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Personalized Forecast</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Based on your style profile and current wardrobe, we'll provide personalized trend 
                  recommendations that align with your preferences.
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Get Personalized Recommendations
                  </Button>
                  <Button size="sm" variant="outline">
                    Set Trend Alerts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendForecast;
