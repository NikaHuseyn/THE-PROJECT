-- Create function to update preference insights based on feedback
CREATE OR REPLACE FUNCTION public.update_preference_insights()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract insights from positive feedback (rating >= 4)
  IF NEW.rating >= 4 THEN
    -- Update style preferences
    IF NEW.liked_aspects IS NOT NULL THEN
      INSERT INTO public.user_preference_insights (user_id, insight_type, insight_data, confidence_score, source_recommendations)
      VALUES (
        NEW.user_id, 
        'style_preference', 
        jsonb_build_object('liked_aspects', NEW.liked_aspects),
        CASE WHEN NEW.rating = 5 THEN 0.9 ELSE 0.7 END,
        ARRAY[NEW.recommendation_id]
      )
      ON CONFLICT (user_id, insight_type, insight_data) 
      DO UPDATE SET 
        times_confirmed = user_preference_insights.times_confirmed + 1,
        confidence_score = LEAST(user_preference_insights.confidence_score + 0.1, 1.0),
        last_confirmed = now(),
        updated_at = now();
    END IF;
  END IF;

  -- Extract insights from negative feedback (rating <= 2)
  IF NEW.rating <= 2 THEN
    IF NEW.disliked_aspects IS NOT NULL THEN
      INSERT INTO public.user_preference_insights (user_id, insight_type, insight_data, confidence_score, source_recommendations)
      VALUES (
        NEW.user_id, 
        'style_preference', 
        jsonb_build_object('disliked_aspects', NEW.disliked_aspects),
        0.8,
        ARRAY[NEW.recommendation_id]
      )
      ON CONFLICT (user_id, insight_type, insight_data) 
      DO UPDATE SET 
        times_confirmed = user_preference_insights.times_confirmed + 1,
        confidence_score = LEAST(user_preference_insights.confidence_score + 0.1, 1.0),
        last_confirmed = now(),
        updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for preference learning
CREATE TRIGGER update_preferences_from_feedback
  AFTER INSERT OR UPDATE ON public.recommendation_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_preference_insights();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_recommendation_feedback_updated_at
  BEFORE UPDATE ON public.recommendation_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preference_insights_updated_at
  BEFORE UPDATE ON public.user_preference_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();