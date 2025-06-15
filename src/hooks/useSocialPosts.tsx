
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBehaviorAnalytics } from './useBehaviorAnalytics';

interface SocialPost {
  id: string;
  user_id: string;
  image_urls: string[];
  caption: string | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  social_profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  user_liked?: boolean;
}

interface CreatePostData {
  caption: string;
  tags?: string[];
  image_urls: string[];
}

export const useSocialPosts = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useBehaviorAnalytics();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // First get posts with social profiles
      const { data: postsData, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          social_profiles (
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Then get likes for each post if user is authenticated
      let postsWithLikeStatus = postsData || [];
      
      if (user && postsData) {
        const postIds = postsData.map(post => post.id);
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id);

        const likedPostIds = new Set(likesData?.map(like => like.post_id) || []);
        
        postsWithLikeStatus = postsData.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id)
        }));
      }

      setPosts(postsWithLikeStatus as SocialPost[]);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          caption: postData.caption,
          tags: postData.tags || [],
          image_urls: postData.image_urls,
        })
        .select()
        .single();

      if (error) throw error;

      trackEvent({
        event_type: 'community_post_create',
        event_data: { 
          post_id: data.id,
          has_images: postData.image_urls.length > 0,
          caption_length: postData.caption.length 
        }
      });

      fetchPosts(); // Refresh posts
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }

      trackEvent({
        event_type: 'community_post_like',
        event_data: { 
          post_id: postId,
          action: post.user_liked ? 'unlike' : 'like'
        }
      });

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              user_liked: !p.user_liked,
              likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    toggleLike,
    refetch: fetchPosts
  };
};
