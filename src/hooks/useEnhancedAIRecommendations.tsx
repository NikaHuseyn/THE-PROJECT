import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecommendationRequest {
  recommendationType?: 'daily_outfit' | 'event_outfit' | 'special_occasion';
  weatherData?: {
    temperature: number;
    condition: string;
    humidity: number;
    location: string;
  };
  occasion?: string;
  eventDetails?: {
    name: string;
    location?: string;
    dressCode?: string;
    type?: string;
  };
}

interface EnhancedRecommendation {
  id: string;
  recommendation_type: string;
  recommended_items: any;
  occasion?: string;
  weather_context?: any;
  confidence_score: number;
  reasoning: string;
  created_at: string;
  ai_insights?: {
    styling_tips?: string[];
    alternative_options?: any;
    color_analysis?: string;
    fit_guidance?: string;
    shopping_suggestions?: any;
  };
}

export const useEnhancedAIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRecommendation = useCallback(async (request: RecommendationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await supabase.functions.invoke('generate-ai-recommendations', {
        body: request,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate recommendation');
      }

      const newRecommendation = response.data;
      setRecommendations(prev => [newRecommendation.recommendation, ...prev]);

      toast({
        title: "New recommendation generated!",
        description: "Based on your style preferences and recent feedback.",
      });

      return newRecommendation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Failed to generate recommendation",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUserRecommendations = useCallback(async (limit = 10) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select(`
          *,
          recommendation_feedback (
            rating,
            liked_aspects,
            disliked_aspects,
            would_wear_again
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setRecommendations(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecommendationAnalytics = useCallback(async () => {
    try {
      // Since the view isn't available yet, we'll query the tables directly
      const { data: recommendations, error: recError } = await supabase
        .from('ai_recommendations')
        .select(`
          *,
          recommendation_feedback (
            rating,
            feedback_type,
            liked_aspects,
            disliked_aspects
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (recError) throw recError;

      // Calculate insights
      const analytics = recommendations || [];
      const totalRecommendations = analytics.length;
      const ratedRecommendations = analytics.filter(r => r.user_rating || (r.recommendation_feedback && r.recommendation_feedback.length > 0));
      
      const averageRating = ratedRecommendations.length > 0 
        ? ratedRecommendations.reduce((sum, r) => {
            const rating = r.user_rating || (r.recommendation_feedback?.[0]?.rating || 0);
            return sum + rating;
          }, 0) / ratedRecommendations.length 
        : 0;
      
      const sentimentBreakdown = {
        positive: analytics.filter(r => {
          const rating = r.user_rating || (r.recommendation_feedback?.[0]?.rating || 0);
          return rating >= 4;
        }).length,
        neutral: analytics.filter(r => {
          const rating = r.user_rating || (r.recommendation_feedback?.[0]?.rating || 0);
          return rating === 3;
        }).length,
        negative: analytics.filter(r => {
          const rating = r.user_rating || (r.recommendation_feedback?.[0]?.rating || 0);
          return rating > 0 && rating <= 2;
        }).length,
        no_feedback: analytics.filter(r => {
          const rating = r.user_rating || (r.recommendation_feedback?.[0]?.rating || 0);
          return rating === 0;
        }).length,
      };

      const recentTrend = ratedRecommendations
        .slice(0, 5)
        .reduce((sum, r) => {
          const rating = r.user_rating || (r.recommendation_feedback?.[0]?.rating || 0);
          return sum + rating;
        }, 0) / Math.min(5, ratedRecommendations.length);

      return {
        totalRecommendations,
        averageRating,
        sentimentBreakdown,
        recentTrend,
        improvementScore: recentTrend > averageRating ? 'improving' : recentTrend < averageRating ? 'declining' : 'stable',
        analytics
      };
    } catch (err) {
      console.error('Error fetching analytics:', err);
      return null;
    }
  }, []);

  const getUserPreferenceInsights = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_preference_insights')
        .select('*')
        .order('confidence_score', { ascending: false })
        .limit(15);

      if (error) throw error;

      // Group insights by type
      const groupedInsights = (data || []).reduce((acc, insight) => {
        if (!acc[insight.insight_type]) {
          acc[insight.insight_type] = [];
        }
        acc[insight.insight_type].push(insight);
        return acc;
      }, {} as Record<string, any[]>);

      return groupedInsights;
    } catch (err) {
      console.error('Error fetching preference insights:', err);
      return {};
    }
  }, []);

  const regenerateWithFeedback = useCallback(async (
    originalRecommendationId: string, 
    feedbackGuidance: string
  ) => {
    try {
      // Get the original recommendation
      const { data: originalRec } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('id', originalRecommendationId)
        .single();

      if (!originalRec) throw new Error('Original recommendation not found');

      // Generate new recommendation with feedback guidance
      const enhancedRequest: RecommendationRequest = {
        recommendationType: originalRec.recommendation_type as any,
        occasion: originalRec.occasion || 'Daily wear',
        weatherData: originalRec.weather_context as any,
      };

      return await generateRecommendation(enhancedRequest);
    } catch (err) {
      console.error('Error regenerating with feedback:', err);
      throw err;
    }
  }, [generateRecommendation]);

  return {
    recommendations,
    isLoading,
    error,
    generateRecommendation,
    fetchUserRecommendations,
    getRecommendationAnalytics,
    getUserPreferenceInsights,
    regenerateWithFeedback,
  };
};