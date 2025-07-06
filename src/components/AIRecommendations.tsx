import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, Calendar, Cloud, Lightbulb, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  recommended_items: any;
  occasion?: string;
  weather_context?: any;
  confidence_score?: number;
  reasoning?: string;
  is_accepted?: boolean;
  created_at: string;
  expires_at?: string;
}

interface AIInsights {
  styling_tips?: string[];
  alternative_options?: {
    if_cooler?: string;
    if_warmer?: string;
    dressy_version?: string;
    casual_version?: string;
  };
}

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<{[key: string]: AIInsights}>({});
  const { trackRecommendationInteraction } = useBehaviorAnalytics();

  useEffect(() => {
    fetchRecommendations();
    getCurrentWeather();
  }, []);

  const getCurrentWeather = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          const { data, error } = await supabase.functions.invoke('weather-recommendations', {
            body: { lat: latitude, lon: longitude }
          });

          if (error) throw error;
          setWeatherData(data);
        });
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendation = async (occasion?: string) => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-ai-recommendations', {
        body: {
          recommendationType: 'daily_outfit',
          weatherData,
          occasion: occasion || 'Daily casual wear'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Store AI insights separately
      if (data.ai_insights) {
        setAiInsights(prev => ({
          ...prev,
          [data.recommendation.id]: data.ai_insights
        }));
      }

      setRecommendations(prev => [data.recommendation, ...prev]);
      toast.success('AI recommendation generated successfully!');
    } catch (error) {
      console.error('Error generating AI recommendation:', error);
      toast.error('Failed to generate AI recommendation. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRecommendationFeedback = async (recommendationId: string, accepted: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_accepted: accepted })
        .eq('id', recommendationId);

      if (error) throw error;

      trackRecommendationInteraction(recommendationId, accepted ? 'accept' : 'reject');

      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, is_accepted: accepted }
            : rec
        )
      );

      toast.success(accepted ? 'Recommendation liked!' : 'Feedback recorded');
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      toast.error('Failed to record feedback');
    }
  };

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_outfit':
        return <Calendar className="h-4 w-4" />;
      case 'occasion_outfit':
        return <Sparkles className="h-4 w-4" />;
      case 'shopping_suggestion':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const formatRecommendationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Style Recommendations</h2>
          <p className="text-gray-600">Powered by OpenAI for personalized style advice</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generateAIRecommendation()}
            disabled={generating}
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Generate AI Recommendation'}
          </Button>
          <Button
            onClick={() => generateAIRecommendation('Work meeting')}
            disabled={generating}
            variant="outline"
          >
            Work Style
          </Button>
        </div>
      </div>

      {weatherData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Cloud className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Current Weather in {weatherData.location}</p>
                <p className="text-sm text-blue-600">
                  {weatherData.temperature}°F, {weatherData.condition} • Perfect for AI-powered styling!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No AI recommendations yet</h3>
            <p className="text-gray-500 mb-4">Let our AI stylist create personalized recommendations based on your profile!</p>
            <Button
              onClick={() => generateAIRecommendation()}
              disabled={generating}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              Get AI-Powered Recommendations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRecommendationTypeIcon(recommendation.recommendation_type)}
                    <CardTitle className="text-lg">
                      {formatRecommendationType(recommendation.recommendation_type)}
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                      AI Powered
                    </Badge>
                    {recommendation.confidence_score && (
                      <Badge className={getConfidenceColor(recommendation.confidence_score)}>
                        {Math.round(recommendation.confidence_score * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {recommendation.is_accepted === null ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecommendationFeedback(recommendation.id, true)}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecommendationFeedback(recommendation.id, false)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant={recommendation.is_accepted ? "default" : "destructive"}>
                        {recommendation.is_accepted ? 'Liked' : 'Disliked'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendation.occasion && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Occasion: {recommendation.occasion}</span>
                    </div>
                  )}
                  
                  {recommendation.weather_context && (
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Weather: {recommendation.weather_context.temperature}°F, {recommendation.weather_context.condition}
                      </span>
                    </div>
                  )}

                  {recommendation.recommended_items && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        AI-Styled Outfit:
                      </h4>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 space-y-3">
                        {Object.entries(recommendation.recommended_items).map(([category, item]: [string, any]) => {
                          if (Array.isArray(item)) {
                            return (
                              <div key={category} className="space-y-1">
                                <span className="capitalize font-medium text-gray-700">{category}:</span>
                                {item.map((accessory: any, index: number) => (
                                  <div key={index} className="ml-4 text-sm">
                                    <span className="text-gray-600">• {accessory.name || JSON.stringify(accessory)}</span>
                                    {accessory.reasoning && (
                                      <p className="text-xs text-gray-500 ml-2">{accessory.reasoning}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="capitalize font-medium text-gray-700">{category}:</span>
                                <span className="text-gray-600">{item.name || JSON.stringify(item)}</span>
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
                      <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                        {recommendation.reasoning}
                      </p>
                    </div>
                  )}

                  {aiInsights[recommendation.id]?.styling_tips && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Styling Tips:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {aiInsights[recommendation.id].styling_tips!.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    Generated on {new Date(recommendation.created_at).toLocaleDateString()} at{' '}
                    {new Date(recommendation.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
