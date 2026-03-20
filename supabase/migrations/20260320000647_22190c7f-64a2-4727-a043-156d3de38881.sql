
-- =============================================
-- 1. User Style Profiles
-- =============================================
CREATE TABLE public.user_style_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  profile_photo_url text,
  body_type text,
  height_cm numeric,
  weight_kg numeric,
  face_shape text,
  skin_tone text,
  preferred_colors text[] DEFAULT '{}',
  disliked_colors text[] DEFAULT '{}',
  preferred_patterns text[] DEFAULT '{}',
  preferred_fabrics text[] DEFAULT '{}',
  style_personality text[] DEFAULT '{}',
  disliked_styles text[] DEFAULT '{}',
  preferred_brands text[] DEFAULT '{}',
  preferred_retailers text[] DEFAULT '{}',
  standard_size_top text,
  standard_size_bottom text,
  standard_size_shoes text,
  fit_preference text,
  budget_min numeric DEFAULT 0,
  budget_max numeric DEFAULT 1000,
  style_confidence_score numeric DEFAULT 0.5,
  color_analysis jsonb,
  analysis_image_url text,
  public_profile_enabled boolean DEFAULT false,
  gdpr_consent_date timestamptz,
  data_export_requested boolean DEFAULT false,
  notification_preferences jsonb DEFAULT '{"likes": true, "comments": true, "follows": true, "events": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_style_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_style_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_style_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_style_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON public.user_style_profiles FOR SELECT TO authenticated USING (public_profile_enabled = true);

-- =============================================
-- 2. Wardrobe Items
-- =============================================
CREATE TABLE public.wardrobe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  color text,
  brand text,
  size text,
  image_url text,
  tags text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wardrobe" ON public.wardrobe_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 3. Social Profiles
-- =============================================
CREATE TABLE public.social_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  posts_count integer DEFAULT 0,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  total_likes bigint DEFAULT 0,
  badge_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social profiles are viewable by all authenticated" ON public.social_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own social profile" ON public.social_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social profile" ON public.social_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 4. Posts
-- =============================================
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_urls text[] DEFAULT '{}',
  caption text,
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  flag_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by all authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 5. Likes
-- =============================================
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by all authenticated" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 6. Comments
-- =============================================
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by all authenticated" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 7. Followers
-- =============================================
CREATE TABLE public.followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Followers viewable by all authenticated" ON public.followers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow" ON public.followers FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- =============================================
-- 8. Notifications
-- =============================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  related_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  related_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 9. Content Reports
-- =============================================
CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  report_reason text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.content_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.content_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- =============================================
-- 10. AI Recommendations
-- =============================================
CREATE TABLE public.ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_type text NOT NULL DEFAULT 'daily',
  recommended_items jsonb DEFAULT '[]',
  occasion text,
  weather_context jsonb,
  confidence_score numeric DEFAULT 0.5,
  reasoning text,
  is_accepted boolean,
  user_rating integer,
  user_feedback text,
  feedback_timestamp timestamptz,
  was_worn boolean DEFAULT false,
  wear_date timestamptz,
  wear_context text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recommendations" ON public.ai_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 11. Recommendation Feedback
-- =============================================
CREATE TABLE public.recommendation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id uuid REFERENCES public.ai_recommendations(id) ON DELETE CASCADE NOT NULL,
  rating integer,
  feedback_type text DEFAULT 'general',
  liked_aspects text[] DEFAULT '{}',
  disliked_aspects text[] DEFAULT '{}',
  improvement_suggestions text,
  alternative_preferences text,
  would_wear_again boolean,
  occasion_appropriateness integer,
  comfort_rating integer,
  style_satisfaction integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feedback" ON public.recommendation_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 12. User Preference Insights
-- =============================================
CREATE TABLE public.user_preference_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL,
  insight_value text,
  confidence_score numeric DEFAULT 0.5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_preference_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.user_preference_insights FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 13. Synced Calendar Events
-- =============================================
CREATE TABLE public.synced_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  google_event_id text,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location text,
  dress_code text,
  event_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.synced_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar events" ON public.synced_calendar_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 14. User OAuth Connections
-- =============================================
CREATE TABLE public.user_oauth_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  provider_user_id text,
  scope text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  token_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.user_oauth_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own oauth connections" ON public.user_oauth_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 15. User Calendar Connections
-- =============================================
CREATE TABLE public.user_calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL DEFAULT 'google',
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.user_calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar connections" ON public.user_calendar_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 16. Fashion Trends
-- =============================================
CREATE TABLE public.fashion_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  trend_score numeric DEFAULT 0,
  growth_rate text,
  popularity_rank integer,
  season text,
  occasions text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  description text,
  image_url text,
  source text,
  external_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.fashion_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fashion trends viewable by all authenticated" ON public.fashion_trends FOR SELECT TO authenticated USING (true);

-- =============================================
-- 17. Seasonal Forecasts
-- =============================================
CREATE TABLE public.seasonal_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL,
  year integer NOT NULL,
  confidence_score numeric DEFAULT 0.5,
  key_trends text[] DEFAULT '{}',
  color_palette jsonb,
  must_have_items text[] DEFAULT '{}',
  description text,
  influencing_factors text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(season, year)
);

ALTER TABLE public.seasonal_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seasonal forecasts viewable by all authenticated" ON public.seasonal_forecasts FOR SELECT TO authenticated USING (true);

-- =============================================
-- 18. Trend Predictions
-- =============================================
CREATE TABLE public.trend_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_name text NOT NULL UNIQUE,
  probability numeric DEFAULT 0.5,
  timeframe text,
  category text NOT NULL DEFAULT '',
  description text,
  key_drivers text[] DEFAULT '{}',
  risk_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.trend_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trend predictions viewable by all authenticated" ON public.trend_predictions FOR SELECT TO authenticated USING (true);

-- =============================================
-- 19. Shopping Items
-- =============================================
CREATE TABLE public.shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  price numeric DEFAULT 0,
  rental_price numeric,
  image_url text,
  retailer_name text DEFAULT '',
  retailer_url text DEFAULT '',
  affiliate_url text,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  description text,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shopping items viewable by all authenticated" ON public.shopping_items FOR SELECT TO authenticated USING (true);

-- =============================================
-- 20. Capsule Wardrobes
-- =============================================
CREATE TABLE public.capsule_wardrobes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  season text,
  occasion text,
  color_scheme jsonb,
  wardrobe_item_ids text[] DEFAULT '{}',
  max_items integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.capsule_wardrobes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own capsule wardrobes" ON public.capsule_wardrobes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 21. Outfit History
-- =============================================
CREATE TABLE public.outfit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  outfit_combination_id uuid,
  synced_calendar_event_id uuid REFERENCES public.synced_calendar_events(id) ON DELETE SET NULL,
  worn_date date NOT NULL DEFAULT CURRENT_DATE,
  occasion text,
  weather_conditions jsonb,
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own outfit history" ON public.outfit_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 22. Outfit Combinations (referenced by outfit_history)
-- =============================================
CREATE TABLE public.outfit_combinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text,
  image_url text,
  wardrobe_item_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.outfit_combinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own outfit combinations" ON public.outfit_combinations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add FK now that table exists
ALTER TABLE public.outfit_history ADD CONSTRAINT fk_outfit_combination FOREIGN KEY (outfit_combination_id) REFERENCES public.outfit_combinations(id) ON DELETE SET NULL;

-- =============================================
-- 23. User Badges
-- =============================================
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  description text,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges viewable by all authenticated" ON public.user_badges FOR SELECT TO authenticated USING (true);

-- =============================================
-- 24. User Behavior Analytics
-- =============================================
CREATE TABLE public.user_behavior_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics" ON public.user_behavior_analytics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics" ON public.user_behavior_analytics FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- 25. User Sizes
-- =============================================
CREATE TABLE public.user_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  size_value text NOT NULL,
  brand text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, brand)
);

ALTER TABLE public.user_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sizes" ON public.user_sizes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 26. User Purchases
-- =============================================
CREATE TABLE public.user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shopping_item_id uuid REFERENCES public.shopping_items(id) ON DELETE SET NULL,
  purchase_date timestamptz DEFAULT now(),
  price_paid numeric,
  retailer text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own purchases" ON public.user_purchases FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 27. User Wishlist
-- =============================================
CREATE TABLE public.user_wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shopping_item_id uuid REFERENCES public.shopping_items(id) ON DELETE CASCADE,
  priority integer DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist" ON public.user_wishlist FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 28. Waitlist
-- =============================================
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =============================================
-- 29. Database functions
-- =============================================

-- is_admin function used by AdminGuard
CREATE OR REPLACE FUNCTION public.is_admin(target_user_id uuid, required_role text DEFAULT 'admin')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT false;
$$;

-- log_security_event function used by AuthGuard
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_data jsonb DEFAULT '{}')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Stub: could log to a security_events table in the future
  RETURN;
END;
$$;

-- check_ai_rate_limit function used by RateLimitDisplay
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', 10,
    'limit', 10,
    'reset_at', (now() + interval '1 hour')::text
  );
END;
$$;

-- get_style_leaderboard function used by Leaderboard
CREATE OR REPLACE FUNCTION public.get_style_leaderboard()
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  posts_count integer,
  total_likes bigint,
  badge_count bigint,
  style_score bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sp.user_id,
    sp.display_name,
    sp.avatar_url,
    sp.posts_count,
    sp.total_likes,
    COALESCE((SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = sp.user_id), 0) AS badge_count,
    (sp.total_likes + sp.posts_count * 5 + COALESCE((SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = sp.user_id), 0) * 10) AS style_score
  FROM public.social_profiles sp
  ORDER BY style_score DESC
  LIMIT 50;
$$;

-- =============================================
-- 30. Storage bucket for profile photos
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Profile photos are publicly viewable" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can update own profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own profile photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
