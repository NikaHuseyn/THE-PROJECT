-- Create recommendation feedback system for better AI learning loops

-- Update ai_recommendations table to include feedback tracking
ALTER TABLE public.ai_recommendations 
ADD COLUMN IF NOT EXISTS user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
ADD COLUMN IF NOT EXISTS user_feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS was_worn BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wear_context TEXT,
ADD COLUMN IF NOT EXISTS improvement_suggestions TEXT;

-- Create recommendation feedback history table
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_id UUID NOT NULL REFERENCES public.ai_recommendations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('initial', 'after_wear', 'general')),
  liked_aspects TEXT[],
  disliked_aspects TEXT[],
  improvement_suggestions TEXT,
  alternative_preferences TEXT,
  would_wear_again BOOLEAN,
  occasion_appropriateness INTEGER CHECK (occasion_appropriateness >= 1 AND occasion_appropriateness <= 5),
  comfort_rating INTEGER CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
  style_satisfaction INTEGER CHECK (style_satisfaction >= 1 AND style_satisfaction <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recommendation feedback
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for recommendation feedback
CREATE POLICY "Users can view their own feedback" 
ON public.recommendation_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" 
ON public.recommendation_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.recommendation_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user preference learning table
CREATE TABLE IF NOT EXISTS public.user_preference_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('color_preference', 'style_preference', 'brand_preference', 'fit_preference', 'occasion_preference')),
  insight_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  source_recommendations UUID[] DEFAULT '{}',
  times_confirmed INTEGER DEFAULT 1,
  last_confirmed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, insight_type, insight_data)
);

-- Enable RLS on user preference insights
ALTER TABLE public.user_preference_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for user preference insights
CREATE POLICY "Users can view their own insights" 
ON public.user_preference_insights 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to update preference insights based on feedback
CREATE OR REPLACE FUNCTION public.update_preference_insights()
RETURNS TRIGGER AS $$
DECLARE
  user_feedback_data JSONB;
BEGIN
  -- Extract insights from positive feedback (rating >= 4)
  IF NEW.rating >= 4 THEN
    -- Update color preferences
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON public.recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation_id ON public.recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_preference_insights_user_id ON public.user_preference_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_preference_insights_type ON public.user_preference_insights(insight_type);

-- Create view for recommendation analytics
CREATE OR REPLACE VIEW public.recommendation_analytics AS
SELECT 
  r.id,
  r.user_id,
  r.recommendation_type,
  r.confidence_score as ai_confidence,
  r.created_at,
  rf.rating as user_rating,
  rf.would_wear_again,
  rf.occasion_appropriateness,
  rf.comfort_rating,
  rf.style_satisfaction,
  rf.feedback_type,
  CASE 
    WHEN rf.rating >= 4 THEN 'positive'
    WHEN rf.rating = 3 THEN 'neutral'
    WHEN rf.rating <= 2 THEN 'negative'
    ELSE 'no_feedback'
  END as feedback_sentiment
FROM public.ai_recommendations r
LEFT JOIN public.recommendation_feedback rf ON r.id = rf.recommendation_id;

-- Enable RLS on the view
CREATE POLICY "Users can view their own recommendation analytics" 
ON public.recommendation_analytics
FOR SELECT 
USING (auth.uid() = user_id);