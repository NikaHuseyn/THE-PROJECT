CREATE TABLE public.cultural_dress_norms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  city text,
  context_type text NOT NULL,
  guidance text NOT NULL,
  source_url text,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_cultural_dress_country ON public.cultural_dress_norms(country);
CREATE INDEX idx_cultural_dress_context ON public.cultural_dress_norms(context_type);
CREATE UNIQUE INDEX idx_cultural_dress_unique ON public.cultural_dress_norms(country, COALESCE(city, ''), context_type);

ALTER TABLE public.cultural_dress_norms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cultural dress norms readable by all"
  ON public.cultural_dress_norms
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.cultural_dress_norms IS 'Cultural dress code guidance by country, scraped from travel resources';