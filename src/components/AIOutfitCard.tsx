import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Palette, Lightbulb } from 'lucide-react';

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  recommended_items: any;
  occasion?: string;
  weather_context?: any;
  confidence_score?: number;
  reasoning?: string;
}

interface AIOutfitCardProps {
  recommendation: AIRecommendation;
  title: string;
  description: string;
}

const AIOutfitCard = ({ recommendation, title, description }: AIOutfitCardProps) => {
  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            AI Powered
          </Badge>
        </div>
        {recommendation.confidence_score && (
          <Badge className={getConfidenceColor(recommendation.confidence_score)}>
            {Math.round(recommendation.confidence_score * 100)}% confidence
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600">{description}</p>

        {recommendation.occasion && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-purple-700">Occasion:</span>
            <span className="text-sm text-gray-600">{recommendation.occasion}</span>
          </div>
        )}

        {recommendation.weather_context && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-700">Weather:</span>
            <span className="text-sm text-gray-600">
              {recommendation.weather_context.temperature}°F, {recommendation.weather_context.condition}
            </span>
          </div>
        )}

        {recommendation.recommended_items && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              AI-Styled Outfit:
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-3 border border-purple-100">
              {Object.entries(recommendation.recommended_items).map(([category, item]: [string, any]) => {
                if (Array.isArray(item)) {
                  return (
                    <div key={category} className="space-y-1">
                      <span className="capitalize font-medium text-purple-700">{category}:</span>
                      {item.map((accessory: any, index: number) => (
                        <div key={index} className="ml-4 text-sm">
                          <span className="text-gray-700">• {accessory.name || JSON.stringify(accessory)}</span>
                          {accessory.reasoning && (
                            <p className="text-xs text-gray-500 ml-2 italic">{accessory.reasoning}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="capitalize font-medium text-purple-700">{category}:</span>
                      <span className="text-gray-700 text-right flex-1 ml-2">{item.name || JSON.stringify(item)}</span>
                    </div>
                    {item.reasoning && (
                      <p className="text-xs text-gray-500 italic">{item.reasoning}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recommendation.reasoning && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Stylist's Reasoning:
            </h4>
            <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
              {recommendation.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIOutfitCard;