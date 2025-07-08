
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
      
      // Get social profiles with posts count > 0
      const { data: profiles, error } = await supabase
        .from('social_profiles')
        .select('user_id, display_name, avatar_url, posts_count')
        .gt('posts_count', 0)
        .order('posts_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Calculate scores and get total likes for each user
      const leaderboardWithScores = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get total likes for this user's posts
          const { data: postsData } = await supabase
            .from('posts')
            .select('likes_count')
            .eq('user_id', profile.user_id);

          // Get badge count for this user
          const { count: badgeCount } = await supabase
            .from('user_badges')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          const totalLikes = postsData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
          
          // Calculate score: posts * 2 + likes + badges * 5
          const score = (profile.posts_count || 0) * 2 + totalLikes + (badgeCount || 0) * 5;

          return {
            user_id: profile.user_id,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            posts_count: profile.posts_count || 0,
            total_likes: totalLikes,
            badge_count: badgeCount || 0,
            score
          };
        })
      );

      // Sort by score descending
      leaderboardWithScores.sort((a, b) => b.score - a.score);
      setLeaderboard(leaderboardWithScores);
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
