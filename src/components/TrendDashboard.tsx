
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, MapPin, Sparkles, Eye, Heart, Star } from 'lucide-react';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';

interface TrendItem {
  id: string;
  name: string;
  category: string;
  trend_score: number;
  growth_rate: string;
  popularity_rank: number;
  season: string;
  occasions: string[];
  colors: string[];
  description: string;
  image_url?: string;
}

interface TrendForecast {
  season: string;
  key_trends: string[];
  color_palette: string[];
  must_have_items: string[];
  forecast_confidence: number;
}

const TrendDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeframe, setTimeframe] = useState('current');
  const { trackEvent } = useBehaviorAnalytics();

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes'];
  
  const currentTrends: TrendItem[] = [
    {
      id: '1',
      name: 'Oversized Blazers',
      category: 'Outerwear',
      trend_score: 92,
      growth_rate: '+15%',
      popularity_rank: 1,
      season: 'Fall 2024',
      occasions: ['Business', 'Casual'],
      colors: ['Beige', 'Black', 'Plaid'],
      description: 'Structured yet relaxed blazers that can be dressed up or down'
    },
    {
      id: '2',
      name: 'Wide-Leg Trousers',
      category: 'Bottoms',
      trend_score: 87,
      growth_rate: '+22%',
      popularity_rank: 2,
      season: 'Fall 2024',
      occasions: ['Business', 'Evening'],
      colors: ['Navy', 'Charcoal', 'Cream'],
      description: 'Flowing, comfortable pants that create an elegant silhouette'
    },
    {
      id: '3',
      name: 'Statement Earrings',
      category: 'Accessories',
      trend_score: 79,
      growth_rate: '+8%',
      popularity_rank: 3,
      season: 'Fall 2024',
      occasions: ['Evening', 'Cocktail'],
      colors: ['Gold', 'Silver', 'Pearl'],
      description: 'Bold, eye-catching earrings that elevate any outfit'
    }
  ];

  const seasonalForecast: TrendForecast = {
    season: 'Spring 2025',
    key_trends: ['Sustainable Fabrics', 'Bright Colors', 'Minimalist Cuts', 'Vintage Revival'],
    color_palette: ['Sage Green', 'Coral Pink', 'Sky Blue', 'Warm Yellow'],
    must_have_items: ['Linen Shirts', 'High-Waisted Shorts', 'Canvas Sneakers', 'Straw Hats'],
    forecast_confidence: 84
  };

  const handleTrendClick = (trendId: string, trendName: string) => {
    trackEvent({
      event_type: 'trend_view',
      event_data: { 
        trend_id: trendId, 
        trend_name: trendName,
        category: selectedCategory 
      }
    });
  };

  const getTrendScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const filteredTrends = selectedCategory === 'All' 
    ? currentTrends 
    : currentTrends.filter(trend => trend.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            Trend Dashboard
          </h2>
          <p className="text-gray-600">Stay ahead with AI-powered trend analysis</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="current">Current Trends</option>
            <option value="upcoming">Upcoming Trends</option>
            <option value="seasonal">Seasonal Forecast</option>
          </select>
        </div>
      </div>

      {/* Seasonal Forecast Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
            {seasonalForecast.season} Forecast
            <Badge className="ml-2 bg-purple-100 text-purple-800">
              {seasonalForecast.forecast_confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Key Trends</h4>
              <div className="space-y-1">
                {seasonalForecast.key_trends.map((trend, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {trend}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Color Palette</h4>
              <div className="flex flex-wrap gap-1">
                {seasonalForecast.color_palette.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Must-Have Items</h4>
              <div className="space-y-1">
                {seasonalForecast.must_have_items.slice(0, 2).map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                View Full Forecast
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-gradient-to-r from-rose-500 to-pink-600" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Current Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrends.map((trend, index) => (
          <Card 
            key={trend.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleTrendClick(trend.id, trend.name)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{trend.name}</CardTitle>
                  <p className="text-sm text-gray-600">{trend.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-amber-100 text-amber-800">
                    #{trend.popularity_rank}
                  </Badge>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendScoreBg(trend.trend_score)} ${getTrendScoreColor(trend.trend_score)}`}>
                    {trend.trend_score}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-8 w-8 text-gray-400" />
                </div>
                
                <p className="text-sm text-gray-700">{trend.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Growth Rate</span>
                  <span className="font-medium text-green-600">{trend.growth_rate}</span>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-2">Perfect for:</p>
                  <div className="flex flex-wrap gap-1">
                    {trend.occasions.map((occasion, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {occasion}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-2">Trending Colors:</p>
                  <div className="flex space-x-1">
                    {trend.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {trend.season}
                  </div>
                  <Button size="sm" variant="outline">
                    Shop Trend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Personalized Trend Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">AI Trend Recommendation</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Based on your style profile and wardrobe, we recommend focusing on <strong>Oversized Blazers</strong> 
                  and <strong>Statement Earrings</strong> to stay current with trending styles.
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Shop Recommended Trends
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendDashboard;
