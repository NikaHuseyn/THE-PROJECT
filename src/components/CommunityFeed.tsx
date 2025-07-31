
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Users } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import PostCreationForm from './community/PostCreationForm';
import PostCard from './community/PostCard';
import EmptyState from './community/EmptyState';
import LoadingState from './community/LoadingState';
import ErrorState from './community/ErrorState';
import CommunityStats from './community/CommunityStats';
import Leaderboard from './community/Leaderboard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CommunityFeed = () => {
  const { posts, loading, error, createPost, toggleLike } = useSocialPosts();
  const { toast } = useToast();
  const [showPostForm, setShowPostForm] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    activeUsers: 0
  });

  const fetchCommunityStats = async () => {
    try {
      // Get total posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Get total likes
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true });

      // Get total comments
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Get active users (users who have posted)
      const { count: activeUsersCount } = await supabase
        .from('social_profiles')
        .select('*', { count: 'exact', head: true })
        .gt('posts_count', 0);

      setStats({
        totalPosts: postsCount || 0,
        totalLikes: likesCount || 0,
        totalComments: commentsCount || 0,
        activeUsers: activeUsersCount || 0
      });
    } catch (err) {
      // Silently handle stats loading errors
      setStats({
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        activeUsers: 0
      });
    }
  };

  useEffect(() => {
    fetchCommunityStats();
  }, [posts]);

  const handleShare = async (postId: string) => {
    try {
      // Find the post data
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Create share URL
      const shareUrl = `${window.location.origin}/community?post=${postId}`;
      const shareText = `Check out this stylish outfit post!${post.caption ? ' ' + post.caption : ''}`;

      // Try to use native Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Style Community Post',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      // Silent fallback if sharing fails
      try {
        const post = posts.find(p => p.id === postId);
        const shareUrl = `${window.location.origin}/community?post=${postId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to your clipboard.",
        });
      } catch {
        toast({
          title: "Share Failed",
          description: "Unable to share this post. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreatePost = async (postData: { caption: string; tags?: string[]; image_urls: string[] }): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to auth if user tries to post without being signed in
      window.location.href = '/auth';
      return;
    }
    await createPost(postData);
    setShowPostForm(false);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Community Feed
            </h2>
            <p className="text-gray-600">Get inspired by the community and share your style</p>
          </div>
          <Button
            onClick={() => {
              const checkAuth = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  window.location.href = '/auth';
                  return;
                }
                setShowPostForm(!showPostForm);
              };
              checkAuth();
            }}
            className="bg-gradient-to-r from-pink-500 to-rose-600"
          >
            <Camera className="h-4 w-4 mr-2" />
            Share Outfit
          </Button>
        </div>

        <CommunityStats stats={stats} />

        {showPostForm && (
          <PostCreationForm
            onCreatePost={handleCreatePost}
            onClose={() => setShowPostForm(false)}
          />
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleLike={toggleLike}
                onShare={handleShare}
              />
            ))
          )}
        </div>

        {posts.length > 0 && (
          <div className="text-center py-8">
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              Load More Posts
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Leaderboard />
      </div>
    </div>
  );
};

export default CommunityFeed;
