
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FashionTrend {
  id: string;
  name: string;
  category: string;
  trend_score: number;
  growth_rate: string | null;
  popularity_rank: number | null;
  season: string | null;
  occasions: string[];
  colors: string[];
  description: string | null;
  image_url: string | null;
  source: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useFashionTrends = () => {
  const [trends, setTrends] = useState<FashionTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async (category?: string, season?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('fashion_trends')
        .select('*')
        .order('trend_score', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (season) {
        query = query.eq('season', season);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTrends(data || []);
    } catch (err) {
      console.error('Error fetching fashion trends:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trends');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return {
    trends,
    isLoading,
    error,
    fetchTrends,
    refetch: fetchTrends
  };
};
