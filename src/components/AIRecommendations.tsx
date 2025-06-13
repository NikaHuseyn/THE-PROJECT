
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, Calendar, Cloud } from 'lucide-react';
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

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { trackRecommendationInteraction } = useBehaviorAnalytics();

  useEffect(() => {
    fetchRecommendations();
  }, []);

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

  const generateDailyRecommendation = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // This is a mock implementation - in a real app, you'd call your AI service
      const mockRecommendation = {
        user_id: user.id,
        recommendation_type: 'daily_outfit',
        recommended_items: {
          top: { name: 'White Cotton Blouse', confidence: 0.9 },
          bottom: { name: 'High-waisted Jeans', confidence: 0.85 },
          shoes: { name: 'White Sneakers', confidence: 0.8 },
          accessories: [{ name: 'Gold Necklace', confidence: 0.7 }]
        },
        occasion: 'Casual Day Out',
        weather_context: { 
          temperature: 22, 
          condition: 'sunny', 
          humidity: 65 
        },
        confidence_score: 0.87,
        reasoning: 'Based on your preference for minimalist style and today\'s sunny weather, this combination offers comfort and style. The white blouse pairs well with your preferred neutral colors, while the jeans provide versatility for various activities.',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };

      const { data, error } = await supabase
        .from('ai_recommendations')
        .insert(mockRecommendation)
        .select()
        .single();

      if (error) throw error;

      setRecommendations(prev => [data, ...prev]);
      toast.success('New daily recommendation generated!');
    } catch (error) {
      console.error('Error generating recommendation:', error);
      toast.error('Failed to generate recommendation');
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

      // Track the interaction
      trackRecommendationInteraction(recommendationId, accepted ? 'accept' : 'reject');

      // Update local state
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
        <h2 className="text-2xl font-bold text-gray-800">AI Recommendations</h2>
        <Button
          onClick={generateDailyRecommendation}
          disabled={generating}
          className="bg-gradient-to-r from-purple-500 to-pink-600"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? 'Generating...' : 'Get Daily Recommendation'}
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No recommendations yet</h3>
            <p className="text-gray-500 mb-4">Generate your first AI-powered outfit recommendation!</p>
            <Button
              onClick={generateDailyRecommendation}
              disabled={generating}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              Get Started
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
                        Weather: {recommendation.weather_context.temperature}°C, {recommendation.weather_context.condition}
                      </span>
                    </div>
                  )}

                  {recommendation.recommended_items && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Recommended Items:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {Object.entries(recommendation.recommended_items).map(([category, item]: [string, any]) => (
                          <div key={category} className="flex justify-between items-center py-1">
                            <span className="capitalize font-medium text-gray-700">{category}:</span>
                            <span className="text-gray-600">{item.name || JSON.stringify(item)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendation.reasoning && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">AI Reasoning:</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                        {recommendation.reasoning}
                      </p>
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
