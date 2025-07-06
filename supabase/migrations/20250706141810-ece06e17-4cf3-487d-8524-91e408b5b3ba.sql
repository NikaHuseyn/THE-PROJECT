
-- Enhanced user profiles with personal information
ALTER TABLE public.user_style_profiles 
ADD COLUMN display_name TEXT,
ADD COLUMN profile_photo_url TEXT,
ADD COLUMN height_cm INTEGER,
ADD COLUMN weight_kg NUMERIC,
ADD COLUMN standard_size_top TEXT,
ADD COLUMN standard_size_bottom TEXT,
ADD COLUMN standard_size_shoes TEXT,
ADD COLUMN fit_preference TEXT CHECK (fit_preference IN ('tight', 'regular', 'loose')),
ADD COLUMN disliked_colors TEXT[],
ADD COLUMN disliked_styles TEXT[],
ADD COLUMN budget_min NUMERIC,
ADD COLUMN budget_max NUMERIC,
ADD COLUMN preferred_brands TEXT[],
ADD COLUMN preferred_retailers TEXT[],
ADD COLUMN public_profile_enabled BOOLEAN DEFAULT false,
ADD COLUMN gdpr_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN data_export_requested BOOLEAN DEFAULT false,
ADD COLUMN notification_preferences JSONB DEFAULT '{"likes": true, "comments": true, "follows": true, "events": true}'::jsonb;

-- Create user sizes table for more detailed size management
CREATE TABLE public.user_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL, -- 'tops', 'bottoms', 'shoes', 'dresses', etc.
  size_value TEXT NOT NULL,
  brand TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, brand)
);

-- Enable RLS for user_sizes
ALTER TABLE public.user_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sizes" 
  ON public.user_sizes 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user wishlist table
CREATE TABLE public.user_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  shopping_item_id UUID REFERENCES public.shopping_items(id) ON DELETE CASCADE,
  notes TEXT,
  priority INTEGER DEFAULT 1, -- 1-5 priority scale
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopping_item_id)
);

-- Enable RLS for user_wishlist
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlist" 
  ON public.user_wishlist 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create outfit ratings table for likes/dislikes
CREATE TABLE public.outfit_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  outfit_id UUID REFERENCES public.outfit_combinations(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 1=dislike, 5=love
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, outfit_id)
);

-- Enable RLS for outfit_ratings
ALTER TABLE public.outfit_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own outfit ratings" 
  ON public.outfit_ratings 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create past outfits history table
CREATE TABLE public.outfit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  outfit_id UUID REFERENCES public.outfit_combinations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.synced_calendar_events(id) ON DELETE SET NULL,
  worn_date DATE NOT NULL,
  occasion TEXT,
  weather_data JSONB,
  user_notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for outfit_history
ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own outfit history" 
  ON public.outfit_history 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create purchase history table
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  shopping_item_id UUID REFERENCES public.shopping_items(id) ON DELETE SET NULL,
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC,
  retailer TEXT,
  affiliate_commission NUMERIC,
  order_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_purchases
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own purchases" 
  ON public.user_purchases 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create OAuth connections table (extending existing user_calendar_connections)
CREATE TABLE public.user_oauth_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'facebook', 'instagram', etc.
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT[], -- permissions granted
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS for user_oauth_connections
ALTER TABLE public.user_oauth_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own OAuth connections" 
  ON public.user_oauth_connections 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
