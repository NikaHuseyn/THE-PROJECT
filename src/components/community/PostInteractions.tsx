
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface PostInteractionsProps {
  post: {
    id: string;
    likes_count: number;
    comments_count: number;
    user_liked?: boolean;
  };
  onToggleLike: (postId: string) => void;
  onShare: (postId: string) => void;
  compact?: boolean;
}

const PostInteractions = ({ post, onToggleLike, onShare, compact = false }: PostInteractionsProps) => {
  return (
    <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-4'}`}>
      <Button
        variant="ghost"
        size={compact ? "sm" : "default"}
        onClick={() => onToggleLike(post.id)}
        className={`${
          post.user_liked 
            ? 'text-rose-600 hover:text-rose-700' 
            : 'text-gray-600 hover:text-rose-600'
        } transition-colors`}
      >
        <Heart 
          className={`h-4 w-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`} 
        />
        <span className={compact ? 'text-xs' : 'text-sm'}>
          {post.likes_count}
        </span>
      </Button>
      
      <Button
        variant="ghost"
        size={compact ? "sm" : "default"}
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        <span className={compact ? 'text-xs' : 'text-sm'}>
          {post.comments_count}
        </span>
      </Button>
      
      <Button
        variant="ghost"
        size={compact ? "sm" : "default"}
        onClick={() => onShare(post.id)}
        className="text-gray-600 hover:text-green-600 transition-colors"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PostInteractions;
