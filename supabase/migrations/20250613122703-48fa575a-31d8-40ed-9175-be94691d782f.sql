
-- Create user style profiles table
CREATE TABLE public.user_style_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  face_shape VARCHAR(50),
  skin_tone VARCHAR(50),
  body_type VARCHAR(50),
  preferred_colors TEXT[],
  preferred_patterns TEXT[],
  preferred_fabrics TEXT[],
  style_personality TEXT[], -- e.g., ['minimalist', 'bohemian', 'classic']
  color_analysis JSONB, -- detailed color analysis results
  style_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  analysis_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user behavior tracking table
CREATE TABLE public.user_behavior_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- 'outfit_view', 'outfit_like', 'outfit_purchase', 'style_save', etc.
  event_data JSONB, -- flexible data for different event types
  outfit_id UUID REFERENCES outfit_combinations(id),
  shopping_item_id UUID REFERENCES shopping_items(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  recommendation_type VARCHAR(100), -- 'daily_outfit', 'occasion_outfit', 'shopping_suggestion'
  recommended_items JSONB, -- array of item IDs and reasoning
  occasion VARCHAR(200),
  weather_context JSONB,
  confidence_score DECIMAL(3,2),
  reasoning TEXT,
  is_accepted BOOLEAN DEFAULT NULL, -- user feedback
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security
ALTER TABLE public.user_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_style_profiles
CREATE POLICY "Users can view their own style profile" 
  ON public.user_style_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own style profile" 
  ON public.user_style_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own style profile" 
  ON public.user_style_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_behavior_analytics
CREATE POLICY "Users can view their own behavior data" 
  ON public.user_behavior_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own behavior data" 
  ON public.user_behavior_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view their own AI recommendations" 
  ON public.ai_recommendations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI recommendations" 
  ON public.ai_recommendations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI recommendations" 
  ON public.ai_recommendations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_style_profiles_user_id ON public.user_style_profiles(user_id);
CREATE INDEX idx_user_behavior_analytics_user_id ON public.user_behavior_analytics(user_id);
CREATE INDEX idx_user_behavior_analytics_event_type ON public.user_behavior_analytics(event_type);
CREATE INDEX idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_expires_at ON public.ai_recommendations(expires_at);

-- Function to clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.ai_recommendations 
  WHERE expires_at < now();
END;
$$;
