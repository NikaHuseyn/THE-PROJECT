
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Eye, Camera } from 'lucide-react';
import { format } from 'date-fns';

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

interface PostCardProps {
  post: SocialPost;
  onToggleLike: (postId: string) => void;
  onShare: (postId: string) => void;
}

const PostCard = ({ post, onToggleLike, onShare }: PostCardProps) => {
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
              onClick={() => onToggleLike(post.id)}
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
              onClick={() => onShare(post.id)}
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
  );
};

export default PostCard;
