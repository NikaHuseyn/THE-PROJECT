
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ColorPalette {
  name: string;
  hex: string;
}

interface SeasonalForecast {
  id: string;
  season: string;
  year: number;
  confidence_score: number;
  key_trends: string[];
  color_palette: ColorPalette[] | null;
  must_have_items: string[];
  description: string | null;
  influencing_factors: string[];
  created_at: string;
  updated_at: string;
}

export const useSeasonalForecasts = () => {
  const [forecasts, setForecasts] = useState<SeasonalForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('seasonal_forecasts')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to match our interface with proper type checking
      const transformedData: SeasonalForecast[] = (data || []).map(item => ({
        ...item,
        color_palette: Array.isArray(item.color_palette) 
          ? item.color_palette as unknown as ColorPalette[] 
          : null
      }));

      setForecasts(transformedData);
    } catch (err) {
      console.error('Error fetching seasonal forecasts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch forecasts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('seasonal_forecasts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seasonal_forecasts' },
        () => {
          fetchForecasts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    forecasts,
    isLoading,
    error,
    fetchForecasts,
    refetch: fetchForecasts
  };
};
