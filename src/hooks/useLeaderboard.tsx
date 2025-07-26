
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  posts_count: number;
  total_likes: number;
  badge_count: number;
  score: number;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Use the new secure function that respects RLS policies
      const { data: leaderboardData, error } = await supabase
        .rpc('get_style_leaderboard');

      if (error) throw error;

      // Transform the data to match the expected interface
      const formattedLeaderboard = (leaderboardData || []).map((entry) => ({
        user_id: entry.user_id,
        display_name: entry.display_name,
        avatar_url: entry.avatar_url,
        posts_count: entry.posts_count,
        total_likes: Number(entry.total_likes),
        badge_count: Number(entry.badge_count),
        score: Number(entry.style_score)
      }));

      setLeaderboard(formattedLeaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard
  };
};
