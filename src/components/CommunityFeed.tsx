
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Eye, Camera, Send, Users } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { format } from 'date-fns';

const CommunityFeed = () => {
  const { posts, loading, error, createPost, toggleLike } = useSocialPosts();
  const [newPostText, setNewPostText] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    
    try {
      setSubmitting(true);
      await createPost({
        caption: newPostText,
        tags: ['New', 'Style'],
        image_urls: ['/placeholder-outfit-new.jpg'] // Placeholder for now
      });
      
      setNewPostText('');
      setShowPostForm(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = (postId: string) => {
    console.log('Sharing post:', postId);
    // TODO: Implement sharing functionality
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return format(date, 'MMM d');
  };

  const getOccasionColor = (tags?: string[] | null) => {
    if (!tags || tags.length === 0) return 'bg-gray-100 text-gray-800';
    
    const firstTag = tags[0];
    const colors: { [key: string]: string } = {
      'Business': 'bg-blue-100 text-blue-800',
      'Brunch': 'bg-green-100 text-green-800',
      'Date': 'bg-pink-100 text-pink-800',
      'Casual': 'bg-yellow-100 text-yellow-800',
      'New': 'bg-purple-100 text-purple-800',
      'Style': 'bg-rose-100 text-rose-800'
    };
    return colors[firstTag] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Community Feed
          </h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Community Feed
          </h2>
        </div>
        <div className="text-center py-8 text-red-600">
          Error loading posts: {error}
        </div>
      </div>
    );
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
        <Card className="border-2 border-pink-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">You</span>
                </div>
                <div>
                  <p className="font-medium">Share your outfit</p>
                  <p className="text-sm text-gray-500">Show off your style to the community</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Click to upload outfit photo</p>
              </div>
              
              <Input
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Describe your outfit, occasion, or styling tips..."
                className="resize-none"
              />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPostForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={submitting || !newPostText.trim()}
                  className="bg-gradient-to-r from-pink-500 to-rose-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share your style with the community!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {post.social_profiles?.display_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {post.social_profiles?.display_name || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-gray-500">{getTimeAgo(post.created_at)} ago</p>
                    </div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <Badge className={getOccasionColor(post.tags)}>
                      {post.tags[0]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-500">Outfit Photo</span>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-1 ${post.user_liked ? 'text-red-500' : 'text-gray-600'}`}
                    >
                      <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                      <span>{post.likes_count}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleShare(post.id)}
                      className="flex items-center space-x-1 text-gray-600"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                {post.caption && (
                  <p className="text-gray-800 mb-3">{post.caption}</p>
                )}
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
