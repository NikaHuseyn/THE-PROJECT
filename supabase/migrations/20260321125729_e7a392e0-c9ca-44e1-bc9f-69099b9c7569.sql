CREATE POLICY "Service role can manage cultural dress norms"
  ON public.cultural_dress_norms
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);