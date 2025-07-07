
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'default' | 'lg';
}

const FollowButton = ({ userId, size = 'sm' }: FollowButtonProps) => {
  const { isFollowing, toggleFollow, loading } = useFollows();

  const handleClick = () => {
    toggleFollow(userId);
  };

  const following = isFollowing(userId);

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      size={size}
      variant={following ? 'outline' : 'default'}
      className={`flex items-center gap-1 ${
        following 
          ? 'text-gray-600 hover:text-red-600 hover:border-red-300' 
          : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'
      }`}
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
