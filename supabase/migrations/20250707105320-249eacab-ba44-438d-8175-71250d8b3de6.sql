
-- Create tables for storing fashion trend data
CREATE TABLE public.fashion_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  trend_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  growth_rate TEXT,
  popularity_rank INTEGER,
  season TEXT,
  occasions TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  source TEXT, -- e.g., 'api', 'manual', 'scraped'
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seasonal forecasts table
CREATE TABLE public.seasonal_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  year INTEGER NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  key_trends TEXT[] DEFAULT '{}',
  color_palette JSONB, -- [{name: string, hex: string}]
  must_have_items TEXT[] DEFAULT '{}',
  description TEXT,
  influencing_factors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trend predictions table
CREATE TABLE public.trend_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_name TEXT NOT NULL,
  probability NUMERIC(5,2) NOT NULL DEFAULT 0,
  timeframe TEXT,
  category TEXT NOT NULL,
  description TEXT,
  key_drivers TEXT[] DEFAULT '{}',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trend analytics table for tracking user interactions
CREATE TABLE public.trend_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  trend_id UUID REFERENCES public.fashion_trends(id),
  action_type TEXT NOT NULL, -- 'view', 'like', 'share', 'save'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.fashion_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_analytics ENABLE ROW LEVEL SECURITY;

-- Fashion trends - public read, admin write
CREATE POLICY "Anyone can view fashion trends" ON public.fashion_trends FOR SELECT USING (true);
CREATE POLICY "Service role can manage fashion trends" ON public.fashion_trends FOR ALL USING (true);

-- Seasonal forecasts - public read, admin write
CREATE POLICY "Anyone can view seasonal forecasts" ON public.seasonal_forecasts FOR SELECT USING (true);
CREATE POLICY "Service role can manage seasonal forecasts" ON public.seasonal_forecasts FOR ALL USING (true);

-- Trend predictions - public read, admin write
CREATE POLICY "Anyone can view trend predictions" ON public.trend_predictions FOR SELECT USING (true);
CREATE POLICY "Service role can manage trend predictions" ON public.trend_predictions FOR ALL USING (true);

-- Trend analytics - users can create their own analytics
CREATE POLICY "Users can create trend analytics" ON public.trend_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own trend analytics" ON public.trend_analytics FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_fashion_trends_category ON public.fashion_trends(category);
CREATE INDEX idx_fashion_trends_season ON public.fashion_trends(season);
CREATE INDEX idx_fashion_trends_trend_score ON public.fashion_trends(trend_score DESC);
CREATE INDEX idx_seasonal_forecasts_season_year ON public.seasonal_forecasts(season, year);
CREATE INDEX idx_trend_predictions_category ON public.trend_predictions(category);
CREATE INDEX idx_trend_analytics_user_trend ON public.trend_analytics(user_id, trend_id);
