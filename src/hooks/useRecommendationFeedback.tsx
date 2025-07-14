import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackData {
  rating: number;
  feedbackType: 'initial' | 'after_wear' | 'general';
  likedAspects?: string[];
  dislikedAspects?: string[];
  improvementSuggestions?: string;
  alternativePreferences?: string;
  wouldWearAgain?: boolean;
  occasionAppropriateness?: number;
  comfortRating?: number;
  styleSatisfaction?: number;
}

export const useRecommendationFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async (recommendationId: string, feedback: FeedbackData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('recommendation_feedback')
        .insert({
          user_id: user.id,
          recommendation_id: recommendationId,
          rating: feedback.rating,
          feedback_type: feedback.feedbackType,
          liked_aspects: feedback.likedAspects,
          disliked_aspects: feedback.dislikedAspects,
          improvement_suggestions: feedback.improvementSuggestions,
          alternative_preferences: feedback.alternativePreferences,
          would_wear_again: feedback.wouldWearAgain,
          occasion_appropriateness: feedback.occasionAppropriateness,
          comfort_rating: feedback.comfortRating,
          style_satisfaction: feedback.styleSatisfaction,
        });

      if (error) throw error;

      // Also update the main recommendation record
      await supabase
        .from('ai_recommendations')
        .update({
          user_rating: feedback.rating,
          user_feedback: feedback.improvementSuggestions,
          feedback_timestamp: new Date().toISOString(),
        })
        .eq('id', recommendationId);

      toast({
        title: "Feedback submitted!",
        description: "Thank you for helping us improve your recommendations.",
      });

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsWorn = async (recommendationId: string, wearContext?: string) => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({
          was_worn: true,
          wear_context: wearContext,
        })
        .eq('id', recommendationId);

      if (error) throw error;

      toast({
        title: "Outfit marked as worn",
        description: "This helps us learn your preferences better!",
      });

      return true;
    } catch (error) {
      console.error('Error marking outfit as worn:', error);
      return false;
    }
  };

  const getFeedbackHistory = async (recommendationId: string) => {
    try {
      const { data, error } = await supabase
        .from('recommendation_feedback')
        .select('*')
        .eq('recommendation_id', recommendationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      return [];
    }
  };

  return {
    submitFeedback,
    markAsWorn,
    getFeedbackHistory,
    isSubmitting,
  };
};