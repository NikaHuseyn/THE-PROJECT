
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Users } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import PostCreationForm from './community/PostCreationForm';
import PostCard from './community/PostCard';
import EmptyState from './community/EmptyState';
import LoadingState from './community/LoadingState';
import ErrorState from './community/ErrorState';

const CommunityFeed = () => {
  const { posts, loading, error, createPost, toggleLike } = useSocialPosts();
  const [showPostForm, setShowPostForm] = useState(false);

  const handleShare = (postId: string) => {
    console.log('Sharing post:', postId);
    // TODO: Implement sharing functionality
  };

  const handleCreatePost = async (postData: { caption: string; tags?: string[]; image_urls: string[] }): Promise<void> => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Community Feed
          </h2>
          <p className="text-gray-600">Get inspired by the community and share your style</p>
        </div>
        <Button
          onClick={() => setShowPostForm(!showPostForm)}
          className="bg-gradient-to-r from-pink-500 to-rose-600"
        >
          <Camera className="h-4 w-4 mr-2" />
          Share Outfit
        </Button>
      </div>

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
  );
};

export default CommunityFeed;
