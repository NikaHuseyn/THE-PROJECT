-- Create rate limiting table for AI recommendations
CREATE TABLE public.ai_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  requests_count INTEGER NOT NULL DEFAULT 0,
  last_request_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.ai_usage_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage limits"
ON public.ai_usage_limits
FOR SELECT
USING (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Service can manage usage limits"
ON public.ai_usage_limits
FOR ALL
USING (true);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
  user_email TEXT,
  target_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage RECORD;
  rate_limit INTEGER;
  window_hours INTEGER := 24; -- 24-hour window
  is_allowed BOOLEAN := false;
  remaining_requests INTEGER := 0;
  reset_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Define rate limits based on subscription tier
  rate_limit := CASE 
    WHEN (SELECT subscription_tier FROM public.ai_usage_limits WHERE email = user_email) = 'premium' THEN 50
    WHEN (SELECT subscription_tier FROM public.ai_usage_limits WHERE email = user_email) = 'pro' THEN 100
    ELSE 5 -- free tier
  END;

  -- Get or create usage record
  INSERT INTO public.ai_usage_limits (user_id, email, subscription_tier)
  VALUES (target_user_id, user_email, 'free')
  ON CONFLICT (email) 
  DO UPDATE SET updated_at = now()
  RETURNING * INTO current_usage;

  IF current_usage IS NULL THEN
    SELECT * INTO current_usage FROM public.ai_usage_limits WHERE email = user_email;
  END IF;

  -- Check if we need to reset the window
  IF current_usage.window_start < (now() - (window_hours || ' hours')::INTERVAL) THEN
    UPDATE public.ai_usage_limits 
    SET 
      requests_count = 0,
      window_start = now(),
      updated_at = now()
    WHERE email = user_email
    RETURNING * INTO current_usage;
  END IF;

  -- Check if under rate limit
  IF current_usage.requests_count < rate_limit THEN
    is_allowed := true;
    remaining_requests := rate_limit - current_usage.requests_count - 1;
    
    -- Increment counter
    UPDATE public.ai_usage_limits 
    SET 
      requests_count = requests_count + 1,
      last_request_at = now(),
      updated_at = now()
    WHERE email = user_email;
  ELSE
    remaining_requests := 0;
  END IF;

  reset_time := current_usage.window_start + (window_hours || ' hours')::INTERVAL;

  RETURN json_build_object(
    'allowed', is_allowed,
    'remaining_requests', remaining_requests,
    'rate_limit', rate_limit,
    'current_usage', current_usage.requests_count,
    'reset_time', reset_time,
    'subscription_tier', current_usage.subscription_tier
  );
END;
$$;

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, cancelled
  payment_type TEXT NOT NULL, -- 'one_time', 'subscription'
  product_type TEXT NOT NULL, -- 'ai_credits', 'premium_subscription', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for payment transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for payment transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
USING (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Service can manage transactions"
ON public.payment_transactions
FOR ALL
USING (true);

-- Create function to upgrade user after successful payment
CREATE OR REPLACE FUNCTION public.upgrade_user_subscription(
  user_email TEXT,
  new_tier TEXT,
  target_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ai_usage_limits 
  SET 
    subscription_tier = new_tier,
    updated_at = now()
  WHERE email = user_email;

  RETURN FOUND;
END;
$$;