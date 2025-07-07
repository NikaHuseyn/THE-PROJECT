
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Heart, Users } from 'lucide-react';

interface BadgeDisplayProps {
  badges: Array<{
    badge_type: string;
    badge_name: string;
    badge_description: string | null;
  }>;
  showDescription?: boolean;
  limit?: number;
}

const BadgeDisplay = ({ badges, showDescription = false, limit }: BadgeDisplayProps) => {
  const displayBadges = limit ? badges.slice(0, limit) : badges;

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'first_post':
        return <Star className="h-3 w-3" />;
      case 'active_poster':
        return <Users className="h-3 w-3" />;
      case 'popular_creator':
        return <Heart className="h-3 w-3" />;
      case 'viral_creator':
        return <Award className="h-3 w-3" />;
      default:
        return <Award className="h-3 w-3" />;
    }
  };

  const getBadgeVariant = (badgeType: string) => {
    switch (badgeType) {
      case 'first_post':
        return 'secondary' as const;
      case 'active_poster':
        return 'default' as const;
      case 'popular_creator':
        return 'destructive' as const;
      case 'viral_creator':
        return 'default' as const;
      default:
        return 'outline' as const;
    }
  };

  if (badges.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No badges earned yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge, index) => (
          <Badge
            key={index}
            variant={getBadgeVariant(badge.badge_type)}
            className="flex items-center gap-1"
          >
            {getBadgeIcon(badge.badge_type)}
            {badge.badge_name}
          </Badge>
        ))}
        {limit && badges.length > limit && (
          <Badge variant="outline" className="text-xs">
            +{badges.length - limit} more
          </Badge>
        )}
      </div>
      {showDescription && displayBadges.length > 0 && (
        <div className="space-y-1 text-xs text-gray-600">
          {displayBadges.map((badge, index) => (
            <div key={index}>
              <strong>{badge.badge_name}:</strong> {badge.badge_description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
