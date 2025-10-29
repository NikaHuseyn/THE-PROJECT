
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrendPrediction {
  id: string;
  trend_name: string;
  probability: number;
  timeframe: string | null;
  category: string;
  description: string | null;
  key_drivers: string[];
  risk_level: string | null;
  created_at: string;
  updated_at: string;
}

export const useTrendPredictions = () => {
  const [predictions, setPredictions] = useState<TrendPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async (category?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('trend_predictions')
        .select('*')
        .order('probability', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPredictions(data || []);
    } catch (err) {
      console.error('Error fetching trend predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('trend_predictions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trend_predictions' },
        () => {
          fetchPredictions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    predictions,
    isLoading,
    error,
    fetchPredictions,
    refetch: fetchPredictions
  };
};
