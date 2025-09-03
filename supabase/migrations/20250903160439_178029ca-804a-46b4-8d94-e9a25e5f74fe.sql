-- Create capsule wardrobes table
CREATE TABLE public.capsule_wardrobes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  season TEXT,
  occasion TEXT,
  color_scheme JSONB,
  wardrobe_item_ids UUID[] NOT NULL DEFAULT '{}',
  max_items INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.capsule_wardrobes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own capsule wardrobes" 
ON public.capsule_wardrobes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own capsule wardrobes" 
ON public.capsule_wardrobes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own capsule wardrobes" 
ON public.capsule_wardrobes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own capsule wardrobes" 
ON public.capsule_wardrobes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_capsule_wardrobes_updated_at
BEFORE UPDATE ON public.capsule_wardrobes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();