import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Palette, Lightbulb, Users, ShoppingBag, MapPin } from 'lucide-react';

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  recommended_items: any;
  occasion?: string;
  weather_context?: any;
  confidence_score?: number;
  reasoning?: string;
  ai_insights?: {
    styling_tips?: string[];
    alternative_options?: any;
    color_analysis?: string;
    fit_guidance?: string;
    shopping_suggestions?: {
      costume_shops?: string[];
      where_to_find?: {
        high_street?: string;
        vintage_shops?: string;
        online?: string;
        diy_tips?: string;
      };
      priority_items?: string[];
      brands_to_consider?: string[];
      price_ranges?: any;
    };
  };
}

interface AIOutfitCardProps {
  recommendation: AIRecommendation;
  title: string;
  description: string;
  aiInsights?: any;
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

{/* Character Suggestions for Themed Events */}
        {recommendation.recommended_items?.character_suggestions && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Character Inspirations:
            </h4>
            <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg p-4 space-y-3 border border-rose-100">
              {recommendation.recommended_items.character_suggestions.map((character: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-rose-700">{character.name}</h5>
                    <Badge className={`text-xs ${character.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                      character.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {character.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">From:</span> {character.source}
                  </p>
                  <p className="text-sm text-gray-600">{character.description}</p>
                  <p className="text-xs text-purple-600 italic">{character.why_perfect}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendation.recommended_items && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              AI-Styled Outfit:
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-3 border border-purple-100">
              {Object.entries(recommendation.recommended_items).filter(([key]) => key !== 'character_suggestions').map(([category, item]: [string, any]) => {
                if (Array.isArray(item)) {
                  return (
                    <div key={category} className="space-y-1">
                      <span className="capitalize font-medium text-purple-700">{category}:</span>
                      {item.map((accessory: any, index: number) => (
                        <div key={index} className="ml-4 text-sm space-y-1">
                          <span className="text-gray-700">• {accessory.name || JSON.stringify(accessory)}</span>
                          {accessory.character_connection && (
                            <p className="text-xs text-rose-600 ml-2 italic">🎭 {accessory.character_connection}</p>
                          )}
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
                    {item.character_connection && (
                      <p className="text-xs text-rose-600 italic">🎭 {item.character_connection}</p>
                    )}
                    {item.reasoning && (
                      <p className="text-xs text-gray-500 italic">{item.reasoning}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

{/* Shopping and Costume Sources */}
        {recommendation.ai_insights?.shopping_suggestions && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Where to Find Items:
            </h4>
            <div className="bg-green-50 rounded-lg p-4 space-y-3 border border-green-100">
              {recommendation.ai_insights.shopping_suggestions.costume_shops && (
                <div>
                  <span className="font-medium text-green-700">Costume Shops:</span>
                  <ul className="text-sm text-gray-600 ml-4 mt-1">
                    {recommendation.ai_insights.shopping_suggestions.costume_shops.map((shop: string, index: number) => (
                      <li key={index}>• {shop}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendation.ai_insights.shopping_suggestions.where_to_find && (
                <div className="space-y-2">
                  {Object.entries(recommendation.ai_insights.shopping_suggestions.where_to_find).map(([category, info]: [string, any]) => (
                    <div key={category}>
                      <span className="font-medium text-green-700 capitalize">{category.replace('_', ' ')}:</span>
                      <p className="text-sm text-gray-600 ml-4">{info}</p>
                    </div>
                  ))}
                </div>
              )}
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