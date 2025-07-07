
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FollowData {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useFollows = () => {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFollowData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get who the current user is following
      const { data: followingData } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      // Get who is following the current user
      const { data: followersData } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', user.id);

      setFollowing(followingData?.map(f => f.following_id) || []);
      setFollowers(followersData?.map(f => f.follower_id) || []);
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const isFollowing = following.includes(userId);

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .match({ follower_id: user.id, following_id: userId });

        if (error) throw error;

        setFollowing(prev => prev.filter(id => id !== userId));
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user.",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({ follower_id: user.id, following_id: userId });

        if (error) throw error;

        setFollowing(prev => [...prev, userId]);
        toast({
          title: "Following",
          description: "You are now following this user.",
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    }
  };

  const isFollowing = (userId: string) => following.includes(userId);

  useEffect(() => {
    fetchFollowData();
  }, []);

  return {
    following,
    followers,
    loading,
    toggleFollow,
    isFollowing,
    refetch: fetchFollowData
  };
};
