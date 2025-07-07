
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crystal, Calendar, Sparkles, TrendingUp, Globe, Users, Eye, Zap } from 'lucide-react';

interface SeasonalTrend {
  id: string;
  season: string;
  year: number;
  confidence: number;
  keyTrends: string[];
  colorPalette: { name: string; hex: string }[];
  mustHaveItems: string[];
  description: string;
  influencingFactors: string[];
}

interface TrendPrediction {
  id: string;
  trendName: string;
  probability: number;
  timeframe: string;
  category: string;
  description: string;
  keyDrivers: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const TrendForecast = () => {
  const [selectedSeason, setSelectedSeason] = useState('Spring 2025');
  const [forecastType, setForecastType] = useState('seasonal');

  const seasonalForecasts: SeasonalTrend[] = [
    {
      id: '1',
      season: 'Spring 2025',
      year: 2025,
      confidence: 87,
      keyTrends: ['Sustainable Luxury', 'Digital Minimalism', 'Neo-Vintage', 'Tech-Organic Fusion'],
      colorPalette: [
        { name: 'Digital Mint', hex: '#A8E6CF' },
        { name: 'Coral Sunset', hex: '#FFB3BA' },
        { name: 'Sage Wisdom', hex: '#B5D3B7' },
        { name: 'Lavender Tech', hex: '#C7A8FF' }
      ],
      mustHaveItems: ['Convertible Blazer', 'Smart Fabric Dress', 'Biodegradable Sneakers', 'Tech-Integrated Accessories'],
      description: 'Spring 2025 will blend sustainability with technology, creating a new category of conscious fashion.',
      influencingFactors: ['Environmental consciousness', 'Tech integration', 'Work-life balance', 'Gen Z values']
    },
    {
      id: '2',
      season: 'Fall 2025',
      year: 2025,
      confidence: 73,
      keyTrends: ['Cozy Futurism', 'Heritage Remix', 'Climate Adaptation', 'Inclusive Luxury'],
      colorPalette: [
        { name: 'Warm Gray', hex: '#8B8680' },
        { name: 'Rust Orange', hex: '#B7410E' },
        { name: 'Forest Green', hex: '#355E3B' },
        { name: 'Deep Plum', hex: '#673147' }
      ],
      mustHaveItems: ['Climate Coat', 'Adaptive Wear', 'Heritage Boots', 'Modular Accessories'],
      description: 'Fall 2025 focuses on comfort and adaptability in response to changing lifestyle needs.',
      influencingFactors: ['Climate change', 'Remote work culture', 'Wellness focus', 'Inclusivity movement']
    }
  ];

  const trendPredictions: TrendPrediction[] = [
    {
      id: '1',
      trendName: 'AI-Personalized Clothing',
      probability: 78,
      timeframe: '6-12 months',
      category: 'Technology',
      description: 'Clothing that adapts to individual body measurements and style preferences using AI.',
      keyDrivers: ['AI advancement', 'Personalization demand', 'Fit issues'],
      riskLevel: 'medium'
    },
    {
      id: '2',
      trendName: 'Circular Fashion Economy',
      probability: 92,
      timeframe: '3-6 months',
      category: 'Sustainability',
      description: 'Mainstream adoption of rental, resale, and recycling models in fashion.',
      keyDrivers: ['Environmental concerns', 'Economic factors', 'Gen Z influence'],
      riskLevel: 'low'
    },
    {
      id: '3',
      trendName: 'Virtual Fashion Shows',
      probability: 65,
      timeframe: '12-18 months',
      category: 'Digital',
      description: 'Immersive virtual reality fashion presentations becoming the new norm.',
      keyDrivers: ['Technology adoption', 'Cost reduction', 'Global reach'],
      riskLevel: 'high'
    }
  ];

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

  const selectedForecast = seasonalForecasts.find(f => f.season === selectedSeason) || seasonalForecasts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Crystal className="h-6 w-6 mr-2" />
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
          {/* Season Selector */}
          <div className="flex space-x-2 mb-6">
            {seasonalForecasts.map((forecast) => (
              <Button
                key={forecast.id}
                variant={selectedSeason === forecast.season ? "default" : "outline"}
                onClick={() => setSelectedSeason(forecast.season)}
                className={selectedSeason === forecast.season ? "bg-gradient-to-r from-purple-500 to-pink-600" : ""}
              >
                {forecast.season}
              </Button>
            ))}
          </div>

          {/* Seasonal Forecast Detail */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  {selectedForecast.season} Forecast
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  {selectedForecast.confidence}% Confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{selectedForecast.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Key Trends */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Key Trends
                  </h4>
                  <div className="space-y-2">
                    {selectedForecast.keyTrends.map((trend, index) => (
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
                    {selectedForecast.colorPalette.map((color, index) => (
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
                    {selectedForecast.mustHaveItems.map((item, index) => (
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
                    {selectedForecast.influencingFactors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="block text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {forecastType === 'predictions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendPredictions.map((prediction) => (
            <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{prediction.trendName}</CardTitle>
                  <Badge className={getRiskColor(prediction.riskLevel)}>
                    {prediction.riskLevel} risk
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{prediction.category}</p>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Probability</span>
                    <span className={`text-sm font-bold ${getProbabilityColor(prediction.probability)}`}>
                      {prediction.probability}%
                    </span>
                  </div>
                  <Progress value={prediction.probability} className="h-2" />
                </div>
                
                <p className="text-sm text-gray-700 mb-4">{prediction.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    Expected: {prediction.timeframe}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Key Drivers:</h5>
                  <div className="space-y-1">
                    {prediction.keyDrivers.map((driver, index) => (
                      <Badge key={index} variant="outline" className="text-xs mr-1">
                        {driver}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                  Based on your style profile and current wardrobe, we predict that <strong>sustainable luxury</strong> and 
                  <strong> tech-integrated accessories</strong> will be most relevant to your personal style evolution.
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
