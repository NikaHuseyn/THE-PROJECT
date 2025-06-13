
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Eye, Camera, Send, Users } from 'lucide-react';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';

interface CommunityPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  image: string;
  caption: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  liked: boolean;
  occasion?: string;
}

const CommunityFeed = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      user: { name: 'Sarah Chen', avatar: '/placeholder-avatar-1.jpg', verified: true },
      image: '/placeholder-outfit-feed-1.jpg',
      caption: 'Perfect outfit for today\'s client meeting! Feeling confident and professional 💼✨',
      tags: ['Business', 'Professional', 'Confidence'],
      likes: 234,
      comments: 18,
      shares: 12,
      timeAgo: '2h',
      liked: false,
      occasion: 'Business Meeting'
    },
    {
      id: '2',
      user: { name: 'Emma Rodriguez', avatar: '/placeholder-avatar-2.jpg', verified: false },
      image: '/placeholder-outfit-feed-2.jpg',
      caption: 'Brunch vibes with the girls! This floral dress is everything 🌸',
      tags: ['Casual', 'Brunch', 'Floral'],
      likes: 156,
      comments: 23,
      shares: 8,
      timeAgo: '4h',
      liked: true,
      occasion: 'Brunch'
    }
  ]);
  
  const [newPostText, setNewPostText] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const { trackEvent } = useBehaviorAnalytics();

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));

    trackEvent({
      event_type: 'community_post_like',
      event_data: { post_id: postId }
    });
  };

  const handleShare = (postId: string) => {
    trackEvent({
      event_type: 'community_post_share',
      event_data: { post_id: postId }
    });
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      user: { name: 'You', avatar: '/placeholder-avatar-you.jpg', verified: false },
      image: '/placeholder-outfit-new.jpg',
      caption: newPostText,
      tags: ['New', 'Style'],
      likes: 0,
      comments: 0,
      shares: 0,
      timeAgo: 'now',
      liked: false
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    setShowPostForm(false);

    trackEvent({
      event_type: 'community_post_create',
      event_data: { has_image: true, caption_length: newPostText.length }
    });
  };

  const getOccasionColor = (occasion?: string) => {
    if (!occasion) return 'bg-gray-100 text-gray-800';
    
    const colors: { [key: string]: string } = {
      'Business Meeting': 'bg-blue-100 text-blue-800',
      'Brunch': 'bg-green-100 text-green-800',
      'Date Night': 'bg-pink-100 text-pink-800',
      'Casual': 'bg-yellow-100 text-yellow-800'
    };
    return colors[occasion] || 'bg-gray-100 text-gray-800';
  };

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
                  className="bg-gradient-to-r from-pink-500 to-rose-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {post.user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <p className="font-medium">{post.user.name}</p>
                      {post.user.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{post.timeAgo} ago</p>
                  </div>
                </div>
                {post.occasion && (
                  <Badge className={getOccasionColor(post.occasion)}>
                    {post.occasion}
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
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 ${post.liked ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-1 text-gray-600"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{post.shares}</span>
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-gray-800 mb-3">{post.caption}</p>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-8">
        <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
          Load More Posts
        </Button>
      </div>
    </div>
  );
};

export default CommunityFeed;
