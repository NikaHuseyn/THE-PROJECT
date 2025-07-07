
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PostInteractions from './PostInteractions';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
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
  };
  onToggleLike: (postId: string) => void;
  onShare: (postId: string) => void;
}

const PostCard = ({ post, onToggleLike, onShare }: PostCardProps) => {
  const displayName = post.social_profiles?.display_name || 'Anonymous User';
  const avatarUrl = post.social_profiles?.avatar_url;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* User Header */}
        <div className="p-4 flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Image */}
        {post.image_urls.length > 0 && (
          <div className="relative aspect-square">
            <img
              src={post.image_urls[0]}
              alt="Outfit post"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/placeholder.svg';
              }}
            />
            {post.image_urls.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                +{post.image_urls.length - 1}
              </div>
            )}
          </div>
        )}

        {/* Caption and Content */}
        <div className="p-4">
          {post.caption && (
            <p className="text-gray-800 mb-3 leading-relaxed">
              {post.caption}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Interactions */}
          <PostInteractions
            post={post}
            onToggleLike={onToggleLike}
            onShare={onShare}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
