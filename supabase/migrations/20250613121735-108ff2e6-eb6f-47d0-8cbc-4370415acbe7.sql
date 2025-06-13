
-- Create a table for user wardrobe items
CREATE TABLE public.wardrobe_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  brand TEXT,
  size TEXT,
  image_url TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for shopping items/products
CREATE TABLE public.shopping_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT, -- ID from retailer API
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  rental_price DECIMAL(10,2),
  description TEXT,
  image_url TEXT,
  retailer_name TEXT,
  retailer_url TEXT,
  affiliate_url TEXT,
  sizes TEXT[],
  colors TEXT[],
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for user favorites/wishlist
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  shopping_item_id UUID REFERENCES public.shopping_items NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopping_item_id)
);

-- Create a table for outfit combinations
CREATE TABLE public.outfit_combinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  occasion TEXT,
  wardrobe_items UUID[], -- Array of wardrobe item IDs
  shopping_items UUID[], -- Array of shopping item IDs for missing pieces
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Wardrobe items policies
CREATE POLICY "Users can view their own wardrobe items" 
  ON public.wardrobe_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wardrobe items" 
  ON public.wardrobe_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items" 
  ON public.wardrobe_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items" 
  ON public.wardrobe_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can view their own favorites" 
  ON public.user_favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
  ON public.user_favorites 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.user_favorites 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Outfit combinations policies
CREATE POLICY "Users can view their own outfit combinations" 
  ON public.outfit_combinations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfit combinations" 
  ON public.outfit_combinations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit combinations" 
  ON public.outfit_combinations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit combinations" 
  ON public.outfit_combinations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Shopping items are public (readable by all authenticated users)
CREATE POLICY "Authenticated users can view shopping items" 
  ON public.shopping_items 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Only service role can manage shopping items (for API sync)
CREATE POLICY "Service role can manage shopping items" 
  ON public.shopping_items 
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON public.wardrobe_items(category);
CREATE INDEX idx_shopping_items_category ON public.shopping_items(category);
CREATE INDEX idx_shopping_items_retailer ON public.shopping_items(retailer_name);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_outfit_combinations_user_id ON public.outfit_combinations(user_id);
